import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeaveTeamDialog } from './LeaveTeamDialog'
import { useTeamStore } from '@/store/teamStore'

// Mock the team store
vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  description: 'Test Description',
  ownerId: 'owner-1',
  memberCount: 3,
  createdAt: '2024-01-01T00:00:00.000Z',
  settings: {
    defaultRole: 'editor' as const,
    allowInviteLinks: true,
  },
}

describe('LeaveTeamDialog', () => {
  const mockLeaveTeam = vi.fn()
  const mockSetCurrentTeam = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTeamStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      leaveTeam: mockLeaveTeam,
      setCurrentTeam: mockSetCurrentTeam,
      currentTeamId: 'team-1',
    })
  })

  it('renders dialog when open', () => {
    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    // Use getByRole for the title to be specific
    expect(screen.getByRole('heading', { name: '팀 탈퇴' })).toBeInTheDocument()
    expect(screen.getByText(/정말로/)).toBeInTheDocument()
  })

  it('does not render when team is null', () => {
    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={null}
      />
    )

    expect(screen.queryByRole('heading', { name: '팀 탈퇴' })).not.toBeInTheDocument()
  })

  it('shows team name in the description', () => {
    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    // Check for team name in the description
    expect(screen.getByText(/Test Team/)).toBeInTheDocument()
  })

  it('shows info about other members still having access', () => {
    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    expect(screen.getByText(/탈퇴 후에도 팀의 다른 멤버들은 계속 이 팀을 사용할 수 있습니다/)).toBeInTheDocument()
  })

  it('calls leaveTeam when leave button is clicked', async () => {
    const user = userEvent.setup()
    mockLeaveTeam.mockResolvedValue(undefined)

    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
        onSuccess={mockOnSuccess}
      />
    )

    // Use getByRole for the button to be specific
    const leaveButton = screen.getByRole('button', { name: /^팀 탈퇴$/ })
    await user.click(leaveButton)

    await waitFor(() => {
      expect(mockLeaveTeam).toHaveBeenCalledWith('team-1')
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error message when leave fails', async () => {
    const user = userEvent.setup()
    mockLeaveTeam.mockRejectedValue(new Error('탈퇴 실패'))

    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const leaveButton = screen.getByRole('button', { name: /^팀 탈퇴$/ })
    await user.click(leaveButton)

    await waitFor(() => {
      expect(screen.getByText('탈퇴 실패')).toBeInTheDocument()
    })
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows loading state while leaving', async () => {
    const user = userEvent.setup()
    mockLeaveTeam.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

    render(
      <LeaveTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const leaveButton = screen.getByRole('button', { name: /^팀 탈퇴$/ })
    await user.click(leaveButton)

    expect(screen.getByText('탈퇴 중...')).toBeInTheDocument()
  })
})
