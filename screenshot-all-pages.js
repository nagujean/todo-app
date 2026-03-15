const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // 페이지 목록
  const pages = [
    { name: '01-home', url: 'http://localhost:3000', width: 1920, height: 1080 },
    { name: '02-home-mobile', url: 'http://localhost:3000', width: 375, height: 812 },
    { name: '03-login', url: 'http://localhost:3000/login', width: 1920, height: 1080 },
    { name: '04-login-mobile', url: 'http://localhost:3000/login', width: 375, height: 812 },
    { name: '05-signup', url: 'http://localhost:3000/signup', width: 1920, height: 1080 },
    { name: '06-signup-mobile', url: 'http://localhost:3000/signup', width: 375, height: 812 },
  ];

  const results = [];

  for (const pageConfig of pages) {
    const page = await context.newPage();
    await page.setViewportSize({ width: pageConfig.width, height: pageConfig.height });

    try {
      console.log(`Navigating to ${pageConfig.name}: ${pageConfig.url} (${pageConfig.width}x${pageConfig.height})...`);
      await page.goto(pageConfig.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);

      const filename = `screenshots/${pageConfig.name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`✓ Saved: ${filename}`);
      results.push({ name: pageConfig.name, status: 'success', filename });

    } catch (error) {
      console.error(`✗ Error: ${pageConfig.name} - ${error.message}`);
      results.push({ name: pageConfig.name, status: 'error', error: error.message });
    } finally {
      await page.close();
    }
  }

  console.log('\n=== Screenshot Summary ===');
  results.forEach(r => {
    console.log(`${r.name}: ${r.status}`);
  });

  await browser.close();
})();
