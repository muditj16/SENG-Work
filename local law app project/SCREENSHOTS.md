# Screenshot Generation for Local Law App

This document explains how to generate comprehensive screenshots of the Local Law mobile app prototype using Playwright.

## Overview

The screenshot system automatically captures all major app states and user flows, providing a complete visual documentation of the app's functionality. This is particularly useful for:

- Creating design documentation
- Generating marketing materials
- QA testing visual consistency
- Client presentations
- Development progress tracking

## Setup

Playwright has been added to the project and configured to capture screenshots at mobile dimensions (iPhone X: 375x812px).

## Prerequisites

1. Make sure your development server is running:

   ```bash
   npm run dev
   ```

2. The app should be accessible at `http://localhost:5174` (or the port shown in your dev server)

## Generating Screenshots

### Option 1: Using VS Code Task

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Tasks: Run Task"
3. Select "Generate Screenshots"

### Option 2: Using Terminal

```bash
npm run screenshots
```

### Option 3: Direct Node.js

```bash
node screenshot-generator.js
```

## Generated Screenshots

The script will capture the following screens:

1. **01-home-page.png** - Default home page after location selection
2. **02-home-filter-active.png** - Home page with filter dropdown open
3. **03-search-page.png** - Search page with category grid
4. **04-calendar-screen.png** - Calendar modal overlay
5. **05-game-menu.png** - Game tab main menu
6. **06-game-in-progress.png** - Quiz question with selected answer
7. **07-game-feedback.png** - Quiz feedback after submitting answer
8. **08-game-results.png** - Final quiz results screen
9. **09-settings-page.png** - Settings page
10. **10-search-with-text.png** - Search page with text input (if available)

## Output Location

Screenshots are saved to the `screenshots/` directory in the project root.

## Troubleshooting

### "Failed to connect to localhost:5174"

- Make sure the development server is running with `npm run dev`
- Check that the port 5174 is not blocked (or update the script if your dev server uses a different port)
- Wait for the dev server to fully start before running screenshots

### Missing Screenshots

- The script includes error handling and will skip problematic screens
- Check the console output for specific error messages
- Some screenshots depend on previous navigation steps

### Slow Performance

- The script includes appropriate wait times for page loads
- Mobile viewport rendering may take longer than desktop
- Network timeouts are set to handle slower connections

## Customization

To modify the screenshot script:

1. Edit `screenshot-generator.js`
2. Adjust viewport dimensions in the browser context
3. Add new screenshot steps by following the existing pattern
4. Update wait selectors if UI elements change

## Technical Details

- **Browser**: Chromium (headless)
- **Viewport**: 375x812px (iPhone X)
- **Device Scale Factor**: 2x (Retina)
- **Format**: PNG with full page capture
- **Timeout**: 5 seconds for most page loads
