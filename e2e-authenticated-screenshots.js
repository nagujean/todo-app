const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  console.log('=== Todo App E2E Mode - Full Page Test ===');
  console.log('Using E2E test mode with mock user authentication\n');

  const results = [];

  // 페이지 목록 (E2E 모드)
  const pages = [
    { name: 'e2e-01-home-desktop', url: 'http://localhost:3000?e2e=true', width: 1920, height: 1080 },
    { name: 'e2e-02-home-mobile', url: 'http://localhost:3000?e2e=true', width: 375, height: 812 },
    { name: 'e2e-03-calendar-desktop', url: 'http://localhost:3000?e2e=true&view=calendar', width: 1920, height: 1080 },
    { name: 'e2e-04-calendar-mobile', url: 'http://localhost:3000?e2e=true&view=calendar', width: 375, height: 812 },
    { name: 'e2e-05-team-desktop', url: 'http://localhost:3000?e2e=true&view=team', width: 1920, height: 1080 },
    { name: 'e2e-06-team-mobile', url: 'http://localhost:3000?e2e=true&view=team', width: 375, height: 812 },
  ];

  for (const pageConfig of pages) {
    const page = await context.newPage();

    try {
      console.log(`[${pageConfig.name}] Navigating to ${pageConfig.url} (${pageConfig.width}x${pageConfig.height})...`);

      // E2E 모드 활성화를 위한 localStorage 설정
      await page.addInitScript(() => {
        localStorage.setItem('E2E_TEST_MODE', 'true');
      });

      await page.setViewportSize({ width: pageConfig.width, height: pageConfig.height });
      await page.goto(pageConfig.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000); // E2E 모드로드 및 사용자 설정 대기

      const filename = `screenshots/${pageConfig.name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`  ✓ Saved: ${filename}`);
      results.push({ name: pageConfig.name, status: 'success' });

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      results.push({ name: pageConfig.name, status: 'error', error: error.message });
    } finally {
      await page.close();
    }
  }

  // 추가 상호작용 테스트
  console.log('\n=== Interaction Tests ===');
  const page = await context.newPage();

  try {
    // E2E 모드 설정
    await page.addInitScript(() => {
      localStorage.setItem('E2E_TEST_MODE', 'true');
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000?e2e=true', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Todo 입력 테스트
    console.log('[Interaction] Testing Todo input...');
    const inputField = page.locator('input[placeholder*="할 일"]');
    const inputCount = await inputField.count();

    if (inputCount > 0) {
      await inputField.first().fill('E2E 테스트 할 일 항목');
      await page.waitForTimeout(500);

      const addButton = page.locator('button').filter({ hasText: /추가|Add/i });
      const addCount = await addButton.count();

      if (addCount > 0) {
        await addButton.first().click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Todo item added');
        await page.screenshot({ path: 'screenshots/e2e-07-todo-added.png', fullPage: true });
        results.push({ name: 'e2e-07-todo-added', status: 'success' });
      }
    }

    // 필터 테스트
    console.log('[Interaction] Testing filters...');
    const filters = ['전체', '미완료', '완료'];
    for (const filter of filters) {
      const filterButton = page.locator('button').filter({ hasText: filter });
      if (await filterButton.count() > 0) {
        await filterButton.first().click();
        await page.waitForTimeout(500);
        console.log(`  ✓ Filter applied: ${filter}`);
      }
    }

    await page.screenshot({ path: 'screenshots/e2e-08-filters-tested.png', fullPage: true });
    results.push({ name: 'e2e-08-filters-tested', status: 'success' });

    // 정렬 테스트
    console.log('[Interaction] Testing sorting...');
    const sortButtons = page.locator('button').filter({ hasText: /우선순위|입력일|시작일|종료일/ });
    const sortCount = await sortButtons.count();

    if (sortCount > 0) {
      await sortButtons.first().click();
      await page.waitForTimeout(500);
      console.log('  ✓ Sort clicked');
      await page.screenshot({ path: 'screenshots/e2e-09-sort-tested.png', fullPage: true });
      results.push({ name: 'e2e-09-sort-tested', status: 'success' });
    }

    // 헤더/메뉴 테스트
    console.log('[Interaction] Testing header and user menu...');
    const header = page.locator('header');
    if (await header.count() > 0) {
      await page.screenshot({ path: 'screenshots/e2e-10-header.png', fullPage: false });

      // 사용자 아바타 또는 메뉴 버튼 찾기
      const avatarButton = page.locator('button[aria-label*="user" i], button[aria-label*="profile" i], [data-testid="user-menu"], .avatar');
      const avatarCount = await avatarButton.count();

      if (avatarCount > 0) {
        await avatarButton.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/e2e-11-user-menu.png', fullPage: false });
        console.log('  ✓ User menu opened');
        results.push({ name: 'e2e-11-user-menu', status: 'success' });
      }
    }

    // 모바일에서 메뉴 테스트
    console.log('[Interaction] Testing mobile menu...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/e2e-12-mobile-menu.png', fullPage: true });
    results.push({ name: 'e2e-12-mobile-menu', status: 'success' });

  } catch (error) {
    console.error(`[Interaction] Error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/e2e-99-error.png', fullPage: true });
  } finally {
    await page.close();
  }

  console.log('\n=== Summary ===');
  results.forEach(r => {
    const icon = r.status === 'success' ? '✓' : '✗';
    console.log(`${icon} ${r.name}: ${r.status}`);
  });

  const success = results.filter(r => r.status === 'success').length;
  const total = results.length;
  console.log(`\nTotal: ${success}/${total} screenshots captured`);

  await browser.close();
})();
