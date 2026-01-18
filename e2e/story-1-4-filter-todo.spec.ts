import { test, expect } from '@playwright/test'

/**
 * Story 1.4: 할 일 필터링하기
 *
 * Acceptance Criteria (AC-005):
 * - Given: 목록에 완료된 항목과 미완료 항목이 섞여 있고
 * - When: 필터 버튼을 클릭하면
 * - Then: 해당 상태의 항목만 표시된다
 *
 * Requirements:
 * - REQ-FUNC-014: 필터 모드 (전체/미완료/완료)
 * - REQ-FUNC-015: 필터 상태에 따른 목록 필터링
 * - REQ-FUNC-016: 필터 상태 유지 (localStorage)
 */
test.describe('Story 1.4: 할 일 필터링하기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('AC-005: 필터 모드에 따라 할 일이 필터링된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    // Given: 목록에 완료된 항목과 미완료 항목이 섞여 있고
    await input.fill('미완료 과제 1')
    await addButton.click()

    await input.fill('미완료 과제 2')
    await addButton.click()

    await input.fill('완료된 과제')
    await addButton.click()

    // 세 번째 항목 완료
    const checkboxes = page.getByRole('checkbox')
    await checkboxes.nth(2).check()

    // When: "미완료" 필터를 선택하면
    const filterIncomplete = page.getByRole('button', { name: '미완료' })
    await filterIncomplete.click()

    // Then: 미완료 항목만 표시된다
    await expect(page.getByText('미완료 과제 1')).toBeVisible()
    await expect(page.getByText('미완료 과제 2')).toBeVisible()
    await expect(page.getByText('완료된 과제')).not.toBeVisible()
  })

  test('REQ-FUNC-014: 필터 모드 - 전체/미완료/완료 버튼이 표시된다', async ({ page }) => {
    // Given: 메인 페이지에 접속하면
    await page.goto('/')

    // Then: 필터 버튼들이 표시된다
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible()
    await expect(page.getByRole('button', { name: '미완료' })).toBeVisible()
    await expect(page.getByRole('button', { name: '완료' })).toBeVisible()
  })

  test('REQ-FUNC-015: "완료" 필터를 선택하면 완료된 항목만 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('완료될 과제')
    await addButton.click()

    await input.fill('미완료 과제')
    await addButton.click()

    // 첫 번째 항목 완료
    await page.getByRole('checkbox').first().check()

    // When: "완료" 필터를 선택하면
    const filterCompleted = page.getByRole('button', { name: '완료' })
    await filterCompleted.click()

    // Then: 완료된 항목만 표시된다
    await expect(page.getByText('완료될 과제')).toBeVisible()
    await expect(page.getByText('미완료 과제')).not.toBeVisible()
  })

  test('REQ-FUNC-015: "전체" 필터를 선택하면 모든 항목이 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('미완료 과제')
    await addButton.click()

    await input.fill('완료될 과제')
    await addButton.click()

    await page.getByRole('checkbox').nth(1).check()

    // When: "전체" 필터를 선택하면
    const filterAll = page.getByRole('button', { name: '전체' })
    await filterAll.click()

    // Then: 모든 항목이 표시된다
    await expect(page.getByText('미완료 과제')).toBeVisible()
    await expect(page.getByText('완료될 과제')).toBeVisible()
  })

  test('REQ-FUNC-016: 필터 상태가 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('미완료 과제')
    await addButton.click()

    await input.fill('완료될 과제')
    await addButton.click()

    await page.getByRole('checkbox').nth(1).check()

    // "완료" 필터 선택
    const filterCompleted = page.getByRole('button', { name: '완료' })
    await filterCompleted.click()

    // When: 페이지를 새로고침하면
    await page.reload()

    // Then: 필터 상태가 유지된다
    await expect(page.getByText('완료될 과제')).toBeVisible()
    await expect(page.getByText('미완료 과제')).not.toBeVisible()

    // "완료" 버튼이 활성화 상태인지 확인
    await expect(filterCompleted).toHaveAttribute('data-state', 'active')
  })

  test('필터 상태가 localStorage에 저장된다', async ({ page }) => {
    // When: "미완료" 필터를 선택하면
    const filterIncomplete = page.getByRole('button', { name: '미완료' })
    await filterIncomplete.click()

    // Then: localStorage에 필터 상태가 저장된다
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-storage')
      return data ? JSON.parse(data) : null
    })

    expect(storedData).toBeTruthy()
    expect(storedData.state.hideCompleted).toBe(true)
  })

  test('빈 목록에서 필터를 변경해도 안내 메시지가 표시된다', async ({ page }) => {
    // Given: 빈 목록에서 "완료" 필터를 선택하면
    const filterCompleted = page.getByRole('button', { name: '완료' })
    await filterCompleted.click()

    // Then: 빈 상태 안내 메시지가 표시된다
    await expect(page.getByText('할 일이 없어요')).toBeVisible()
  })

  test('필터 변경 시 진행 상황이 필터링된 항목 기준으로 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    const addButton = page.getByRole('button', { name: '추가' })

    await input.fill('미완료 1')
    await addButton.click()

    await input.fill('미완료 2')
    await addButton.click()

    await input.fill('완료됨')
    await addButton.click()

    await page.getByRole('checkbox').nth(2).check()

    // "미완료" 필터 선택
    const filterIncomplete = page.getByRole('button', { name: '미완료' })
    await filterIncomplete.click()

    // Then: 진행 상황이 필터링된 항목 기준으로 표시됨
    await expect(page.getByText('0/2 완료')).toBeVisible()
  })
})
