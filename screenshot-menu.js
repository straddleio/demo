const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Click the MENU button
  await page.click('button:has-text("MENU")');

  // Wait for menu to open
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'flexoki-menu-open.png', fullPage: true });

  await browser.close();
})();
