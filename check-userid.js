const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== Debug: Checking userId & Firestore Status ===\n');

  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 로그인
    await page.fill('#email', 'realtest_1772021537164@example.com');
    await page.fill('#password', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // userId 확인
    console.log('[1] Checking authentication state...');
    const authCheck = await page.evaluate(() => {
      // localStorage 확인
      const todoStorage = localStorage.getItem('todo-storage');
      if (todoStorage) {
        const data = JSON.parse(todoStorage);
        console.log('Todo storage state:', JSON.stringify(data, null, 2));

        // userId 추출
        if (data.state && data.state.userId) {
          return { userId: data.state.userId, source: 'zustand' };
        }
      }

      // Firebase Auth 확인
      return { userId: null, source: 'none' };
    });

    console.log('Auth check result:', JSON.stringify(authCheck, null, 2));

    // Todo 입력 시도
    console.log('\n[2] Attempting to create todo...');
    const inputField = page.locator('input[placeholder*="할 일"]');

    if (await inputField.count() > 0) {
      await inputField.first().fill(`디버그 테스트 (${Date.now()})`);
      await page.waitForTimeout(500);

      // 콘솔 로그 확인
      page.on('console', msg => {
        if (msg.text().includes('Firestore') || msg.text().includes('error')) {
          console.log(`  [Browser Console] ${msg.type()}: ${msg.text()}`);
        }
      });

      const addButton = page.locator('button').filter({ hasText: /추가/i });
      await addButton.first().click();
      await page.waitForTimeout(5000);

      // 결과
      const todoCreated = await page.locator('text=디버그 테스트').count() > 0;
      console.log(`\n[RESULT] Todo created in UI: ${todoCreated ? 'YES' : 'NO'}`);

      await page.screenshot({ path: 'screenshots/debug-userid-check.png', fullPage: true });
      console.log('\nScreenshot saved: screenshots/debug-userid-check.png');
    }

    console.log('\n[3] Check Firebase Console manually:');
    console.log('   https://console.firebase.google.com/project/todo-app-291be/firestore/data');
    console.log('   Look for collection: users -> [user-id] -> todos');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
