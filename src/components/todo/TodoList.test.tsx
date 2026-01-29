import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from './TodoList'
import { useTodoStore } from '@/store/todoStore'
import { usePresetStore } from '@/store/presetStore'
import { createMockTodo } from '@/__tests__/utils/factories'

vi.mock('@/store/todoStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/todoStore')>()
  return {
    ...actual,
    useTodoStore: vi.fn(),
  }
})

vi.mock('@/store/presetStore', () => ({
  usePresetStore: vi.fn(() => ({
    presets: [],
    addPreset: vi.fn(),
  })),
}))

// Mock Dialog portal for TodoDetail
vi.mock('@radix-ui/react-dialog', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

const defaultStoreValue = {
  todos: [] as ReturnType<typeof createMockTodo>[],
  clearCompleted: vi.fn(),
  sortType: 'created' as const,
  sortOrder: 'asc' as const,
  setSortType: vi.fn(),
  setSortOrder: vi.fn(),
  filterMode: 'all' as const,
  setFilterMode: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
  updateTodo: vi.fn(),
  hideCompleted: false,
}

function setupStore(overrides: Partial<typeof defaultStoreValue> = {}) {
  const value = { ...defaultStoreValue, ...overrides }
  vi.mocked(useTodoStore).mockReturnValue(value as ReturnType<typeof useTodoStore>)
  return value
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('TodoList', () => {
  it('renders empty state when no todos', () => {
    setupStore({ todos: [] })
    render(<TodoList />)
    expect(screen.getByText('할 일이 없어요')).toBeInTheDocument()
    expect(screen.getByText(/새로운 할 일을 추가해보세요/)).toBeInTheDocument()
  })

  it('renders filter buttons in empty state', () => {
    setupStore({ todos: [] })
    render(<TodoList />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('미완료')).toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('renders sort buttons in empty state', () => {
    setupStore({ todos: [] })
    render(<TodoList />)
    expect(screen.getByText('입력일')).toBeInTheDocument()
    expect(screen.getByText('우선순위')).toBeInTheDocument()
    expect(screen.getByText('시작일')).toBeInTheDocument()
    expect(screen.getByText('종료일')).toBeInTheDocument()
  })

  it('renders todo items when todos exist', () => {
    const todos = [
      createMockTodo({ id: 't1', title: 'Task 1' }),
      createMockTodo({ id: 't2', title: 'Task 2' }),
    ]
    setupStore({ todos })
    render(<TodoList />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })

  it('shows completion count', () => {
    const todos = [
      createMockTodo({ id: 't1', completed: true }),
      createMockTodo({ id: 't2', completed: false }),
      createMockTodo({ id: 't3', completed: true }),
    ]
    setupStore({ todos })
    render(<TodoList />)
    expect(screen.getByText('2/3 완료')).toBeInTheDocument()
  })

  it('shows clear completed button when completed items exist', () => {
    const todos = [
      createMockTodo({ id: 't1', completed: true }),
      createMockTodo({ id: 't2', completed: false }),
    ]
    setupStore({ todos })
    render(<TodoList />)
    expect(screen.getByText('완료된 항목 삭제')).toBeInTheDocument()
  })

  it('does not show clear completed button when no completed items', () => {
    const todos = [
      createMockTodo({ id: 't1', completed: false }),
    ]
    setupStore({ todos })
    render(<TodoList />)
    expect(screen.queryByText('완료된 항목 삭제')).not.toBeInTheDocument()
  })

  it('calls clearCompleted when button is clicked', async () => {
    const user = userEvent.setup()
    const todos = [createMockTodo({ completed: true })]
    const store = setupStore({ todos })
    render(<TodoList />)
    await user.click(screen.getByText('완료된 항목 삭제'))
    expect(store.clearCompleted).toHaveBeenCalled()
  })

  it('calls setFilterMode when filter button is clicked', async () => {
    const user = userEvent.setup()
    const todos = [createMockTodo()]
    const store = setupStore({ todos })
    render(<TodoList />)
    await user.click(screen.getByText('미완료'))
    expect(store.setFilterMode).toHaveBeenCalledWith('incomplete')
  })

  it('shows filtered empty message for completed filter', () => {
    const todos = [createMockTodo({ completed: false })]
    setupStore({ todos, filterMode: 'completed' })
    render(<TodoList />)
    expect(screen.getByText('완료된 할 일이 없습니다.')).toBeInTheDocument()
  })

  it('shows filtered empty message for incomplete filter', () => {
    const todos = [createMockTodo({ completed: true })]
    setupStore({ todos, filterMode: 'incomplete' })
    render(<TodoList />)
    expect(screen.getByText('모든 할 일을 완료했습니다!')).toBeInTheDocument()
  })
})
