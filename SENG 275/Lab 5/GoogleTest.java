import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GoogleTest {
    WebDriver browser;

    @BeforeEach
    public void setUp() {
        String chromeDriverPath = System.getProperty("user.dir")+"\\driver\\chromedriver-win64\\chromedriver.exe";
        // Chrome
        System.setProperty("webdriver.chrome.driver", chromeDriverPath);
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        browser = new ChromeDriver(options);

        // Firefox
        // System.setProperty("webdriver.gecko.driver", "*****LOCATION OF YOUR WEBDRIVER*****");
        // browser = new FirefoxDriver();

        // Safari
        // browser = new SafariDriver();

        browser.manage().window().maximize();
    }

    @AfterEach
    public void cleanUp() {
        browser.quit();
    }

    @Test
    public void googlePageLoads() {
        browser.get("https://www.google.com");
        assertEquals("Google", browser.getTitle());
    }

    @Test
    public void googleSearchBoxAppears() {
        browser.get("https://www.google.com");
        WebElement inputBox = browser.findElement(By.name("q"));                    // by name - this works
        //WebElement inputBox = browser.findElement(By.className("gLFyf"));   // by className - this works
        //WebElement inputBox = browser.findElement(By.cssSelector(".gLFyf"));     // by cssSelector (aka style) - this works
        //WebElement inputBox = browser.findElement(By.xpath("/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/textarea"));
        // by xpath - this works
        assertTrue(inputBox.isEnabled());
    }

    @Test
    public void googleSearchButtonAppears() {
        browser.get("https://www.google.com");
        WebElement searchButton = browser.findElement(By.xpath("/html/body/div[1]/div[3]/form/div[1]/div[1]/div[4]/center/input[1]"));
        assertTrue(searchButton.isEnabled());
    }
    @Test
    public void googleSearchTermAppears() {
        browser.get("https://www.google.com");
        WebElement inputBox = browser.findElement(By.xpath("/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/textarea"));
        inputBox.sendKeys("uvic");
        assertEquals("uvic", inputBox.getAttribute("value"));
    }

    @Test
    public void googleSearchResultsAppear() {
        browser.get("https://www.google.com");
        WebElement inputBox = browser.findElement(By.xpath("/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/textarea"));
        WebElement searchButton = browser.findElement(By.xpath("/html/body/div[1]/div[3]/form/div[1]/div[1]/div[4]/center/input[1]"));
        inputBox.sendKeys("uvic");
        searchButton.submit();
        new WebDriverWait(browser, Duration.ofSeconds(5)).until(ExpectedConditions.titleIs("uvic - Google Search"));
        assertEquals("uvic - Google Search", browser.getTitle());
    }
}


