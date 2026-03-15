import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteTeamDialog } from './DeleteTeamDialog'
import { useTeamStore } from '@/store/teamStore'

// Mock the team store
vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  description: 'Test Description',
  ownerId: 'user-1',
  memberCount: 3,
  createdAt: '2024-01-01T00:00:00.000Z',
  settings: {
    defaultRole: 'editor' as const,
    allowInviteLinks: true,
  },
}

describe('DeleteTeamDialog', () => {
  const mockDeleteTeam = vi.fn()
  const mockSetCurrentTeam = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTeamStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      deleteTeam: mockDeleteTeam,
      setCurrentTeam: mockSetCurrentTeam,
      currentTeamId: 'team-1',
    })
  })

  it('renders dialog when open', () => {
    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    expect(screen.getByRole('heading', { name: '팀 삭제' })).toBeInTheDocument()
    expect(screen.getByText(/이 작업은 취소할 수 없습니다/)).toBeInTheDocument()
  })

  it('does not render when team is null', () => {
    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={null}
      />
    )

    expect(screen.queryByRole('heading', { name: '팀 삭제' })).not.toBeInTheDocument()
  })

  it('disables delete button when team name does not match', () => {
    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /^팀 삭제$/ })
    expect(deleteButton).toBeDisabled()
  })

  it('enables delete button when team name matches', async () => {
    const user = userEvent.setup()

    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const input = screen.getByPlaceholderText('팀 이름 입력')
    await user.type(input, 'Test Team')

    const deleteButton = screen.getByRole('button', { name: /^팀 삭제$/ })
    expect(deleteButton).not.toBeDisabled()
  })

  it('calls deleteTeam when delete button is clicked with matching name', async () => {
    const user = userEvent.setup()
    mockDeleteTeam.mockResolvedValue(undefined)

    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
        onSuccess={mockOnSuccess}
      />
    )

    const input = screen.getByPlaceholderText('팀 이름 입력')
    await user.type(input, 'Test Team')

    const deleteButton = screen.getByRole('button', { name: /^팀 삭제$/ })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteTeam).toHaveBeenCalledWith('team-1')
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error message when delete fails', async () => {
    const user = userEvent.setup()
    mockDeleteTeam.mockRejectedValue(new Error('삭제 실패'))

    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const input = screen.getByPlaceholderText('팀 이름 입력')
    await user.type(input, 'Test Team')

    const deleteButton = screen.getByRole('button', { name: /^팀 삭제$/ })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('삭제 실패')).toBeInTheDocument()
    })
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows warning about data deletion', () => {
    render(
      <DeleteTeamDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        team={mockTeam}
      />
    )

    expect(screen.getByText(/모든 할 일, 멤버 정보, 초대 링크가 함께 삭제됩니다/)).toBeInTheDocument()
  })
})
