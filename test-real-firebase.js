const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Real Firebase Todo Creation Test ===');
  console.log('Testing with actual Firebase project: todo-app-291be\n');

  try {
    // 1. 회원가입 페이지 이동
    console.log('[1] Navigating to signup page...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/real-01-signup-page.png', fullPage: true });
    console.log('  ✓ Saved: real-01-signup-page.png');

    // 2. 회원가입 - 실제 Firebase에 계정 생성
    const testEmail = `realtest_${Date.now()}@example.com`;
    const testPassword = 'Test1234!';

    console.log(`[2] Creating account: ${testEmail}`);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.fill('#confirmPassword', testPassword);
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'screenshots/real-02-signup-filled.png', fullPage: true });
    console.log('  ✓ Saved: real-02-signup-filled.png');

    await page.click('button[type="submit"]');
    console.log('  Submitted signup form...');

    // 3. 회원가입 결과 대기
    await page.waitForTimeout(5000);

    const afterSignupUrl = page.url();
    console.log(`[3] After signup URL: ${afterSignupUrl}`);

    await page.screenshot({ path: 'screenshots/real-03-after-signup.png', fullPage: true });
    console.log('  ✓ Saved: real-03-after-signup.png');

    // 4. 로그인 페이지로 이동 후 로그인
    if (afterSignupUrl.includes('/signup') || afterSignupUrl.includes('/login')) {
      console.log('[4] Navigating to login for sign in...');
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      await page.fill('#email', testEmail);
      await page.fill('#password', testPassword);
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'screenshots/real-04-login-filled.png', fullPage: true });
      console.log('  ✓ Saved: real-04-login-filled.png');

      await page.click('button[type="submit"]');
      console.log('  Submitted login form...');

      await page.waitForTimeout(5000);
    }

    const afterLoginUrl = page.url();
    console.log(`[5] After login URL: ${afterLoginUrl}`);

    await page.screenshot({ path: 'screenshots/real-05-after-login.png', fullPage: true });
    console.log('  ✓ Saved: real-05-after-login.png');

    // 6. 로그인 상태 확인
    const userIndicator = await page.locator('text=Test User, test@example.com').or(
      page.locator('[data-testid="user-avatar"]')
    ).or(
      page.locator('.avatar')
    ).count();

    console.log(`[6] User indicator found: ${userIndicator > 0 ? 'Yes' : 'No'}`);

    // 7. Todo 입력 필드 확인
    console.log('[7] Looking for todo input field...');
    const inputField = page.locator('input[placeholder*="할 일"]').or(
      page.locator('input[placeholder*="todo" i]')
    ).or(
      page.locator('textarea')
    ).or(
      page.locator('[contenteditable="true"]')
    );

    const inputCount = await inputField.count();
    console.log(`  Input fields found: ${inputCount}`);

    if (inputCount > 0) {
      await page.screenshot({ path: 'screenshots/real-06-input-found.png', fullPage: true });
      console.log('  ✓ Saved: real-06-input-found.png');

      // 8. 실제 Todo 생성
      const timestamp = new Date().toLocaleString('ko-KR');
      const todoText = `실제 Firebase 테스트 할 일 (${timestamp})`;

      console.log(`[8] Creating todo: "${todoText}"`);
      await inputField.first().fill(todoText);
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/real-07-todo-filled.png', fullPage: true });
      console.log('  ✓ Saved: real-07-todo-filled.png');

      // 추가 버튼 찾기
      const addButton = page.locator('button').filter({ hasText: /추가|Add|만들기|Create/i });
      const addCount = await addButton.count();

      if (addCount > 0) {
        console.log(`  Found ${addCount} add buttons, clicking first...`);
        await addButton.first().click();
        console.log('  Clicked add button');

        await page.waitForTimeout(3000);

        // 9. Todo 생성 결과 확인
        const createdTodo = page.locator(`text=${todoText}`).or(
          page.locator('text=실제 Firebase 테스트')
        );

        const todoExists = await createdTodo.count() > 0;
        console.log(`[9] Todo created and visible: ${todoExists ? 'YES ✓' : 'NO ✗'}`);

        await page.screenshot({ path: 'screenshots/real-08-todo-created.png', fullPage: true });
        console.log('  ✓ Saved: real-08-todo-created.png');

        // 10. 페이지 새로고침 후 확인 (영구 저장 확인)
        console.log('[10] Refreshing page to verify persistence...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        await page.screenshot({ path: 'screenshots/real-09-after-refresh.png', fullPage: true });
        console.log('  ✓ Saved: real-09-after-refresh.png');

        const afterRefreshTodo = page.locator(`text=${todoText}`).or(
          page.locator('text=실제 Firebase 테스트')
        );

        const existsAfterRefresh = await afterRefreshTodo.count() > 0;
        console.log(`[11] Todo persists after refresh: ${existsAfterRefresh ? 'YES ✓✓✓' : 'NO ✗✗✗'}`);

        // 11. Firebase Console URL 제공
        console.log('\n=== Firebase Console ===');
        console.log('Check Firestore at:');
        console.log('https://console.firebase.google.com/project/todo-app-291be/firestore');
        console.log('\nCollection: "todos"');
        console.log(`Look for todo with title containing: "실제 Firebase 테스트"`);

        // 12. 정리
        console.log('\n[12] Test complete!');
        console.log(`Test account: ${testEmail}`);
        console.log(`Password: ${testPassword}`);
        console.log('\nYou can keep this account for further testing or delete it from Firebase Console.');

      } else {
        console.log('  ✗ No add button found');
        await page.screenshot({ path: 'screenshots/real-99-no-add-button.png', fullPage: true });
      }
    } else {
      console.log('  ✗ No input field found');
      await page.screenshot({ path: 'screenshots/real-99-no-input.png', fullPage: true });
    }

  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/real-99-error.png', fullPage: true });
    console.log('  Error screenshot saved: real-99-error.png');
  } finally {
    // 브라우저를 닫지 않고 사용자가 직접 확인할 수 있도록 대기
    console.log('\n=== Browser will stay open for manual verification ===');
    console.log('Press Ctrl+C to close when done checking...');

    // 30초 동안 대기 (사용자가 확인할 시간)
    await page.waitForTimeout(30000);

    await browser.close();
  }

  console.log('\n=== Test Complete ===');
})();
