import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoInput } from './TodoInput'
import { useTodoStore } from '@/store/todoStore'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

const mockAddTodo = vi.fn()

beforeEach(() => {
  vi.mocked(useTodoStore).mockImplementation((selector?: unknown) => {
    const state = { addTodo: mockAddTodo }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useTodoStore>
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('TodoInput', () => {
  it('renders input field with placeholder', () => {
    render(<TodoInput />)
    expect(screen.getByPlaceholderText('할 일을 입력하세요...')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<TodoInput />)
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
  })

  it('submit button is disabled when input is empty', () => {
    render(<TodoInput />)
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled()
  })

  it('submit button is enabled when input has text', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByPlaceholderText('할 일을 입력하세요...'), 'New task')
    expect(screen.getByRole('button', { name: '추가' })).toBeEnabled()
  })

  it('calls addTodo when form is submitted', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByPlaceholderText('할 일을 입력하세요...'), 'New task')
    await user.click(screen.getByRole('button', { name: '추가' }))
    expect(mockAddTodo).toHaveBeenCalledWith(expect.objectContaining({ title: 'New task' }))
  })

  it('clears input after submission', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')
    await user.type(input, 'New task')
    await user.click(screen.getByRole('button', { name: '추가' }))
    expect(input).toHaveValue('')
  })

  it('does not submit when input is only whitespace', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByPlaceholderText('할 일을 입력하세요...'), '   ')
    await user.click(screen.getByRole('button', { name: '추가' }))
    expect(mockAddTodo).not.toHaveBeenCalled()
  })

  it('shows character count when typing', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByPlaceholderText('할 일을 입력하세요...'), 'Hello')
    expect(screen.getByText('5/200')).toBeInTheDocument()
  })

  it('shows options toggle button', () => {
    render(<TodoInput />)
    expect(screen.getByLabelText('옵션 설정')).toBeInTheDocument()
  })

  it('shows options panel when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.click(screen.getByLabelText('옵션 설정'))
    expect(screen.getByText('상세 내용')).toBeInTheDocument()
    expect(screen.getByText('우선순위')).toBeInTheDocument()
    expect(screen.getByText('시작일')).toBeInTheDocument()
    expect(screen.getByText('종료일')).toBeInTheDocument()
  })

  it('hides options panel when toggle is clicked again', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.click(screen.getByLabelText('옵션 설정'))
    expect(screen.getByText('상세 내용')).toBeInTheDocument()
    await user.click(screen.getByLabelText('옵션 숨기기'))
    expect(screen.queryByText('상세 내용')).not.toBeInTheDocument()
  })

  it('submits with priority when selected', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.click(screen.getByLabelText('옵션 설정'))
    await user.click(screen.getByText('높음'))
    await user.type(screen.getByPlaceholderText('할 일을 입력하세요...'), 'Important task')
    await user.click(screen.getByRole('button', { name: '추가' }))
    expect(mockAddTodo).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Important task',
      priority: 'high',
    }))
  })

  it('enforces 200 character limit', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    const input = screen.getByPlaceholderText('할 일을 입력하세요...')
    expect(input).toHaveAttribute('maxLength', '200')
  })
})
