import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('페이지 로드 시 제목이 표시된다', async ({ page }) => {
    await expect(page.getByText('할 일 목록')).toBeVisible()
  })

  test('빈 상태일 때 안내 메시지가 표시된다', async ({ page }) => {
    await expect(page.getByText('할 일이 없어요')).toBeVisible()
    await expect(page.getByText('위에서 새로운 할 일을 추가해보세요!')).toBeVisible()
  })

  test('할일을 추가할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('새로운 할일')
    await addButton.click()

    await expect(page.getByText('새로운 할일')).toBeVisible()
    await expect(page.getByText('할 일이 없어요')).not.toBeVisible()
  })

  test('Enter 키로 할일을 추가할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    await input.fill('Enter로 추가한 할일')
    await input.press('Enter')

    await expect(page.getByText('Enter로 추가한 할일')).toBeVisible()
  })

  test('빈 입력은 추가되지 않는다', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '추가' })

    await expect(addButton).toBeDisabled()
  })

  test('할일을 완료 처리할 수 있다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('완료할 할일')
    await input.press('Enter')

    // 체크박스 클릭
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()

    // 완료 상태 확인 (취소선 스타일)
    const label = page.getByText('완료할 할일')
    await expect(label).toHaveClass(/line-through/)
  })

  test('완료된 할일을 다시 미완료로 변경할 수 있다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('토글 테스트')
    await input.press('Enter')

    const checkbox = page.getByRole('checkbox')

    // 완료 처리
    await checkbox.click()
    await expect(page.getByText('토글 테스트')).toHaveClass(/line-through/)

    // 미완료 처리
    await checkbox.click()
    await expect(page.getByText('토글 테스트')).not.toHaveClass(/line-through/)
  })

  test('할일을 삭제할 수 있다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('삭제할 할일')
    await input.press('Enter')

    // 삭제 버튼 클릭 (hover 시 나타남)
    const todoItem = page.getByText('삭제할 할일').locator('..')
    await todoItem.hover()
    await page.getByRole('button', { name: '삭제' }).click()

    await expect(page.getByText('삭제할 할일')).not.toBeVisible()
  })

  test('진행 상황이 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 할일 2개 추가
    await input.fill('할일 1')
    await input.press('Enter')
    await input.fill('할일 2')
    await input.press('Enter')

    // 0/2 완료
    await expect(page.getByText('0/2 완료')).toBeVisible()

    // 1개 완료
    await page.getByRole('checkbox').first().click()
    await expect(page.getByText('1/2 완료')).toBeVisible()
  })

  test('완료된 항목을 일괄 삭제할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 할일 2개 추가
    await input.fill('유지될 할일')
    await input.press('Enter')
    await input.fill('삭제될 할일')
    await input.press('Enter')

    // 두 번째 항목만 완료
    await page.getByRole('checkbox').nth(1).click()

    // 완료된 항목 삭제
    await page.getByRole('button', { name: '완료된 항목 삭제' }).click()

    await expect(page.getByText('유지될 할일')).toBeVisible()
    await expect(page.getByText('삭제될 할일')).not.toBeVisible()
  })

  test('데이터가 localStorage에 저장되어 새로고침 후에도 유지된다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('영속화 테스트')
    await input.press('Enter')

    await expect(page.getByText('영속화 테스트')).toBeVisible()

    // 페이지 새로고침
    await page.reload()

    // 데이터 유지 확인
    await expect(page.getByText('영속화 테스트')).toBeVisible()
  })

  test('다크모드 토글 버튼이 표시된다', async ({ page }) => {
    const toggleButton = page.getByRole('button', { name: /모드로 전환/ })
    await expect(toggleButton).toBeVisible()
  })

  test('다크모드를 토글할 수 있다', async ({ page }) => {
    const html = page.locator('html')

    // 초기 상태: 라이트 모드
    await expect(html).not.toHaveClass(/dark/)

    // 다크모드로 전환
    await page.getByRole('button', { name: '다크 모드로 전환' }).click()
    await expect(html).toHaveClass(/dark/)

    // 라이트모드로 전환
    await page.getByRole('button', { name: '라이트 모드로 전환' }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('다크모드 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    const html = page.locator('html')

    // 다크모드로 전환
    await page.getByRole('button', { name: '다크 모드로 전환' }).click()
    await expect(html).toHaveClass(/dark/)

    // 페이지 새로고침
    await page.reload()

    // 다크모드 유지 확인
    await expect(html).toHaveClass(/dark/)
  })

  test('할일을 프리셋으로 저장할 수 있다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('프리셋 테스트')
    await input.press('Enter')

    // 프리셋 저장 버튼 클릭
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '프리셋 테스트' })
    await todoItem.hover()
    await page.getByRole('button', { name: '프리셋으로 저장' }).click()

    // 프리셋 목록에 표시 확인
    await expect(page.getByText('빠른 추가')).toBeVisible()
    await expect(page.getByRole('button', { name: '프리셋 테스트', exact: true })).toBeVisible()
  })

  test('프리셋을 클릭하면 할일이 추가된다', async ({ page }) => {
    // 할일 추가 후 프리셋으로 저장
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('반복 할일')
    await input.press('Enter')

    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '반복 할일' })
    await todoItem.hover()
    await page.getByRole('button', { name: '프리셋으로 저장' }).click()

    // 기존 할일 삭제
    await todoItem.hover()
    await page.getByRole('button', { name: '삭제', exact: true }).click()
    await expect(page.getByText('할 일이 없어요')).toBeVisible()

    // 프리셋 클릭으로 할일 추가
    await page.getByRole('button', { name: '반복 할일', exact: true }).click()
    await expect(page.locator('.rounded-lg.border').filter({ hasText: '반복 할일' })).toBeVisible()
    await expect(page.getByText('할 일이 없어요')).not.toBeVisible()
  })

  test('프리셋을 삭제할 수 있다', async ({ page }) => {
    // 할일 추가 후 프리셋으로 저장
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('삭제될 프리셋')
    await input.press('Enter')

    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '삭제될 프리셋' })
    await todoItem.hover()
    await page.getByRole('button', { name: '프리셋으로 저장' }).click()

    // 프리셋 삭제
    const presetContainer = page.locator('.group.relative').filter({ hasText: '삭제될 프리셋' })
    await presetContainer.hover()
    await page.getByRole('button', { name: '삭제될 프리셋 프리셋 삭제' }).click()

    // 프리셋 목록에서 사라짐 확인
    await expect(page.getByRole('button', { name: '삭제될 프리셋', exact: true })).not.toBeVisible()
  })

  test('프리셋이 새로고침 후에도 유지된다', async ({ page }) => {
    // 할일 추가 후 프리셋으로 저장
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('영속 프리셋')
    await input.press('Enter')

    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '영속 프리셋' })
    await todoItem.hover()
    await page.getByRole('button', { name: '프리셋으로 저장' }).click()

    // 페이지 새로고침
    await page.reload()

    // 프리셋 유지 확인
    await expect(page.getByRole('button', { name: '영속 프리셋', exact: true })).toBeVisible()
  })
})
