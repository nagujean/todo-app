const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Debug Firebase Todo Creation ===\n');

  try {
    // 1. 개발자 도구 활성화 상태로 접속
    console.log('[1] Opening browser with DevTools...');

    // 콘솔 로그 캡처 설정
    page.on('console', msg => {
      console.log(`  [Console ${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`  [Page Error] ${error.message}`);
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n[2] Testing with existing test account...');

    // 이전 테스트 계정 사용
    const testEmail = 'realtest_1772021537164@example.com';
    const testPassword = 'Test1234!';

    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.waitForTimeout(500);

    await page.click('button[type="submit"]');
    console.log('  Login submitted...');

    await page.waitForTimeout(5000);

    const loginUrl = page.url();
    console.log(`\n[3] After login URL: ${loginUrl}`);

    // 4. Firebase 상태 확인 (브라우저 콘솔에서)
    console.log('\n[4] Checking Firebase state in browser...');
    await page.evaluate(() => {
      console.log('=== Firebase State Check ===');
      console.log('localStorage:', Object.keys(localStorage));
      console.log('sessionStorage:', Object.keys(sessionStorage));

      // Firebase SDK 상태 확인
      if (typeof window !== 'undefined') {
        import('firebase/auth').then(({ getAuth }) => {
          const auth = getAuth();
          console.log('Firebase auth current user:', auth.currentUser);
          console.log('Firebase auth uid:', auth.currentUser?.uid);
        }).catch(e => console.error('Firebase auth check error:', e));

        // Store 상태 확인
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            console.log('Window stores available:', Object.keys(window));
          }, 1000);
        }
      }
    });

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshots/debug-01-after-login.png', fullPage: true });
    console.log('  ✓ Saved: debug-01-after-login.png');

    // 5. userId가 설정되어 있는지 확인
    console.log('\n[5] Checking userId in page context...');
    const userIdCheck = await page.evaluate(() => {
      // Zustand store 접근 시도
      const authStore = (window).__ZUSTAND__STORES__;
      if (authStore) {
        console.log('Found Zustand stores:', Object.keys(authStore));
      }

      // localStorage에 저장된 사용자 정보 확인
      const userStr = localStorage.getItem('user');
      console.log('localStorage user:', userStr);

      return {
        hasUserStr: !!userStr,
        userStr: userStr ? JSON.parse(userStr) : null,
        zustandStores: authStore ? Object.keys(authStore) : []
      };
    });

    console.log('  userId check result:', JSON.stringify(userIdCheck, null, 2));

    // 6. Todo 입력 시도
    console.log('\n[6] Attempting to create todo...');
    const inputField = page.locator('input[placeholder*="할 일"]');
    const inputCount = await inputField.count();
    console.log(`  Input fields found: ${inputCount}`);

    if (inputCount > 0) {
      await inputField.first().fill(`Debug Todo (${Date.now()})`);
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/debug-02-todo-filled.png', fullPage: true });
      console.log('  ✓ Saved: debug-02-todo-filled.png');

      // 버튼 클릭 전에 현재 상태 확인
      const beforeClickState = await page.evaluate(() => {
        return document.body.innerHTML.substring(0, 500);
      });
      console.log('  Page state before click:', beforeClickState.substring(0, 200));

      const addButton = page.locator('button').filter({ hasText: /추가/i });
      const addCount = await addButton.count();
      console.log(`  Add buttons found: ${addCount}`);

      if (addCount > 0) {
        console.log('\n[7] Clicking add button...');
        await addButton.first().click();

        // 클릭 후 대기
        await page.waitForTimeout(5000);

        await page.screenshot({ path: 'screenshots/debug-03-after-add.png', fullPage: true });
        console.log('  ✓ Saved: debug-03-after-add.png');

        // 8. Todo가 생성되었는지 확인
        const todoList = await page.evaluate(() => {
          const todoItems = document.querySelectorAll('[data-testid="todo-item"], .todo-item');
          return {
            todoItemCount: todoItems.length,
            todoItemsText: Array.from(todoItems).map(el => el.textContent?.substring(0, 50))
          };
        });

        console.log('\n[8] Todo list check:', JSON.stringify(todoList, null, 2));

        // 9. Firestore Collection 확인 방법 안내
        console.log('\n=== Manual Verification Required ===');
        console.log('Please check Firebase Console:');
        console.log('1. Go to: https://console.firebase.google.com/project/todo-app-291be');
        console.log('2. Click "Firestore Database"');
        console.log('3. Check "todos" collection');
        console.log('4. Look for documents with userId');
        console.log('\nAlso check:');
        console.log('- Authentication: Users tab');
        console.log('- Console logs for any Firebase errors');

        // 10. 30초 동안 열어두기 (수동 확인용)
        console.log('\n[INFO] Browser will stay open for 30 seconds for manual checking...');
        console.log('Open DevTools (F12) and check Console for Firebase errors');

        await page.waitForTimeout(30000);

      } else {
        console.log('  ✗ No add button found');
      }
    } else {
      console.log('  ✗ No input field found');
    }

  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`);
    await page.screenshot({ path: 'screenshots/debug-99-error.png', fullPage: true });
  } finally {
    await browser.close();
  }

  console.log('\n=== Debug Complete ===');
})();
