import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTeamDialog } from './CreateTeamDialog'
import { useTeamStore } from '@/store/teamStore'

vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

const mockCreateTeam = vi.fn()
const mockSetCurrentTeam = vi.fn()

function setupStore() {
  vi.mocked(useTeamStore).mockReturnValue({
    createTeam: mockCreateTeam,
    setCurrentTeam: mockSetCurrentTeam,
  } as ReturnType<typeof useTeamStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('CreateTeamDialog', () => {
  it('renders dialog when open', () => {
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('새 팀 만들기')).toBeInTheDocument()
    expect(screen.getByLabelText(/팀 이름/)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    setupStore()
    render(<CreateTeamDialog open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByText('새 팀 만들기')).not.toBeInTheDocument()
  })

  it('renders name and description fields', () => {
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('팀 이름을 입력하세요')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('팀에 대한 설명을 입력하세요')).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '만들기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
  })

  it('disables submit when name is empty', () => {
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })

  it('enables submit when name has value', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('팀 이름을 입력하세요'), 'New Team')
    expect(screen.getByRole('button', { name: '만들기' })).toBeEnabled()
  })

  it('calls createTeam on submit', async () => {
    const user = userEvent.setup()
    mockCreateTeam.mockResolvedValue('team-new')
    setupStore()
    const onOpenChange = vi.fn()
    render(<CreateTeamDialog open={true} onOpenChange={onOpenChange} />)
    await user.type(screen.getByPlaceholderText('팀 이름을 입력하세요'), 'New Team')
    await user.click(screen.getByRole('button', { name: '만들기' }))
    await waitFor(() => {
      expect(mockCreateTeam).toHaveBeenCalledWith('New Team', undefined)
    })
    expect(mockSetCurrentTeam).toHaveBeenCalledWith('team-new')
  })

  it('shows error when createTeam returns null', async () => {
    const user = userEvent.setup()
    mockCreateTeam.mockResolvedValue(null)
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('팀 이름을 입력하세요'), 'New Team')
    await user.click(screen.getByRole('button', { name: '만들기' }))
    await waitFor(() => {
      expect(screen.getByText('팀 생성에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('shows error when name is only whitespace', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    // Type spaces then clear to trigger empty validation
    await user.type(screen.getByPlaceholderText('팀 이름을 입력하세요'), '   ')
    // The button should be disabled because trim() is empty
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })

  it('shows character count for name', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<CreateTeamDialog open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('팀 이름을 입력하세요'), 'Hello')
    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup()
    setupStore()
    const onOpenChange = vi.fn()
    render(<CreateTeamDialog open={true} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
