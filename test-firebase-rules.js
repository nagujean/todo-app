const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== Firebase Rules Applied Test ===\n');

  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 기존 테스트 계정으로 로그인
    const testEmail = 'realtest_1772021537164@example.com';
    const testPassword = 'Test1234!';

    console.log('[1] Logging in...');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log('[2] Creating todo...');
    const inputField = page.locator('input[placeholder*="할 일"]');

    if (await inputField.count() > 0) {
      const todoText = `Firebase Rules 테스트 (${new Date().toLocaleTimeString('ko-KR')})`;
      await inputField.first().fill(todoText);
      await page.waitForTimeout(500);

      const addButton = page.locator('button').filter({ hasText: /추가/i });
      await addButton.first().click();
      await page.waitForTimeout(3000);

      // 결과 확인
      const todoExists = await page.locator(`text=${todoText}`).count() > 0;
      console.log(`\n[RESULT] Todo created: ${todoExists ? 'YES ✓✓✓' : 'NO ✗✗✗'}`);

      if (todoExists) {
        console.log('\n✅ SUCCESS! Firebase Rules가 제대로 설정되었습니다.');
        console.log('   Firestore에 데이터가 저장되었습니다.');
      } else {
        console.log('\n❌ FAILED! Firebase Rules가 제대로 설정되지 않았습니다.');
        console.log('   Firebase Console에서 Rules을 확인해주세요.');
      }

      await page.screenshot({ path: 'screenshots/firebase-rules-test.png', fullPage: true });
      console.log('\nScreenshot saved: screenshots/firebase-rules-test.png');
    }

    console.log('\n[INFO] Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
