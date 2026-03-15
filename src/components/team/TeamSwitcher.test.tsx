import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamSwitcher } from './TeamSwitcher'
import { useTeamStore } from '@/store/teamStore'

vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

vi.mock('./CreateTeamDialog', () => ({
  CreateTeamDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="create-team-dialog">Create Team Dialog</div> : null,
}))

const mockSetCurrentTeam = vi.fn()

function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useTeamStore).mockReturnValue({
    teams: [],
    currentTeamId: null,
    currentTeam: null,
    setCurrentTeam: mockSetCurrentTeam,
    isLoading: false,
    getUserRole: vi.fn(() => null),
    ...overrides,
  } as ReturnType<typeof useTeamStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('TeamSwitcher', () => {
  it('renders workspace selector button', () => {
    setupStore()
    render(<TeamSwitcher />)
    expect(screen.getByLabelText('워크스페이스 선택')).toBeInTheDocument()
  })

  it('shows personal workspace by default', () => {
    setupStore()
    render(<TeamSwitcher />)
    expect(screen.getByText('개인')).toBeInTheDocument()
  })

  it('shows current team name when team is selected', () => {
    setupStore({
      currentTeam: { id: 't1', name: 'My Team' },
      currentTeamId: 't1',
    })
    render(<TeamSwitcher />)
    expect(screen.getByText('My Team')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    setupStore({
      teams: [{ id: 't1', name: 'Team A', memberCount: 3 }],
    })
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('새 팀 만들기')).toBeInTheDocument()
  })

  it('selects personal workspace', async () => {
    const user = userEvent.setup()
    setupStore({
      teams: [{ id: 't1', name: 'Team A', memberCount: 1 }],
      currentTeamId: 't1',
    })
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    const options = screen.getAllByRole('option')
    // First option is personal
    await user.click(options[0])
    expect(mockSetCurrentTeam).toHaveBeenCalledWith(null)
  })

  it('selects a team', async () => {
    const user = userEvent.setup()
    setupStore({
      teams: [{ id: 't1', name: 'Team A', memberCount: 2 }],
    })
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    await user.click(screen.getByText('Team A'))
    expect(mockSetCurrentTeam).toHaveBeenCalledWith('t1')
  })

  it('shows team member count', async () => {
    const user = userEvent.setup()
    setupStore({
      teams: [{ id: 't1', name: 'Team A', memberCount: 5 }],
    })
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('opens create team dialog', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    await user.click(screen.getByText('새 팀 만들기'))
    expect(screen.getByTestId('create-team-dialog')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    setupStore({ isLoading: true })
    render(<TeamSwitcher />)
    expect(screen.getByLabelText('워크스페이스 선택')).toBeDisabled()
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<TeamSwitcher />)
    await user.click(screen.getByLabelText('워크스페이스 선택'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
