const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== Verifying userId Assignment Fix ===\n');

  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Login
    console.log('[1] Logging in...');
    await page.fill('#email', 'realtest_1772021537164@example.com');
    await page.fill('#password', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for navigation (should happen automatically via AuthProvider)
    console.log('[2] Waiting for automatic redirect...');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('  ✓ Redirected to home page');

    await page.waitForTimeout(3000);

    // Check userId in store
    console.log('\n[3] Checking userId in todoStore...');
    const userIdCheck = await page.evaluate(() => {
      const todoStorage = localStorage.getItem('todo-storage');
      if (todoStorage) {
        const data = JSON.parse(todoStorage);
        return {
          userId: data.state?.userId || null,
          hasUser: !!data.state?.userId
        };
      }
      return { userId: null, hasUser: false };
    });

    console.log('  userId check:', JSON.stringify(userIdCheck));

    if (userIdCheck.hasUser) {
      console.log('\n✅ SUCCESS! userId is properly set after login.');
    } else {
      console.log('\n❌ FAILED! userId is still null.');
    }

    // Try to create a todo
    console.log('\n[4] Attempting to create todo...');
    const inputField = page.locator('input[placeholder*="할 일"]');

    if (await inputField.count() > 0) {
      await inputField.first().fill(`Fix Verification Todo (${Date.now()})`);
      await page.waitForTimeout(500);

      const addButton = page.locator('button').filter({ hasText: /추가/i });
      await addButton.first().click();
      await page.waitForTimeout(3000);

      const todoExists = await page.locator('text=Fix Verification Todo').count() > 0;
      console.log(`\n[RESULT] Todo created: ${todoExists ? 'YES ✓' : 'NO ✗'}`);

      await page.screenshot({ path: 'screenshots/verify-fix-result.png', fullPage: true });
    }

    console.log('\n=== Verification Complete ===');
    console.log('Browser will stay open for 10 seconds for manual check...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/verify-fix-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
