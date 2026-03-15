import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoDetail } from './TodoDetail'
import { useTodoStore } from '@/store/todoStore'
import { createMockTodo } from '@/__tests__/utils/factories'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

const mockUpdateTodo = vi.fn()
const mockToggleTodo = vi.fn()
const mockDeleteTodo = vi.fn()

beforeEach(() => {
  vi.mocked(useTodoStore).mockReturnValue({
    updateTodo: mockUpdateTodo,
    toggleTodo: mockToggleTodo,
    deleteTodo: mockDeleteTodo,
  } as ReturnType<typeof useTodoStore>)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('TodoDetail', () => {
  it('renders nothing when todo is null', () => {
    const { container } = render(
      <TodoDetail todo={null} open={true} onOpenChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog with todo title when open', () => {
    const todo = createMockTodo({ title: 'Test Todo' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('할 일 상세')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument()
  })

  it('renders description field', () => {
    const todo = createMockTodo({ description: 'Some description' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Some description')).toBeInTheDocument()
  })

  it('renders priority options', () => {
    const todo = createMockTodo({ priority: 'high' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('없음')).toBeInTheDocument()
    expect(screen.getByText('높음')).toBeInTheDocument()
    expect(screen.getByText('중간')).toBeInTheDocument()
    expect(screen.getByText('낮음')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    const todo = createMockTodo()
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
  })

  it('renders toggle complete button for incomplete todo', () => {
    const todo = createMockTodo({ completed: false })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '완료로 변경' })).toBeInTheDocument()
  })

  it('renders toggle complete button for completed todo', () => {
    const todo = createMockTodo({ completed: true })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '미완료로 변경' })).toBeInTheDocument()
  })

  it('calls toggleTodo when toggle button is clicked', async () => {
    const user = userEvent.setup()
    const todo = createMockTodo({ id: 'td-1' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '완료로 변경' }))
    expect(mockToggleTodo).toHaveBeenCalledWith('td-1')
  })

  it('calls deleteTodo when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const todo = createMockTodo({ id: 'td-del' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(mockDeleteTodo).toHaveBeenCalledWith('td-del')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls updateTodo when save button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const todo = createMockTodo({ id: 'td-save', title: 'Original' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={onOpenChange} />)
    const input = screen.getByDisplayValue('Original')
    await user.clear(input)
    await user.type(input, 'Updated')
    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(mockUpdateTodo).toHaveBeenCalledWith(expect.objectContaining({
      id: 'td-save',
      title: 'Updated',
    }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const todo = createMockTodo()
    render(<TodoDetail todo={todo} open={true} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables save button when title is empty', async () => {
    const user = userEvent.setup()
    const todo = createMockTodo({ title: 'Original' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    const input = screen.getByDisplayValue('Original')
    await user.clear(input)
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('renders creation date', () => {
    const todo = createMockTodo({ createdAt: '2025-01-15T10:00:00.000Z' })
    render(<TodoDetail todo={todo} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText(/생성:/)).toBeInTheDocument()
  })
})
