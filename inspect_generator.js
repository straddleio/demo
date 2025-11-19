const { chromium } = require('playwright');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Enable console logging
  page.on('console', msg => console.log(`[CONSOLE ${msg.type()}]`, msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  // Navigate to app
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('domcontentloaded');

  // Take initial screenshot
  await page.screenshot({ path: '/tmp/generator_initial.png', fullPage: true });
  console.log('✓ Screenshot saved: /tmp/generator_initial.png');

  // Find terminal and run /demo
  console.log('\nExecuting /demo command...');
  const terminal = await page.locator('textarea, input[type="text"]').first();
  await terminal.click();
  await terminal.fill('/demo');
  await terminal.press('Enter');
  console.log('✓ Command sent');

  // Wait for demo to start
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/generator_after_demo.png', fullPage: true });
  console.log('✓ Screenshot saved: /tmp/generator_after_demo.png');

  // Wait for generator modal
  console.log('\nWaiting for generator modal...');
  await page.waitForTimeout(8000);

  // Check for generator modal
  const generatorModal = await page.locator('.fixed.inset-0.z-50').first();
  const isVisible = await generatorModal.isVisible().catch(() => false);
  console.log(`Generator modal visible: ${isVisible}`);

  if (isVisible) {
    // Take screenshot of generator
    await page.screenshot({ path: '/tmp/generator_modal.png', fullPage: true });
    console.log('✓ Screenshot saved: /tmp/generator_modal.png');

    // Get overlay HTML
    const overlay = await page.locator('.absolute.inset-0.z-10').first();
    const overlayHTML = await overlay.innerHTML().catch(() => 'Not found');
    console.log('\nOverlay HTML (first 500 chars):');
    console.log(overlayHTML.substring(0, 500));

    // Count canvas elements
    const canvasCount = await page.locator('canvas').count();
    console.log(`\nCanvas elements: ${canvasCount}`);

    // Wait for animation
    console.log('\nObserving animation for 15 seconds...');
    await page.waitForTimeout(15000);

    await page.screenshot({ path: '/tmp/generator_final.png', fullPage: true });
    console.log('✓ Screenshot saved: /tmp/generator_final.png');
  } else {
    console.log('Generator modal did not appear!');
    const html = await page.content();
    require('fs').writeFileSync('/tmp/page_dom.html', html);
    console.log('✓ DOM saved to /tmp/page_dom.html');
  }

  await browser.close();
  console.log('\n✅ Inspection complete!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
