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

    // '삭제될 할일' 항목만 완료 (텍스트로 찾아서 체크)
    const todoToDelete = page.locator('.rounded-lg.border').filter({ hasText: '삭제될 할일' })
    await todoToDelete.getByRole('checkbox').click()

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

  test('옵션 설정 버튼을 클릭하면 날짜 입력 필드가 나타난다', async ({ page }) => {
    // 날짜 필드가 처음에는 보이지 않음
    await expect(page.getByLabel('시작일')).not.toBeVisible()

    // 옵션 설정 버튼 클릭
    await page.getByRole('button', { name: '옵션 설정' }).click()

    // 날짜 필드가 나타남
    await expect(page.getByText('시작일')).toBeVisible()
    await expect(page.getByText('종료일')).toBeVisible()
  })

  test('할일에 시작일과 종료일을 설정할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 할일 텍스트 입력
    await input.fill('날짜 있는 할일')

    // 옵션 설정 열기
    await page.getByRole('button', { name: '옵션 설정' }).click()

    // 날짜 입력
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await page.locator('input[type="date"]').first().fill(startDate)
    await page.locator('input[type="date"]').last().fill(endDate)

    // 할일 추가
    await page.getByRole('button', { name: '추가' }).click()

    // 할일과 날짜가 표시됨
    await expect(page.getByText('날짜 있는 할일')).toBeVisible()
    // 날짜 표시 확인 (날짜 텍스트로 확인)
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '날짜 있는 할일' })
    await expect(todoItem.locator('.text-xs')).toBeVisible() // Date display area
  })

  test('날짜 없이 할일을 추가할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    await input.fill('날짜 없는 할일')
    await input.press('Enter')

    // 할일이 표시되고 날짜 영역은 없음
    await expect(page.getByText('날짜 없는 할일')).toBeVisible()
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '날짜 없는 할일' })
    // Calendar icon should not be present
    await expect(todoItem.locator('.text-xs')).not.toBeVisible()
  })

  test('우선순위 옵션이 표시된다', async ({ page }) => {
    // 옵션 열기
    await page.getByRole('button', { name: '옵션 설정' }).click()

    // 우선순위 옵션들이 표시됨
    await expect(page.getByText('우선순위')).toBeVisible()
    await expect(page.getByRole('button', { name: '없음' })).toBeVisible()
    await expect(page.getByRole('button', { name: '높음' })).toBeVisible()
    await expect(page.getByRole('button', { name: '중간' })).toBeVisible()
    await expect(page.getByRole('button', { name: '낮음' })).toBeVisible()
  })

  test('할일에 우선순위를 설정할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    await input.fill('높은 우선순위 할일')

    // 옵션 열기
    await page.getByRole('button', { name: '옵션 설정' }).click()

    // 높음 우선순위 선택
    await page.getByRole('button', { name: '높음' }).click()

    // 할일 추가
    await page.getByRole('button', { name: '추가' }).click()

    // 할일과 우선순위 표시 확인
    await expect(page.getByText('높은 우선순위 할일')).toBeVisible()
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '높은 우선순위 할일' })
    // 빨간색 우선순위 표시가 있어야 함
    await expect(todoItem.locator('.bg-red-500')).toBeVisible()
  })

  test('우선순위 없이 할일을 추가할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    await input.fill('우선순위 없는 할일')
    await input.press('Enter')

    // 할일이 표시되고 우선순위 표시는 없음
    await expect(page.getByText('우선순위 없는 할일')).toBeVisible()
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '우선순위 없는 할일' })
    await expect(todoItem.locator('.bg-red-500')).not.toBeVisible()
    await expect(todoItem.locator('.bg-yellow-500')).not.toBeVisible()
    await expect(todoItem.locator('.bg-blue-500')).not.toBeVisible()
  })

  test('정렬 옵션 버튼들이 표시된다', async ({ page }) => {
    // 할일 추가
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('정렬 테스트')
    await input.press('Enter')

    // 정렬 버튼들 표시 확인
    await expect(page.getByRole('button', { name: /입력일/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /우선순위/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /시작일/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /종료일/ })).toBeVisible()
  })

  test('우선순위별로 정렬할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 낮은 우선순위 할일 추가
    await input.fill('낮은 우선순위')
    await page.getByRole('button', { name: '옵션 설정' }).click()
    await page.getByRole('button', { name: '낮음' }).click()
    await page.getByRole('button', { name: '추가' }).click()

    // 높은 우선순위 할일 추가
    await input.fill('높은 우선순위')
    await page.getByRole('button', { name: '높음' }).click()
    await page.getByRole('button', { name: '추가' }).click()

    // 우선순위 정렬 클릭
    await page.getByRole('button', { name: /우선순위/ }).click()

    // 첫 번째 항목이 높은 우선순위인지 확인
    const todoItems = page.locator('.rounded-lg.border')
    await expect(todoItems.first()).toContainText('높은 우선순위')
  })

  test('정렬 방향을 토글할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 할일 2개 추가
    await input.fill('할일 A')
    await input.press('Enter')
    await input.fill('할일 B')
    await input.press('Enter')

    // 입력일 정렬 클릭 (이미 기본 선택된 상태)
    const sortButton = page.getByRole('button', { name: /입력일/ })
    await sortButton.click()

    // 정렬 방향 아이콘 확인 (asc 또는 desc)
    await expect(sortButton.locator('svg')).toBeVisible()

    // 다시 클릭하면 방향 토글
    await sortButton.click()
    await expect(sortButton.locator('svg')).toBeVisible()
  })

  test('정렬 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('정렬 영속화 테스트')
    await input.press('Enter')

    // 우선순위 정렬 선택
    await page.getByRole('button', { name: /우선순위/ }).click()

    // 새로고침
    await page.reload()

    // 우선순위 버튼이 활성화된 상태인지 확인
    const priorityButton = page.getByRole('button', { name: /우선순위/ })
    await expect(priorityButton).toHaveClass(/text-primary/)
  })

  test('완료된 항목 숨기기 버튼이 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('숨기기 테스트')
    await input.press('Enter')

    // 완료 처리
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '숨기기 테스트' })
    await todoItem.getByRole('checkbox').click()

    // 숨기기 버튼 표시 확인
    await expect(page.getByRole('button', { name: /완료 숨기기/ })).toBeVisible()
  })

  test('완료된 항목을 숨길 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 할일 2개 추가
    await input.fill('미완료 할일')
    await input.press('Enter')
    await input.fill('완료될 할일')
    await input.press('Enter')

    // 하나 완료 처리
    const todoToComplete = page.locator('.rounded-lg.border').filter({ hasText: '완료될 할일' })
    await todoToComplete.getByRole('checkbox').click()

    // 숨기기 버튼 클릭
    await page.getByRole('button', { name: /완료 숨기기/ }).click()

    // 완료된 항목이 보이지 않음
    await expect(page.getByText('완료될 할일')).not.toBeVisible()
    // 미완료 항목은 보임
    await expect(page.getByText('미완료 할일')).toBeVisible()
    // 숨김 개수 표시
    await expect(page.getByText(/1개 숨김/)).toBeVisible()
  })

  test('숨긴 완료 항목을 다시 보이게 할 수 있다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('토글 테스트')
    await input.press('Enter')

    // 완료 처리
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '토글 테스트' })
    await todoItem.getByRole('checkbox').click()

    // 숨기기
    await page.getByRole('button', { name: /완료 숨기기/ }).click()
    await expect(page.getByText('토글 테스트')).not.toBeVisible()

    // 다시 보이기
    await page.getByRole('button', { name: /완료 보기/ }).click()
    await expect(page.getByText('토글 테스트')).toBeVisible()
  })

  test('완료 숨김 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')
    await input.fill('영속화 숨김 테스트')
    await input.press('Enter')

    // 완료 처리
    const todoItem = page.locator('.rounded-lg.border').filter({ hasText: '영속화 숨김 테스트' })
    await todoItem.getByRole('checkbox').click()

    // 숨기기
    await page.getByRole('button', { name: /완료 숨기기/ }).click()

    // 새로고침
    await page.reload()

    // 숨김 상태 유지 확인
    await expect(page.getByText('영속화 숨김 테스트')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /완료 보기/ })).toBeVisible()
  })

  test('뷰 전환 버튼이 표시된다', async ({ page }) => {
    await expect(page.getByRole('button', { name: /목록/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /달력/ })).toBeVisible()
  })

  test('달력 뷰로 전환할 수 있다', async ({ page }) => {
    // 달력 버튼 클릭
    await page.getByRole('button', { name: /달력/ }).click()

    // 달력 뷰 요소들이 표시됨
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible()
    await expect(page.getByText(/년.*월/)).toBeVisible()
    // 요일 헤더 확인 (정확한 매칭 사용)
    await expect(page.getByText('일', { exact: true })).toBeVisible()
    await expect(page.getByText('월', { exact: true })).toBeVisible()
  })

  test('달력에서 할일이 표시된다', async ({ page }) => {
    const input = page.getByPlaceholder('할 일을 입력하세요...')

    // 오늘 날짜로 할일 추가
    await input.fill('달력 테스트 할일')
    await page.getByRole('button', { name: '옵션 설정' }).click()

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    await page.locator('input[type="date"]').first().fill(todayStr)
    await page.getByRole('button', { name: '추가' }).click()

    // 달력 뷰로 전환
    await page.getByRole('button', { name: /달력/ }).click()

    // 달력에 할일이 표시됨
    await expect(page.getByText('달력 테스트 할일')).toBeVisible()
  })

  test('달력에서 이전/다음 월로 이동할 수 있다', async ({ page }) => {
    // 달력 뷰로 전환
    await page.getByRole('button', { name: /달력/ }).click()

    const currentMonthText = await page.getByText(/년.*월/).textContent()

    // 이전 월로 이동
    await page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).click()
    const prevMonthText = await page.getByText(/년.*월/).textContent()
    expect(prevMonthText).not.toBe(currentMonthText)

    // 오늘 버튼으로 복귀
    await page.getByRole('button', { name: '오늘' }).click()
    const todayMonthText = await page.getByText(/년.*월/).textContent()
    expect(todayMonthText).toBe(currentMonthText)
  })

  test('뷰 설정이 새로고침 후에도 유지된다', async ({ page }) => {
    // 달력 뷰로 전환
    await page.getByRole('button', { name: /달력/ }).click()
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible()

    // 새로고침
    await page.reload()

    // 달력 뷰 유지 확인
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible()
  })
})
