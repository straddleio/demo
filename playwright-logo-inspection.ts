import { chromium } from 'playwright';

async function inspectLogo() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for terminal to load
  await page.waitForSelector('.bg-background-dark', { timeout: 10000 });

  // Take screenshot of the full terminal
  await page.screenshot({
    path: 'terminal-before-logo-fix.png',
    fullPage: true
  });

  // Inspect the logo element
  const logoElement = page.locator('img[alt="NerdCon Miami"]');
  await logoElement.waitFor({ state: 'visible', timeout: 5000 });

  // Get computed styles
  const logoStyles = await logoElement.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      opacity: computed.opacity,
      mixBlendMode: computed.mixBlendMode,
      filter: computed.filter,
      width: computed.width,
      height: computed.height,
    };
  });

  console.log('Current Logo Styles:', logoStyles);

  // Get the background color of the terminal
  const terminalBg = await page.evaluate(() => {
    const terminal = document.querySelector('.bg-background-dark');
    if (!terminal) return null;
    const computed = window.getComputedStyle(terminal);
    return {
      backgroundColor: computed.backgroundColor,
      background: computed.background,
    };
  });

  console.log('Terminal Background:', terminalBg);

  // Take a close-up screenshot of the logo area
  const logoBox = await logoElement.boundingBox();
  if (logoBox) {
    await page.screenshot({
      path: 'logo-closeup-before.png',
      clip: logoBox
    });
  }

  console.log('\nInspection complete! Screenshots saved:');
  console.log('- terminal-before-logo-fix.png');
  console.log('- logo-closeup-before.png');

  // Keep browser open for manual inspection
  console.log('\nBrowser kept open for manual inspection. Press Ctrl+C to close.');
}

inspectLogo().catch(console.error);
