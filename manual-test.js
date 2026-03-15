const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('=== Manual Todo Creation Test ===\n');
  console.log('Please watch the browser and observe:');
  console.log('1. Login page loads');
  console.log('2. After login, user should be redirected to home');
  console.log('3. Check if userId is set in localStorage');
  console.log('4. Try creating a todo\n');

  try {
    // Navigate to login
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    // Login
    await page.fill('#email', 'realtest_1772021537164@example.com');
    await page.fill('#password', 'Test1234!');
    console.log('[Clicking Login button...]');
    await page.click('button[type="submit"]');

    // Wait and observe
    console.log('[Waiting 10 seconds for redirect...]');
    await page.waitForTimeout(10000);

    // Check state
    const state = await page.evaluate(() => {
      const todoStorage = localStorage.getItem('todo-storage');
      if (todoStorage) {
        const data = JSON.parse(todoStorage);
        return {
          userId: data.state?.userId,
          hasUserId: !!data.state?.userId,
          url: window.location.href
        };
      }
      return { url: window.location.href };
    });

    console.log('\n=== Current State ===');
    console.log('URL:', state.url);
    console.log('Has userId:', state.hasUserId);
    console.log('UserId:', state.userId);

    if (state.hasUserId) {
      console.log('\n✅ SUCCESS! userId is set.');
    } else {
      console.log('\n❌ FAILED! userId is null.');
    }

    // Keep browser open for manual testing
    console.log('\nBrowser will stay open for manual testing...');
    console.log('Press Ctrl+C to exit');

    // Wait indefinitely until manually closed
    await new Promise(() => {});

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
