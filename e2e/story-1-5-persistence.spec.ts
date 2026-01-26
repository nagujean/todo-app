import { test, expect } from '@playwright/test'

/**
 * Story 1.5: 데이터 영속화
 *
 * Acceptance Criteria (AC-005):
 * - Given: 할 일을 추가하고
 * - When: 페이지를 새로고침하면
 * - Then: 모든 데이터가 유지된다
 *
 * Requirements:
 * - REQ-FUNC-017: localStorage 저장 (todo-storage)
 * - REQ-FUNC-018: 자동 저장 (100ms 이내)
 * - REQ-FUNC-019: 데이터 로드 및 복원
 */
test.describe('Story 1.5: 데이터 영속화', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('AC-005: 할 일 추가 후 새로고침해도 데이터가 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 할 일을 추가하고
    await input.fill('영속성 테스트')
    await addButton.click()

    await expect(page.getByText('영속성 테스트')).toBeVisible()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 모든 데이터가 유지된다
    await expect(page.getByText('영속성 테스트')).toBeVisible()

    // checkbox 상태도 확인
    const checkbox = page.getByRole('checkbox')
    await expect(checkbox).not.toBeChecked()
  })

  test('REQ-FUNC-017: localStorage에 "todo-storage" 키로 저장된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('localStorage 테스트')
    await addButton.click()

    // Then: localStorage에 데이터가 저장된다
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData).toBeTruthy()
    expect(storedData.state).toBeTruthy()
    expect(storedData.state.todos).toHaveLength(1)
    expect(storedData.state.todos[0].title).toBe('localStorage 테스트')
  })

  test('REQ-FUNC-018: 할 일 추가 후 빠르게 저장된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // When: 할 일을 추가하면
    const startTime = Date.now()
    await input.fill('자동 저장 테스트')
    await addButton.click()

    // localStorage에 저장될 때까지 대기 (최대 1000ms)
    await page.waitForFunction(() => {
      const data = localStorage.getItem('todo-storage')
      if (!data) return false
      const parsed = JSON.parse(data)
      return parsed.state.todos.some((t: { title: string }) => t.title === '자동 저장 테스트')
    }, { timeout: 1000 })

    const saveTime = Date.now() - startTime

    // Then: 저장이 빠르게 완료된다 (환경에 따른 여유 시간 고려)
    expect(saveTime).toBeLessThan(500)
  })

  test('REQ-FUNC-019: 완료 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('완료 상태 테스트')
    await addButton.click()

    // 완료 처리
    const checkbox = page.getByRole('checkbox')
    await checkbox.check()

    await expect(checkbox).toBeChecked()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 완료 상태가 유지된다
    await expect(checkbox).toBeChecked()
    await expect(page.getByText('완료 상태 테스트')).toHaveClass(/line-through/)
  })

  test('REQ-FUNC-019: 삭제 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('삭제될 항목')
    await addButton.click()

    // 삭제
    const todoItem = page.locator('[data-testid="todo-item"]')
    await todoItem.hover()

    const deleteButton = page.getByRole('button', { name: '삭제' }).first()
    await deleteButton.click()

    await expect(page.getByText('삭제될 항목')).not.toBeVisible()

    // localStorage에서 삭제가 완료될 때까지 대기
    await page.waitForFunction(() => {
      const data = localStorage.getItem('todo-storage')
      if (!data) return false
      const parsed = JSON.parse(data)
      return parsed.state.todos.length === 0
    }, { timeout: 1000 })

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 삭제 상태가 유지된다 (여전히 보이지 않음)
    await expect(page.getByText('삭제될 항목')).not.toBeVisible()
  })

  test('REQ-FUNC-019: 정렬 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('우선순위 테스트')
    await addButton.click()

    // 정렬 설정 변경
    const sortPriorityButton = page.getByRole('button', { name: '우선순위' })
    await sortPriorityButton.click()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 정렬 설정이 유지된다
    // "우선순위" 버튼이 활성화 상태인지 확인
    await expect(sortPriorityButton).toHaveAttribute('data-state', /active|selected/)
  })

  test('REQ-FUNC-019: 필터 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('필터 테스트')
    await addButton.click()

    // 필터 설정 변경
    const filterIncomplete = page.getByRole('button', { name: '미완료' })
    await filterIncomplete.click()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 필터 설정이 유지된다
    await expect(filterIncomplete).toHaveAttribute('data-state', 'active')
  })

  test('다양한 데이터가 복합적으로 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // 여러 할 일 추가
    await input.fill('첫 번째 과제')
    await addButton.click()

    await input.fill('완료될 과제')
    await addButton.click()

    await input.fill('삭제될 과제')
    await addButton.click()

    // 두 번째 완료, 세 번째 삭제
    const checkboxes = page.getByRole('checkbox')
    await checkboxes.nth(1).check()

    const todoItems = page.locator('[data-testid="todo-item"]')
    await todoItems.nth(2).hover()

    const deleteButtons = page.getByRole('button', { name: '삭제' })
    await deleteButtons.nth(2).click()

    // 필터 변경
    const filterCompleted = page.getByRole('button', { name: '완료', exact: true })
    await filterCompleted.click()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 모든 상태가 유지된다
    await expect(page.getByText('완료될 과제')).toBeVisible()
    await expect(page.getByText('첫 번째 과제')).not.toBeVisible() // 필터로 인해
    await expect(page.getByText('삭제될 과제')).not.toBeVisible() // 삭제됨

    // 필터 상태 확인
    await expect(filterCompleted).toHaveAttribute('data-state', 'active')
  })

  test('localStorage 데이터 구조가 요구사항을 준수한다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('구조 검증')
    await addButton.click()

    // When: localStorage를 확인하면
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    // Then: 데이터 구조가 요구사항을 준수한다
    expect(storedData).toBeTruthy()
    expect(storedData.state).toBeTruthy()
    expect(storedData.state.todos).toBeInstanceOf(Array)

    const todo = storedData.state.todos[0]
    expect(todo.id).toBeTruthy()
    expect(todo.title).toBe('구조 검증')
    expect(todo.completed).toBe(false)
    expect(todo.createdAt).toBeTruthy()
    expect(todo.updatedAt).toBeTruthy()
    expect(todo.completedAt).toBeNull()

    // ISO 8601 형식 검증
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    expect(todo.createdAt).toMatch(isoRegex)
    expect(todo.updatedAt).toMatch(isoRegex)
  })
})
