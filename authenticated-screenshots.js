const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // 테스트 계정 정보
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test1234!';

  console.log('=== Todo App Authentication Test ===');
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Password: ${testPassword}`);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // 1. 회원가입 페이지로 이동
    console.log('\n[1] Navigating to signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/10-signup-before.png', fullPage: true });
    console.log('✓ Saved: 10-signup-before.png');

    // 2. 회원가입 폼 작성
    console.log('\n[2] Filling signup form...');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.waitForTimeout(500);

    // 3. 회원가입 제출
    console.log('\n[3] Submitting signup form...');
    const signupButton = page.locator('button[type="submit"]').filter({ hasText: /가입하기|회원가입|Sign Up/i });
    await signupButton.click();
    await page.waitForTimeout(3000);

    // 회원가입 결과 확인
    const currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('→ Redirected to login page (need to verify email first)');

      // 로그인 페이지 스크린샷
      await page.screenshot({ path: 'screenshots/11-after-signup.png', fullPage: true });
      console.log('✓ Saved: 11-after-signup.png');

      // 로그인 시도
      console.log('\n[4] Attempting login...');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.waitForTimeout(500);

      const loginButton = page.locator('button[type="submit"]').filter({ hasText: /로그인|Login|Sign In/i });
      await loginButton.click();
      await page.waitForTimeout(3000);
    }

    // 5. 로그인 후 메인 페이지 확인
    console.log('\n[5] Checking authenticated home page...');
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    await page.screenshot({ path: 'screenshots/12-home-authenticated-desktop.png', fullPage: true });
    console.log('✓ Saved: 12-home-authenticated-desktop.png');

    // 6. 모바일 뷰 확인
    console.log('\n[6] Checking mobile view...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/13-home-authenticated-mobile.png', fullPage: true });
    console.log('✓ Saved: 13-home-authenticated-mobile.png');

    // 7. 추가 페이지 확인 (캘린더, 팀 등)
    console.log('\n[7] Exploring authenticated pages...');

    // 페이지 내 모든 버튼과 링크 확인
    const buttons = await page.locator('button, a').allTextContents();
    console.log('Available buttons/links:', buttons.slice(0, 20).join(', '));

    // 탭/섹션 변경 시도
    const filterButtons = page.locator('button').filter({ hasText: /전체|미완료|완료|All|Incomplete|Complete/i });
    const count = await filterButtons.count();
    console.log(`Found ${count} filter buttons`);

    if (count > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/14-filter-applied-desktop.png', fullPage: true });
      console.log('✓ Saved: 14-filter-applied-desktop.png');
    }

    // 8. 헤더/메뉴 확인
    console.log('\n[8] Checking header and navigation...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    const header = page.locator('header');
    const headerExists = await header.count() > 0;
    console.log(`Header exists: ${headerExists}`);

    if (headerExists) {
      await page.screenshot({ path: 'screenshots/15-header-desktop.png', fullPage: false });
      console.log('✓ Saved: 15-header-desktop.png');
    }

    // 9. 사용자 메뉴/프로필 확인
    console.log('\n[9] Checking user menu/profile...');
    const avatarButton = page.locator('button[aria-label*="user" i], button[aria-label*="profile" i], .avatar, [data-testid="user-menu"]');
    const avatarCount = await avatarButton.count();

    if (avatarCount > 0) {
      console.log('✓ User avatar/menu found');
      await avatarButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/16-user-menu-open.png', fullPage: false });
      console.log('✓ Saved: 16-user-menu-open.png');
    }

    // 10. 로그아웃 확인
    console.log('\n[10] Checking logout functionality...');
    const logoutButton = page.locator('button').filter({ hasText: /로그아웃|Logout|Sign Out/i });
    const logoutCount = await logoutButton.count();
    console.log(`Logout button found: ${logoutCount > 0}`);

  } catch (error) {
    console.error(`✗ Error: ${error.message}`);

    // 에러 발생 시 스크린샷
    await page.screenshot({ path: 'screenshots/99-error.png', fullPage: true });
    console.log('✓ Saved error screenshot: 99-error.png');
  } finally {
    await browser.close();
  }

  console.log('\n=== Test Complete ===');
  console.log(`Test credentials created:`);
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
})();
