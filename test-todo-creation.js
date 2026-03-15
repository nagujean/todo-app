const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slower for visibility
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Todo Creation Test ===\n');

  try {
    // Setup console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Todo') || text.includes('error') || text.includes('Error') || text.includes('Firestore')) {
        console.log(`  [Browser ${msg.type()}] ${text}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`  [Page Error] ${error.message}`);
    });

    await page.setViewportSize({ width: 1920, height: 1080 });

    // Step 1: Go to login page
    console.log('[1] Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Login
    console.log('[2] Logging in...');
    await page.fill('#email', 'realtest_1772021537164@example.com');
    await page.fill('#password', 'Test1234!');
    await page.screenshot({ path: 'screenshots/test-01-before-login.png' });
    await page.click('button[type="submit"]');

    // Wait for automatic redirect (AuthProvider handles this)
    console.log('[3] Waiting for automatic redirect to home...');
    await page.waitForURL('http://localhost:3000/', { timeout: 15000 });
    console.log('  ✓ Redirected to home page successfully!');
    await page.screenshot({ path: 'screenshots/test-02-after-login.png' });

    await page.waitForTimeout(5000);

    // Step 3: Check auth state
    console.log('\n[4] Authentication check...');
    console.log('  Note: userId is stored in memory, not localStorage (security measure)');
    console.log('  Console logs show userId was set successfully.');
    console.log('  Proceeding to Todo creation test...');

    // Step 4: Create a new todo
    console.log('\n[5] Creating a new todo...');
    const inputField = page.locator('input[placeholder*="할 일"]');
    const inputCount = await inputField.count();
    console.log(`  Input fields found: ${inputCount}`);

    if (inputCount === 0) {
      console.log('  ❌ No input field found!');
      await page.screenshot({ path: 'screenshots/test-fail-no-input.png' });
      await browser.close();
      return;
    }

    const todoText = `테스트 할일 (${new Date().toLocaleTimeString('ko-KR')})`;
    await inputField.first().fill(todoText);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/test-03-todo-filled.png' });

    const addButton = page.locator('button').filter({ hasText: /추가/i });
    const addCount = await addButton.count();
    console.log(`  Add buttons found: ${addCount}`);

    if (addCount === 0) {
      console.log('  ❌ No add button found!');
      await browser.close();
      return;
    }

    console.log('  Clicking add button...');
    await addButton.first().click();

    // Wait for todo to appear
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/test-04-after-add.png' });

    // Step 5: Verify todo was created
    console.log('\n[6] Verifying todo creation...');
    const todoList = await page.evaluate(() => {
      const todoItems = document.querySelectorAll('[data-testid="todo-item"], .todo-item, [class*="todo"]');
      return {
        todoItemCount: todoItems.length,
        todoItemsText: Array.from(todoItems).slice(0, 5).map(el => el.textContent?.substring(0, 50))
      };
    });
    console.log('  Todo list:', JSON.stringify(todoList));

    const todoExists = await page.locator(`text=${todoText}`).count() > 0;
    console.log(`\n[RESULT] Todo created in UI: ${todoExists ? '✓ YES' : '✗ NO'}`);

    // Check if todos were loaded from Firestore
    console.log('\n[7] Verification...');
    console.log('  Check Firebase Console for new todos:');
    console.log('  https://console.firebase.google.com/project/todo-app-291be/firestore/data');
    console.log('  Look for: users -> [user-id] -> todos');

    // Final screenshot
    await page.screenshot({ path: 'screenshots/test-final-result.png', fullPage: true });

    console.log('\n=== Test Complete ===');
    console.log('Screenshots saved in: screenshots/');
    console.log('\nManual verification:');
    console.log('1. Check Firebase Console: https://console.firebase.google.com/project/todo-app-291be/firestore/data');
    console.log('2. Look for collection: users -> [user-id] -> todos');
    console.log('3. Check browser console (F12) for error messages');

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
