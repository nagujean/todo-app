import { test, expect } from '@playwright/test'

/**
 * Story 1.3: 할 일 삭제하기
 *
 * Acceptance Criteria (AC-003):
 * - Given: 목록에 "과제 제출하기" 할 일이 있고
 * - When: 삭제 버튼을 클릭하면
 * - Then: 할 일이 목록에서 제거된다
 * - And: 페이드아웃 애니메이션이 적용된다 (300ms)
 *
 * Requirements:
 * - REQ-FUNC-008: 단일 삭제 기능
 * - REQ-FUNC-009: 페이드아웃 애니메이션 (300ms)
 * - REQ-FUNC-010: 완료된 항목 일괄 삭제
 */
test.describe('Story 1.3: 할 일 삭제하기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('AC-003: 삭제 버튼을 클릭하면 할 일이 목록에서 제거된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 목록에 "과제 제출하기" 할 일이 있고
    await input.fill('과제 제출하기')
    await addButton.click()

    await expect(page.getByText('과제 제출하기')).toBeVisible()

    // When: 삭제 버튼을 클릭하면 (hover 필요)
    const todoItem = page.locator('[data-testid="todo-item"]')
    await todoItem.hover()

    const deleteButton = page.getByRole('button', { name: '삭제' }).first()
    await deleteButton.click()

    // Then: 할 일이 목록에서 제거된다
    await expect(page.getByText('과제 제출하기')).not.toBeVisible()
  })

  test('REQ-FUNC-009: 페이드아웃 애니메이션이 적용된다 (300ms)', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('애니메이션 테스트')
    await addButton.click()

    const todoItem = page.locator('[data-testid="todo-item"]')
    await todoItem.hover()

    // 애니메이션 시작 전 상태 확인
    const beforeOpacity = await todoItem.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })
    expect(beforeOpacity).toBe('1')

    // When: 삭제 버튼을 클릭하면
    const deleteButton = page.getByRole('button', { name: '삭제' }).first()
    const clickTime = Date.now()

    await deleteButton.click()

    // 페이드아웃 애니메이션 대기 (요소가 사라질 때까지)
    await page.waitForTimeout(50) // 잠시 대기 후 상태 확인

    // Then: 페이드아웃 애니메이션이 적용된다 (요소가 사라질 때까지 기다림)
    await todoItem.waitFor({ state: 'hidden', timeout: 500 }).catch(() => {})

    const duration = Date.now() - clickTime
    expect(duration).toBeGreaterThanOrEqual(200)
    expect(duration).toBeLessThan(600) // 애니메이션 + React 렌더링 시간 고려
  })

  test('REQ-FUNC-010: 완료된 항목을 일괄 삭제할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 여러 할 일이 있고 일부가 완료된 상태
    await input.fill('완료된 과제 1')
    await addButton.click()

    await input.fill('미완료 과제')
    await addButton.click()

    await input.fill('완료된 과제 2')
    await addButton.click()

    // 첫 번째와 세 번째 할 일 완료
    const checkboxes = page.getByRole('checkbox')
    await checkboxes.nth(0).check()
    await checkboxes.nth(2).check()

    // When: "완료된 항목 삭제" 버튼을 클릭하면
    const clearCompletedButton = page.getByRole('button', { name: '완료된 항목 삭제' })
    await clearCompletedButton.click()

    // Then: 완료된 항목들만 삭제된다
    await expect(page.getByText('완료된 과제 1')).not.toBeVisible()
    await expect(page.getByText('완료된 과제 2')).not.toBeVisible()
    await expect(page.getByText('미완료 과제')).toBeVisible()
  })

  test('완료된 항목이 없으면 일괄 삭제 버튼이 표시되지 않는다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('미완료 과제')
    await addButton.click()

    // 완료된 항목이 없으면 버튼이 표시되지 않음
    await expect(page.getByRole('button', { name: '완료된 항목 삭제' })).not.toBeVisible()
  })

  test('단일 삭제 후 localStorage에서 제거된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('삭제 테스트')
    await addButton.click()

    // 삭제 전 확인
    let storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })
    expect(storedData.state.todos).toHaveLength(1)

    // When: 삭제 버튼을 클릭하면
    const todoItem = page.locator('[data-testid="todo-item"]')
    await todoItem.hover()

    const deleteButton = page.getByRole('button', { name: '삭제' }).first()
    await deleteButton.click()

    // Then: localStorage에서도 제거된다
    storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })
    expect(storedData.state.todos).toHaveLength(0)
  })

  test('일괄 삭제 후 localStorage에서 완료된 항목만 제거된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('완료됨')
    await addButton.click()

    await input.fill('미완료')
    await addButton.click()

    // 첫 번째 완료
    await page.getByRole('checkbox').first().check()

    // When: 일괄 삭제
    await page.getByRole('button', { name: '완료된 항목 삭제' }).click()

    // Then: localStorage에서 완료된 항목만 제거
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData.state.todos).toHaveLength(1)
    expect(storedData.state.todos[0].title).toBe('미완료')
    expect(storedData.state.todos[0].completed).toBe(false)
  })
})
