import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";

/**
 * Screenshot and Video Generator for Local Law App
 *
 * Configuration via Environment Variables:
 * - PORT: Dev server port (default: 5174)
 * - ENABLE_VIDEO: Set to "false" to disable video recording (default: true)
 * - ACTION_DELAY: Delay between major actions in milliseconds (default: 1000)
 * - NAVIGATION_DELAY: Delay after page navigation in milliseconds (default: 2000)
 * - CLICK_DELAY: Delay after clicks in milliseconds (default: 500)
 *
 * Examples:
 * npm run screenshots                                    # Default settings with video
 * ENABLE_VIDEO=false npm run screenshots                 # Screenshots only, no video
 * ACTION_DELAY=2000 npm run screenshots                  # Slower paced for better viewing
 * ACTION_DELAY=500 CLICK_DELAY=200 npm run screenshots   # Faster paced
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateScreenshots() {
  console.log("🚀 Starting screenshot generation...");

  // Configuration options
  const CONFIG = {
    PORT: process.env.PORT || "5174",
    ENABLE_VIDEO: process.env.ENABLE_VIDEO !== "false", // Set ENABLE_VIDEO=false to disable
    ACTION_DELAY: parseInt(process.env.ACTION_DELAY) || 2000, // Delay between actions in ms
    NAVIGATION_DELAY: parseInt(process.env.NAVIGATION_DELAY) || 3500, // Delay after navigation in ms
    CLICK_DELAY: parseInt(process.env.CLICK_DELAY) || 1000, // Delay after clicks in ms
  };

  console.log("⚙️ Configuration:", {
    ...CONFIG,
    ENABLE_VIDEO: CONFIG.ENABLE_VIDEO ? "✅ Enabled" : "❌ Disabled",
  });

  // Create directories
  const screenshotDir = path.join(__dirname, "screenshots");
  const videoDir = path.join(__dirname, "videos");

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  if (CONFIG.ENABLE_VIDEO && !fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const contextOptions = {
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    deviceScaleFactor: 2,
  };

  // Add video recording if enabled
  if (CONFIG.ENABLE_VIDEO) {
    contextOptions.recordVideo = {
      dir: videoDir,
      size: { width: 375, height: 812 },
    };
    console.log("🎥 Video recording enabled");
  }

  const context = await browser.newContext(contextOptions);

  const page = await context.newPage();

  // Navigate to the app
  try {
    console.log(`🌐 Connecting to http://localhost:${CONFIG.PORT}...`);
    await page.goto(`http://localhost:${CONFIG.PORT}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(CONFIG.NAVIGATION_DELAY);
  } catch (error) {
    console.error(`❌ Failed to connect to localhost:${CONFIG.PORT}`);
    console.error("Make sure your dev server is running with: npm run dev");
    await browser.close();
    return;
  }

  console.log("📸 Capturing screenshots...");

  // Helper functions for delays and human-like interactions
  const delay = (ms = CONFIG.ACTION_DELAY) => page.waitForTimeout(ms);
  const clickDelay = (ms = CONFIG.CLICK_DELAY) => page.waitForTimeout(ms);

  // Human-like typing function
  const humanType = async (locator, text, options = {}) => {
    const { delay: typeDelay = 80, variance = 40 } = options;
    await locator.click(); // Focus the input
    await page.waitForTimeout(200);

    for (const char of text) {
      await locator.type(char);
      // Add random variance to typing speed to make it more human-like
      const randomDelay = typeDelay + Math.random() * variance;
      await page.waitForTimeout(randomDelay);
    }
  };

  // Human-like scrolling function
  const humanScroll = async (direction = "down", distance = "partial") => {
    const scrollAmount =
      distance === "full" ? "document.body.scrollHeight" : "300";
    const steps = 5; // Number of scroll steps for smooth movement

    for (let i = 0; i < steps; i++) {
      await page.evaluate(
        ({ direction, scrollAmount, step, steps }) => {
          const currentScroll = window.pageYOffset;
          const targetScroll =
            direction === "down"
              ? scrollAmount === "document.body.scrollHeight"
                ? document.body.scrollHeight
                : currentScroll + parseInt(scrollAmount)
              : Math.max(0, currentScroll - parseInt(scrollAmount));

          const scrollStep =
            direction === "down"
              ? currentScroll +
                ((targetScroll - currentScroll) * (step + 1)) / steps
              : currentScroll -
                ((currentScroll - targetScroll) * (step + 1)) / steps;

          window.scrollTo({
            top: scrollStep,
            behavior: "smooth",
          });
        },
        { direction, scrollAmount, step: i, steps }
      );

      await page.waitForTimeout(150); // Pause between scroll steps
    }
    await page.waitForTimeout(300); // Final pause after scrolling
  };

  // Visual click indicator function
  const showClickIndicator = async (x, y) => {
    await page.evaluate(
      ({ x, y }) => {
        // Create click indicator element
        const indicator = document.createElement("div");
        indicator.style.cssText = `
        position: fixed;
        left: ${x - 15}px;
        top: ${y - 15}px;
        width: 30px;
        height: 30px;
        background-color: rgba(128, 128, 128, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        animation: clickPulse 2s ease-out forwards;
      `;

        // Add animation keyframes if not already present
        if (!document.getElementById("click-indicator-styles")) {
          const style = document.createElement("style");
          style.id = "click-indicator-styles";
          style.textContent = `
          @keyframes clickPulse {
            0% {
              transform: scale(0.5);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.6;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
        `;
          document.head.appendChild(style);
        }

        document.body.appendChild(indicator);

        // Remove indicator after animation
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
          }
        }, 2000);
      },
      { x, y }
    );
  };

  // Enhanced click function with visual indicator
  const clickWithIndicator = async (locator) => {
    // Get the element's bounding box
    const box = await locator.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      // Show click indicator
      await showClickIndicator(x, y);

      // Perform the actual click
      await locator.click();

      // Wait a bit to show the indicator
      await page.waitForTimeout(300);
    } else {
      // Fallback to regular click if bounding box not available
      await locator.click();
    }
  };

  // Wait for the location selection dialog and capture it
  await page.waitForSelector(".location-dialog", { timeout: 5000 });
  await delay();

  // 1. Landing page (location selection dialog - initial state)
  await page.screenshot({
    path: path.join(screenshotDir, "01-landing-page.png"),
    fullPage: true,
  });
  console.log("✅ 01-landing-page.png");
  await delay();

  // Type "Saanich" in the search input to show the location option
  const searchInput = page.locator(".location-search-input");
  await humanType(searchInput, "Saanich", { delay: 120, variance: 60 });
  await clickDelay();

  // Wait for search results to appear
  await page.waitForSelector(".location-result-item", { timeout: 3000 });
  await delay();

  // 2. Landing page with search results
  await page.screenshot({
    path: path.join(screenshotDir, "02-landing-search-results.png"),
    fullPage: true,
  });
  console.log("✅ 02-landing-search-results.png");
  await delay();

  // Click on Saanich result
  const saanichResult = page
    .locator(".location-result-item")
    .filter({ hasText: "Saanich" });
  await clickWithIndicator(saanichResult);
  await clickDelay();

  // Click Continue button
  const continueButton = page.locator("button").filter({ hasText: "Continue" });
  await clickWithIndicator(continueButton);
  await clickDelay();

  // Wait for home page to load
  await page.waitForSelector(".page-title", { timeout: 5000 });
  await delay();

  // 3. Home page (default state)
  await page.screenshot({
    path: path.join(screenshotDir, "03-home-page.png"),
    fullPage: true,
  });
  console.log("✅ 03-home-page.png");
  await delay();

  // 4. Home page with filter button active
  const filterButton = page.locator("button").filter({ hasText: "Filter" });
  await clickWithIndicator(filterButton);
  await clickDelay();
  await page.screenshot({
    path: path.join(screenshotDir, "04-home-filter-active.png"),
    fullPage: true,
  });
  console.log("✅ 04-home-filter-active.png");
  await delay();

  // Close filter dropdown
  await clickWithIndicator(filterButton);
  await clickDelay();

  // 5. Law detail view (click on a law card to open the modal)
  const firstLawCard = page.locator(".law-card").first();
  await clickWithIndicator(firstLawCard);
  await page.waitForSelector(".law-detail-modal", { timeout: 3000 });
  await page.waitForTimeout(500); // Wait for animation to complete
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "05-law-detail-view.png"),
    fullPage: true,
  });
  console.log("✅ 05-law-detail-view.png");
  await delay();

  // Close the law detail modal
  const closeButton = page.locator(".close-button");
  await clickWithIndicator(closeButton);
  await page.waitForTimeout(500); // Wait for modal to close
  await clickDelay();

  // 6. Search tab screen
  const searchTab = page.locator('a[href="/search"]');
  await clickWithIndicator(searchTab);
  await page.waitForSelector(".category-grid", { timeout: 3000 });
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "06-search-page.png"),
    fullPage: true,
  });
  console.log("✅ 06-search-page.png");
  await delay();

  // 7. Calendar screen (click on Events category which triggers calendar)
  const eventsCategory = page
    .locator(".category-item")
    .filter({ hasText: "Events" });
  await clickWithIndicator(eventsCategory);
  await page.waitForSelector(".calendar-fullscreen", { timeout: 3000 });
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "07-calendar-screen.png"),
    fullPage: true,
  });
  console.log("✅ 07-calendar-screen.png");
  await delay();

  // Close calendar modal
  const closeCalendar = page.locator(".calendar-close-btn");
  await clickWithIndicator(closeCalendar);
  await clickDelay();

  // 8. Game tab screen (menu)
  const gameTab = page.locator('a[href="/game"]');
  await clickWithIndicator(gameTab);
  await page.waitForSelector(".page-title", { timeout: 3000 });
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "08-game-menu.png"),
    fullPage: true,
  });
  console.log("✅ 08-game-menu.png");
  await delay();

  // 9. Game in progress
  const startQuizButton = page
    .locator("button")
    .filter({ hasText: "Start Quiz" });
  await clickWithIndicator(startQuizButton);
  await page.waitForSelector(".quiz-container", { timeout: 3000 });
  await delay();

  // Select an answer
  const firstOption = page.locator(".quiz-option").first();
  await clickWithIndicator(firstOption);
  await clickDelay();
  await page.screenshot({
    path: path.join(screenshotDir, "09-game-in-progress.png"),
    fullPage: true,
  });
  console.log("✅ 09-game-in-progress.png");
  await delay();

  // Submit answer and show feedback
  const submitButton = page
    .locator("button")
    .filter({ hasText: "Submit Answer" });
  await clickWithIndicator(submitButton);
  await page.waitForSelector(".quiz-feedback", { timeout: 3000 });
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "10-game-feedback.png"),
    fullPage: true,
  });
  console.log("✅ 10-game-feedback.png");
  await delay();

  // 10. Complete the quiz to get results screen
  console.log("🎮 Completing quiz for results screen...");

  // Let's manually complete the quiz step by step
  for (let questionNum = 2; questionNum <= 6; questionNum++) {
    // Increased to 6 to handle the final "View Results"
    try {
      console.log(`   Working on question ${questionNum}`);

      // First, scroll down to find navigation buttons using human-like scrolling
      await humanScroll("down", "full");
      await page.waitForTimeout(1000); // Wait 1s for scroll to complete and user to see

      const viewResultsBtn = page
        .locator("button")
        .filter({ hasText: "View Results" });
      const nextQuestionBtn = page
        .locator("button")
        .filter({ hasText: "Next Question" });

      console.log(
        `   Looking for buttons - View Results: ${await viewResultsBtn.count()}, Next Question: ${await nextQuestionBtn.count()}`
      );

      if ((await viewResultsBtn.count()) > 0) {
        await viewResultsBtn.scrollIntoViewIfNeeded();
        await clickWithIndicator(viewResultsBtn);
        console.log("   🎉 Clicked View Results button!");
        await page.waitForTimeout(3000); // Even longer wait for results to load
        break;
      } else if ((await nextQuestionBtn.count()) > 0) {
        await nextQuestionBtn.scrollIntoViewIfNeeded();
        await clickWithIndicator(nextQuestionBtn);
        console.log(`   Moved to question ${questionNum}`);
      } else {
        console.log("   No navigation buttons found - quiz may be complete");
        break;
      }

      // Only try to answer if we're still in the quiz (not on results)
      if (questionNum <= 5) {
        // Wait for the new question to load and scroll back to top using human-like scrolling
        await page.waitForTimeout(1500);
        await humanScroll("up", "full");
        await page.waitForTimeout(1000); // Wait 1s for scroll to complete and user to see

        // Select an answer (first option)
        const firstOption = page.locator(".quiz-option").first();
        if ((await firstOption.count()) > 0) {
          await clickWithIndicator(firstOption);
          console.log("   Selected answer"); // Submit the answer
          const submitBtn = page
            .locator("button")
            .filter({ hasText: "Submit Answer" });
          if ((await submitBtn.count()) > 0) {
            await clickWithIndicator(submitBtn);
            console.log("   Submitted answer");
            await page.waitForTimeout(2000); // Wait longer for feedback to appear
            await clickDelay();
          }
        }
      }
    } catch (error) {
      console.log(`   Error on question ${questionNum}:`, error.message);
      break;
    }
  }

  // Try to find and screenshot results
  try {
    await page.waitForSelector(".results-container", { timeout: 5000 });
    await delay();
    await page.screenshot({
      path: path.join(screenshotDir, "11-game-results.png"),
      fullPage: true,
    });
    console.log("✅ 11-game-results.png");
  } catch (error) {
    console.log(
      "⚠️  Could not find results container, taking current page screenshot"
    );
    await page.screenshot({
      path: path.join(screenshotDir, "11-game-current.png"),
      fullPage: true,
    });
    console.log("✅ 11-game-current.png (fallback)");
  }
  await delay();

  // 11. Settings screen
  const settingsTab = page.locator('a[href="/settings"]');
  await clickWithIndicator(settingsTab);
  await page.waitForSelector(".page-title", { timeout: 3000 });
  await delay();
  await page.screenshot({
    path: path.join(screenshotDir, "12-settings-page.png"),
    fullPage: true,
  });
  console.log("✅ 12-settings-page.png");
  await delay();

  // Bonus: Search with search bar (if it exists)
  try {
    await clickWithIndicator(searchTab);
    await delay();
    const searchInput = page.locator('input[type="text"]');
    if ((await searchInput.count()) > 0) {
      await humanType(searchInput, "helmet", { delay: 100, variance: 50 });
      await clickDelay();
      await page.screenshot({
        path: path.join(screenshotDir, "13-search-with-text.png"),
        fullPage: true,
      });
      console.log("✅ 13-search-with-text.png");
    }
  } catch (error) {
    console.log("ℹ️  Search input not found, skipping search text screenshot");
  }

  // Get video path before closing (if recording)
  let videoPath = null;
  if (CONFIG.ENABLE_VIDEO) {
    try {
      videoPath = await page.video().path();
    } catch (error) {
      console.log("⚠️  Could not get video path:", error.message);
    }
  }

  await browser.close();

  console.log("🎉 Screenshot generation complete!");
  console.log(`📁 Screenshots saved to: ${screenshotDir}`);

  if (CONFIG.ENABLE_VIDEO && videoPath) {
    console.log(`🎥 Video saved to: ${videoPath}`);
  }

  // List all generated screenshots
  const files = fs.readdirSync(screenshotDir).filter((f) => f.endsWith(".png"));
  console.log("\n📋 Generated screenshots:");
  files.forEach((file) => console.log(`   ${file}`));

  // List video files if enabled
  if (CONFIG.ENABLE_VIDEO && fs.existsSync(videoDir)) {
    const videoFiles = fs
      .readdirSync(videoDir)
      .filter((f) => f.endsWith(".webm"));
    if (videoFiles.length > 0) {
      console.log("\n🎬 Generated videos:");
      videoFiles.forEach((file) => console.log(`   ${file}`));
    }
  }
}

generateScreenshots().catch((error) => {
  console.error("❌ Error generating screenshots:", error);
  process.exit(1);
});
