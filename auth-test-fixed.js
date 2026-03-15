const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test1234!';

  console.log('=== Todo App Authentication Test ===');
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Password: ${testPassword}`);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // 1. 회원가입 페이지 이동
    console.log('\n[1] Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/10-signup-page.png', fullPage: true });
    console.log('✓ Saved: 10-signup-page.png');

    // 2. 회원가입 폼 작성 (ID로 선택)
    console.log('\n[2] Filling signup form...');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.fill('#confirmPassword', testPassword);
    await page.waitForTimeout(500);

    // 3. 회원가입 제출
    console.log('\n[3] Submitting signup...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const afterSignupUrl = page.url();
    console.log(`After signup URL: ${afterSignupUrl}`);

    // 회원가입 결과 스크린샷
    await page.screenshot({ path: 'screenshots/11-after-signup.png', fullPage: true });
    console.log('✓ Saved: 11-after-signup.png');

    // 여전히 로그인 페이지에 있다면 로그인 시도
    if (afterSignupUrl.includes('/signup') || afterSignupUrl.includes('/login')) {
      console.log('\n[4] Navigating to login page...');
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      await page.fill('#email', testEmail);
      await page.fill('#password', testPassword);
      await page.waitForTimeout(500);

      console.log('\n[5] Submitting login...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    }

    // 6. 메인 페이지 확인
    const finalUrl = page.url();
    console.log(`\n[6] Final URL: ${finalUrl}`);

    await page.screenshot({ path: 'screenshots/12-home-authenticated.png', fullPage: true });
    console.log('✓ Saved: 12-home-authenticated.png');

    // 7. 모바일 뷰
    console.log('\n[7] Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/13-home-mobile.png', fullPage: true });
    console.log('✓ Saved: 13-home-mobile.png');

    // 8. Todo 입력 테스트
    console.log('\n[8] Testing todo input...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    const inputField = page.locator('input[placeholder*="할 일"]').or(page.locator('input[placeholder*="todo" i]'));
    const inputCount = await inputField.count();
    console.log(`Todo input field found: ${inputCount > 0}`);

    if (inputCount > 0) {
      await inputField.first().fill('테스트 할 일 항목');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/14-todo-input.png', fullPage: true });
      console.log('✓ Saved: 14-todo-input.png');
    }

    // 9. 필터 버튼 확인
    console.log('\n[9] Testing filter buttons...');
    const filters = ['전체', '미완료', '완료'];
    for (const filter of filters) {
      const filterButton = page.locator('button').filter({ hasText: filter });
      if (await filterButton.count() > 0) {
        console.log(`✓ Filter button found: ${filter}`);
        await filterButton.first().click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: 'screenshots/15-filters-tested.png', fullPage: true });
    console.log('✓ Saved: 15-filters-tested.png');

    // 10. 헤더 확인
    console.log('\n[10] Checking header elements...');
    const header = page.locator('header');
    if (await header.count() > 0) {
      await page.screenshot({ path: 'screenshots/16-header.png', fullPage: false });
      console.log('✓ Saved: 16-header.png');
    }

  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/99-error.png', fullPage: true });
  } finally {
    await browser.close();
  }

  console.log('\n=== Test Complete ===');
})();
