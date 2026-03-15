import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarView } from './CalendarView'
import { useTodoStore } from '@/store/todoStore'
import { createMockTodo } from '@/__tests__/utils/factories'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useTodoStore).mockReturnValue({
    todos: [],
    hideCompleted: false,
    toggleTodo: vi.fn(),
    deleteTodo: vi.fn(),
    updateTodo: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useTodoStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('CalendarView', () => {
  it('renders calendar header with current month', () => {
    setupStore()
    render(<CalendarView />)
    const now = new Date()
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    expect(screen.getByText(`${now.getFullYear()}년 ${months[now.getMonth()]}`)).toBeInTheDocument()
  })

  it('renders day headers', () => {
    setupStore()
    render(<CalendarView />)
    expect(screen.getByText('일')).toBeInTheDocument()
    expect(screen.getByText('월')).toBeInTheDocument()
    expect(screen.getByText('화')).toBeInTheDocument()
    expect(screen.getByText('수')).toBeInTheDocument()
    expect(screen.getByText('목')).toBeInTheDocument()
    expect(screen.getByText('금')).toBeInTheDocument()
    expect(screen.getByText('토')).toBeInTheDocument()
  })

  it('renders navigation buttons', () => {
    setupStore()
    render(<CalendarView />)
    expect(screen.getByText('오늘')).toBeInTheDocument()
  })

  it('navigates to previous month', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CalendarView />)
    const now = new Date()
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    // Click prev month button (first icon button)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0]) // prev month
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    expect(screen.getByText(`${prevMonth.getFullYear()}년 ${months[prevMonth.getMonth()]}`)).toBeInTheDocument()
  })

  it('navigates to next month', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CalendarView />)
    const now = new Date()
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1]) // next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    expect(screen.getByText(`${nextMonth.getFullYear()}년 ${months[nextMonth.getMonth()]}`)).toBeInTheDocument()
  })

  it('shows todos count with dates', () => {
    const todos = [
      createMockTodo({ startDate: '2025-01-15' }),
      createMockTodo({ endDate: '2025-01-20' }),
    ]
    setupStore({ todos })
    render(<CalendarView />)
    expect(screen.getByText('2개의 일정')).toBeInTheDocument()
  })

  it('shows 0 events when no todos have dates', () => {
    const todos = [createMockTodo({})]
    setupStore({ todos })
    render(<CalendarView />)
    expect(screen.getByText('0개의 일정')).toBeInTheDocument()
  })

  it('renders priority legend', () => {
    setupStore()
    render(<CalendarView />)
    expect(screen.getByText('높음')).toBeInTheDocument()
    expect(screen.getByText('중간')).toBeInTheDocument()
    expect(screen.getByText('낮음')).toBeInTheDocument()
    expect(screen.getByText('기본')).toBeInTheDocument()
  })

  it('renders today button and navigates back', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CalendarView />)
    const now = new Date()
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    // Navigate away
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0]) // prev
    // Navigate back to today
    await user.click(screen.getByText('오늘'))
    expect(screen.getByText(`${now.getFullYear()}년 ${months[now.getMonth()]}`)).toBeInTheDocument()
  })
})
