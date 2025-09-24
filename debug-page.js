const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('Navigating to http://localhost:3003/');
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });

    console.log('Page loaded, waiting for magic items...');

    // Wait a bit for the page to load completely
    await page.waitForTimeout(5000);

    // Check if there are any error messages on the page
    const errorMessages = await page.locator('[data-testid*="error"], .error, [role="alert"]').all();
    if (errorMessages.length > 0) {
      console.log(`Found ${errorMessages.length} error elements on page`);
      for (let i = 0; i < errorMessages.length; i++) {
        const text = await errorMessages[i].textContent();
        console.log(`Error ${i+1}: ${text}`);
      }
    }

    // Check for magic items
    const magicItems = await page.locator('[data-testid="magic-item-card"]').all();
    console.log(`Found ${magicItems.length} magic item cards`);

    // Check loading state
    const loading = await page.locator('[data-testid*="loading"], .animate-spin').all();
    console.log(`Found ${loading.length} loading indicators`);

    // Check search results text
    const resultsText = await page.locator('text*="item"').all();
    if (resultsText.length > 0) {
      for (let i = 0; i < Math.min(3, resultsText.length); i++) {
        const text = await resultsText[i].textContent();
        console.log(`Results text ${i+1}: ${text}`);
      }
    }

    console.log('Keeping browser open for manual inspection...');
    // Keep the browser open for manual inspection
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
})();