import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from './ViewToggle'
import { useTodoStore } from '@/store/todoStore'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

const mockSetViewMode = vi.fn()

function setupStore(viewMode: 'list' | 'calendar') {
  vi.mocked(useTodoStore).mockReturnValue({
    viewMode,
    setViewMode: mockSetViewMode,
  } as ReturnType<typeof useTodoStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ViewToggle', () => {
  it('renders list and calendar toggle buttons', () => {
    setupStore('list')
    render(<ViewToggle />)
    expect(screen.getByTitle('목록')).toBeInTheDocument()
    expect(screen.getByTitle('달력')).toBeInTheDocument()
  })

  it('calls setViewMode with calendar when calendar button is clicked', async () => {
    const user = userEvent.setup()
    setupStore('list')
    render(<ViewToggle />)
    await user.click(screen.getByTitle('달력'))
    expect(mockSetViewMode).toHaveBeenCalledWith('calendar')
  })

  it('calls setViewMode with list when list button is clicked', async () => {
    const user = userEvent.setup()
    setupStore('calendar')
    render(<ViewToggle />)
    await user.click(screen.getByTitle('목록'))
    expect(mockSetViewMode).toHaveBeenCalledWith('list')
  })

  it('renders button labels', () => {
    setupStore('list')
    render(<ViewToggle />)
    expect(screen.getByText('목록')).toBeInTheDocument()
    expect(screen.getByText('달력')).toBeInTheDocument()
  })
})
