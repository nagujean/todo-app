import { test, expect } from '@playwright/test'

/**
 * Story 1.1: 할 일 추가하기
 *
 * Acceptance Criteria (AC-001):
 * - Given: 메인 페이지에 접속하고
 * - When: 텍스트 입력창에 "과제 제출하기"를 입력하고 추가 버튼을 클릭하면
 * - Then: 새로운 할 일이 목록 최상단에 추가되고 입력창은 초기화된다
 * - And: 추가된 할 일은 미완료 상태로 표시된다
 *
 * Edge Cases:
 * - 빈 제목 또는 공백만 입력 시 에러 메시지 표시
 * - 200자 초과 입력 시 자동 잘림
 * - Enter 키로도 추가 가능
 */
test.describe('Story 1.1: 할 일 추가하기', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('AC-001: 텍스트 입력창에 할 일을 입력하고 추가 버튼을 클릭하면 목록 최상단에 추가된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 메인 페이지에 접속하고
    await expect(page.getByText('할 일 목록')).toBeVisible()

    // When: 텍스트 입력창에 "과제 제출하기"를 입력하고 추가 버튼을 클릭하면
    await input.fill('과제 제출하기')
    await addButton.click()

    // Then: 새로운 할 일이 목록 최상단에 추가되고
    await expect(page.getByText('과제 제출하기')).toBeVisible()

    // 첫 번째 할 일 항목인지 확인 (최상단)
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems.first()).toContainText('과제 제출하기')

    // And: 입력창은 초기화된다
    await expect(input).toHaveValue('')
  })

  test('AC-001: 추가된 할 일은 미완료 상태로 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // When: 할 일을 추가하면
    await input.fill('과제 제출하기')
    await addButton.click()

    // Then: 추가된 할 일은 미완료 상태로 표시된다
    const checkbox = page.getByRole('checkbox')
    await expect(checkbox).not.toBeChecked()

    // 완료 표시(취소선)가 없어야 함
    const todoText = page.getByText('과제 제출하기')
    await expect(todoText).not.toHaveClass(/line-through/)
  })

  test('Edge Case: 빈 제목 입력 시 추가 버튼이 비활성화된다', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 입력창이 비어있으면
    // Then: 추가 버튼이 비활성화된다
    await expect(addButton).toBeDisabled()
  })

  test('Edge Case: 공백만 입력 시 추가되지 않는다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // When: 공백만 입력하면
    await input.fill('   ')

    // Then: 추가 버튼이 비활성화된다
    await expect(addButton).toBeDisabled()
  })

  test('Edge Case: Enter 키로 할 일을 추가할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // When: 제목 입력 후 Enter 키를 누르면
    await input.fill('Enter로 추가한 과제')
    await input.press('Enter')

    // Then: 할 일이 추가된다
    await expect(page.getByText('Enter로 추가한 과제')).toBeVisible()

    // And: 입력창이 초기화된다
    await expect(input).toHaveValue('')
  })

  test('Edge Case: 200자 초과 입력 시 자동으로 잘린다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // When: 200자가 넘는 텍스트를 입력하면
    const longText = 'A'.repeat(250)
    await input.fill(longText)

    // Then: 200자로 자동 잘림
    const inputValue = await input.inputValue()
    expect(inputValue.length).toBe(200)

    // 추가가 가능해야 함
    await expect(addButton).toBeEnabled()
    await addButton.click()
    await expect(page.getByText('A'.repeat(200))).toBeVisible()
  })

  test('할 일 ID는 UUID v4 형식을 따른다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // 할 일 추가
    await input.fill('UUID 테스트')
    await addButton.click()

    // localStorage에서 데이터 확인
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData).toBeTruthy()
    expect(storedData.state.todos).toHaveLength(1)

    // UUID v4 형식 검증 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    const todoId = storedData.state.todos[0].id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(todoId).toMatch(uuidRegex)
  })

  test('할 일 추가 시 createdAt이 ISO 8601 형식으로 기록된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // 할 일 추가
    await input.fill('시간 테스트')
    await addButton.click()

    // localStorage에서 데이터 확인
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData).toBeTruthy()
    const createdAt = storedData.state.todos[0].createdAt

    // ISO 8601 형식 검증
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    expect(createdAt).toMatch(isoRegex)
  })
})
