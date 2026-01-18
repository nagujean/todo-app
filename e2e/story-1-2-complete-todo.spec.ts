import { test, expect } from '@playwright/test'

/**
 * Story 1.2: 할 일 완료하기
 *
 * Acceptance Criteria (AC-002):
 * - Given: 목록에 "과제 제출하기" 할 일이 있고
 * - When: 체크박스를 클릭하면
 * - Then: 할 일이 완료 상태로 변경되고 completedAt에 시각이 기록된다
 * - And: 텍스트에 취소선이 표시되고 투명도가 적용된다
 *
 * Requirements:
 * - REQ-FUNC-005: 체크박스 클릭 시 완료 상태 토글
 * - REQ-FUNC-006: 완료 시 completedAt에 ISO 8601 형식 시각 기록
 * - REQ-FUNC-007: 시각적 구분 (취소선, 투명도)
 */
test.describe('Story 1.2: 할 일 완료하기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('AC-002: 체크박스를 클릭하면 할 일이 완료 상태로 변경된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 목록에 "과제 제출하기" 할 일이 있고
    await input.fill('과제 제출하기')
    await addButton.click()

    // When: 체크박스를 클릭하면
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()

    // Then: 할 일이 완료 상태로 변경되고
    await expect(checkbox).toBeChecked()

    // And: 취소선이 표시된다
    const todoText = page.getByText('과제 제출하기')
    await expect(todoText).toHaveClass(/line-through/)
  })

  test('AC-002: 완료 시 completedAt에 ISO 8601 형식 시각이 기록된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 목록에 할 일이 있고
    await input.fill('시간 기록 테스트')
    await addButton.click()

    // When: 체크박스를 클릭하면
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()

    // Then: completedAt에 ISO 8601 형식 시각이 기록된다
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData).toBeTruthy()
    const todo = storedData.state.todos[0]
    expect(todo.completed).toBe(true)
    expect(todo.completedAt).toBeTruthy()

    // ISO 8601 형식 검증
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    expect(todo.completedAt).toMatch(isoRegex)
  })

  test('REQ-FUNC-005: 체크박스를 다시 클릭하면 미완료 상태로 토글된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 완료된 할 일이 있고
    await input.fill('토글 테스트')
    await addButton.click()

    const checkbox = page.getByRole('checkbox')
    await checkbox.click() // 완료
    await expect(checkbox).toBeChecked()

    // When: 체크박스를 다시 클릭하면
    await checkbox.click()

    // Then: 미완료 상태로 토글된다
    await expect(checkbox).not.toBeChecked()

    // And: completedAt이 null로 설정된다
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData.state.todos[0].completed).toBe(false)
    expect(storedData.state.todos[0].completedAt).toBeNull()
  })

  test('REQ-FUNC-007: 완료된 항목은 투명도가 적용된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('투명도 테스트')
    await addButton.click()

    const checkbox = page.getByRole('checkbox')
    const todoItem = page.locator('[data-testid="todo-item"]')

    // 완료 전: 투명도 없음
    const beforeOpacity = await todoItem.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })
    expect(beforeOpacity).toBe('1')

    // 완료 후: 투명도 적용
    await checkbox.click()
    const afterOpacity = await todoItem.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })
    expect(parseFloat(afterOpacity)).toBeLessThan(1)
  })

  test('REQ-FUNC-007: 완료된 항목은 텍스트에 취소선이 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('취소선 테스트')
    await addButton.click()

    const checkbox = page.getByRole('checkbox')
    const todoText = page.getByText('취소선 테스트')

    // 완료 전: 취소선 없음
    await expect(todoText).not.toHaveClass(/line-through/)

    // 완료 후: 취소선 표시
    await checkbox.click()
    await expect(todoText).toHaveClass(/line-through/)
  })

  test('완료 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('영속성 테스트')
    await addButton.click()

    const checkbox = page.getByRole('checkbox')
    await checkbox.click()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 완료 상태가 유지된다
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('영속성 테스트')).toHaveClass(/line-through/)
  })

  test('updatedAt이 완료/미완료 변경 시 업데이트된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('updatedAt 테스트')
    await addButton.click()

    // 초기 updatedAt 기록
    const storedData1 = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })
    const initialUpdatedAt = storedData1.state.todos[0].updatedAt

    // 100ms 대기 후 완료 처리
    await page.waitForTimeout(100)

    const checkbox = page.getByRole('checkbox')
    await checkbox.click()

    // When: 완료 처리 후
    const storedData2 = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })
    const updatedUpdatedAt = storedData2.state.todos[0].updatedAt

    // Then: updatedAt이 업데이트된다
    expect(updatedUpdatedAt).not.toBe(initialUpdatedAt)
    expect(new Date(updatedUpdatedAt).getTime()).toBeGreaterThan(
      new Date(initialUpdatedAt).getTime()
    )
  })
})
