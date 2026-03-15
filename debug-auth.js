const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== Debug: Auth State Investigation ===\n');

  try {
    // Capture all console messages
    page.on('console', msg => {
      console.log(`[Console ${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n--- Before Login ---');
    const beforeLogin = await page.evaluate(() => {
      // Check Firebase
      const hasFirebase = typeof window !== 'undefined' && window.firebase;
      const hasAuth = typeof window !== 'undefined' && window.__FIREBASE_AUTH__;
      return { hasFirebase, hasAuth };
    });
    console.log('Firebase check:', JSON.stringify(beforeLogin));

    // Login
    console.log('\n--- Logging in ---');
    await page.fill('#email', 'realtest_1772021537164@example.com');
    await page.fill('#password', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for redirect
    console.log('Waiting for redirect...');
    await page.waitForTimeout(8000);

    console.log('\n--- After Login (8 seconds) ---');
    const afterLogin = await page.evaluate(() => {
      const result = {};

      // Check localStorage
      const todoStorage = localStorage.getItem('todo-storage');
      if (todoStorage) {
        const data = JSON.parse(todoStorage);
        result.todoStorage = {
          userId: data.state?.userId,
          hasUserId: !!data.state?.userId,
          todosCount: data.state?.todos?.length
        };
      }

      // Check Zustand store
      if (typeof window !== 'undefined') {
        // Try to access the store
        result.hasWindow = true;
      }

      return result;
    });
    console.log('After login state:', JSON.stringify(afterLogin, null, 2));

    // Check URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check authStore directly
    console.log('\n--- Checking authStore directly ---');
    const authStoreCheck = await page.evaluate(() => {
      // Try to find authStore in window
      const keys = Object.keys(window);
      const authKeys = keys.filter(k => k.toLowerCase().includes('auth') || k.toLowerCase().includes('store'));
      return { authKeys };
    });
    console.log('Window auth-related keys:', JSON.stringify(authStoreCheck));

    // Screenshot
    await page.screenshot({ path: 'screenshots/debug-auth-state.png', fullPage: true });

    console.log('\nBrowser will stay open for 60 seconds for manual inspection...');
    console.log('Open DevTools (F12) and check:');
    console.log('1. Console tab for error messages');
    console.log('2. Application tab > Local Storage');
    console.log('3. Network tab for Firebase requests');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
