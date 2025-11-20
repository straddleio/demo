import { chromium } from 'playwright';

async function inspectChargeCard() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for app to load
  await page.waitForSelector('.bg-background-dark', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Take full page screenshot
  await page.screenshot({
    path: 'chargecard-full-view.png',
    fullPage: true
  });

  // Try to find the charge card
  const chargeCard = page.locator('text=Charge').first();
  await chargeCard.waitFor({ state: 'visible', timeout: 5000 });

  // Get the parent card element
  const cardElement = chargeCard.locator('..').locator('..').locator('..');

  // Take screenshot of just the charge card
  const cardBox = await cardElement.boundingBox();
  if (cardBox) {
    await page.screenshot({
      path: 'chargecard-closeup.png',
      clip: cardBox
    });
  }

  // Check if paykey button exists
  const paykeyButton = page.locator('button:has-text("PAYKEY")');
  const paykeyExists = await paykeyButton.count() > 0;

  console.log('\n📸 Screenshots taken:');
  console.log('  - chargecard-full-view.png');
  console.log('  - chargecard-closeup.png');
  console.log(`\n🔍 Paykey button found: ${paykeyExists}`);

  if (paykeyExists) {
    const paykeyBox = await paykeyButton.boundingBox();
    console.log('  Paykey button position:', paykeyBox);

    // Get the CREATED badge position
    const createdBadge = page.locator('text=CREATED').first();
    const badgeBox = await createdBadge.boundingBox();
    console.log('  CREATED badge position:', badgeBox);

    if (paykeyBox && badgeBox) {
      console.log(`\n📏 Alignment check:`);
      console.log(`  Badge right edge: ${badgeBox.x + badgeBox.width}`);
      console.log(`  Paykey right edge: ${paykeyBox.x + paykeyBox.width}`);
      console.log(`  Difference: ${Math.abs((badgeBox.x + badgeBox.width) - (paykeyBox.x + paykeyBox.width))}px`);
    }
  }

  console.log('\n🔍 Browser kept open for inspection. Press Ctrl+C to close.');
}

inspectChargeCard().catch(console.error);
