import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoItem } from './TodoItem'
import { useTodoStore } from '@/store/todoStore'
import { usePresetStore } from '@/store/presetStore'
import { createMockTodo } from '@/__tests__/utils/factories'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

vi.mock('@/store/presetStore', () => ({
  usePresetStore: vi.fn(),
}))

const mockToggleTodo = vi.fn()
const mockDeleteTodo = vi.fn()
const mockAddPreset = vi.fn()

beforeEach(() => {
  vi.mocked(useTodoStore).mockReturnValue({
    toggleTodo: mockToggleTodo,
    deleteTodo: mockDeleteTodo,
  } as ReturnType<typeof useTodoStore>)

  vi.mocked(usePresetStore).mockReturnValue({
    presets: [],
    addPreset: mockAddPreset,
  } as ReturnType<typeof usePresetStore>)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('TodoItem', () => {
  it('renders todo title', () => {
    const todo = createMockTodo({ title: 'Buy groceries' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('renders with test id', () => {
    const todo = createMockTodo()
    render(<TodoItem todo={todo} />)
    expect(screen.getByTestId('todo-item')).toBeInTheDocument()
  })

  it('renders checkbox reflecting completed state', () => {
    const todo = createMockTodo({ completed: false })
    render(<TodoItem todo={todo} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked checkbox for completed todo', () => {
    const todo = createMockTodo({ completed: true })
    render(<TodoItem todo={todo} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls toggleTodo when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const todo = createMockTodo({ id: 'todo-1' })
    render(<TodoItem todo={todo} />)
    await user.click(screen.getByRole('checkbox'))
    expect(mockToggleTodo).toHaveBeenCalledWith('todo-1')
  })

  it('renders priority indicator for high priority', () => {
    const todo = createMockTodo({ priority: 'high' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByLabelText(/우선순위: 높음/)).toBeInTheDocument()
  })

  it('renders priority indicator for medium priority', () => {
    const todo = createMockTodo({ priority: 'medium' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByLabelText(/우선순위: 중간/)).toBeInTheDocument()
  })

  it('renders priority indicator for low priority', () => {
    const todo = createMockTodo({ priority: 'low' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByLabelText(/우선순위: 낮음/)).toBeInTheDocument()
  })

  it('does not render priority indicator when no priority', () => {
    const todo = createMockTodo({ priority: undefined })
    render(<TodoItem todo={todo} />)
    expect(screen.queryByLabelText(/우선순위/)).not.toBeInTheDocument()
  })

  it('calls deleteTodo when delete button is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const todo = createMockTodo({ id: 'todo-del' })
    render(<TodoItem todo={todo} />)
    await user.click(screen.getByText('삭제'))
    vi.advanceTimersByTime(300)
    expect(mockDeleteTodo).toHaveBeenCalledWith('todo-del')
    vi.useRealTimers()
  })

  it('shows save as preset button when not already a preset', () => {
    const todo = createMockTodo({ title: 'Unique task' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByLabelText('프리셋으로 저장')).toBeInTheDocument()
  })

  it('hides save as preset button when already a preset', () => {
    const todo = createMockTodo({ title: 'Existing preset' })
    vi.mocked(usePresetStore).mockReturnValue({
      presets: [{ id: 'p1', title: 'Existing preset', createdAt: '' }],
      addPreset: mockAddPreset,
    } as ReturnType<typeof usePresetStore>)
    render(<TodoItem todo={todo} />)
    expect(screen.queryByLabelText('프리셋으로 저장')).not.toBeInTheDocument()
  })

  it('calls onOpenDetail when item is clicked', async () => {
    const user = userEvent.setup()
    const todo = createMockTodo()
    const onOpenDetail = vi.fn()
    render(<TodoItem todo={todo} onOpenDetail={onOpenDetail} />)
    await user.click(screen.getByTestId('todo-item'))
    expect(onOpenDetail).toHaveBeenCalledWith(todo)
  })

  it('renders date range when both startDate and endDate are set', () => {
    const todo = createMockTodo({ startDate: '2025-01-15', endDate: '2025-01-20' })
    render(<TodoItem todo={todo} />)
    expect(screen.getByText(/~/)).toBeInTheDocument()
  })
})
