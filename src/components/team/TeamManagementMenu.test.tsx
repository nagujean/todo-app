import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamManagementMenu } from './TeamManagementMenu'
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

describe('TeamManagementMenu', () => {
  const mockOnDeleteTeam = vi.fn()
  const mockOnLeaveTeam = vi.fn()
  const mockOnManageTeam = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('as owner', () => {
    beforeEach(() => {
      ;(useTeamStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: 'user-1',
        getUserRole: vi.fn(() => 'owner'),
      })
    })

    it('renders settings button', () => {
      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      expect(screen.getByLabelText('팀 관리 메뉴')).toBeInTheDocument()
    })

    it('shows delete option for owner', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.getByRole('menuitem', { name: /팀 삭제/ })).toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: /팀 탈퇴/ })).not.toBeInTheDocument()
    })

    it('calls onDeleteTeam when delete is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
          onManageTeam={mockOnManageTeam}
          onOpenChange={mockOnOpenChange}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      const deleteButton = screen.getByRole('menuitem', { name: /팀 삭제/ })
      await user.click(deleteButton)

      expect(mockOnDeleteTeam).toHaveBeenCalled()
    })

    it('shows "팀 관리" option when onManageTeam is provided', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
          onManageTeam={mockOnManageTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.getByRole('menuitem', { name: /팀 관리/ })).toBeInTheDocument()
    })

    it('calls onManageTeam when "팀 관리" is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
          onManageTeam={mockOnManageTeam}
          onOpenChange={mockOnOpenChange}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      const manageButton = screen.getByRole('menuitem', { name: /팀 관리/ })
      await user.click(manageButton)

      expect(mockOnManageTeam).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not show "팀 관리" option when onManageTeam is not provided', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.queryByRole('menuitem', { name: /팀 관리/ })).not.toBeInTheDocument()
    })
  })

  describe('as member', () => {
    beforeEach(() => {
      ;(useTeamStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: 'user-2',
        getUserRole: vi.fn(() => 'editor'),
      })
    })

    it('shows leave option for non-owner', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.getByRole('menuitem', { name: /팀 탈퇴/ })).toBeInTheDocument()
      expect(screen.queryByRole('menuitem', { name: /팀 삭제/ })).not.toBeInTheDocument()
    })

    it('calls onLeaveTeam when leave is clicked', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      const leaveButton = screen.getByRole('menuitem', { name: /팀 탈퇴/ })
      await user.click(leaveButton)

      expect(mockOnLeaveTeam).toHaveBeenCalled()
    })
  })

  describe('menu behavior', () => {
    beforeEach(() => {
      ;(useTeamStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        userId: 'user-1',
        getUserRole: vi.fn(() => 'owner'),
      })
    })

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup()

      render(
        <div data-testid="outside">
          <TeamManagementMenu
            team={mockTeam}
            onDeleteTeam={mockOnDeleteTeam}
            onLeaveTeam={mockOnLeaveTeam}
          />
        </div>
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.getByRole('menuitem', { name: /팀 삭제/ })).toBeInTheDocument()

      // Click outside
      await user.click(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: /팀 삭제/ })).not.toBeInTheDocument()
      })
    })

    it('closes menu on escape key', async () => {
      const user = userEvent.setup()

      render(
        <TeamManagementMenu
          team={mockTeam}
          onDeleteTeam={mockOnDeleteTeam}
          onLeaveTeam={mockOnLeaveTeam}
        />
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      expect(screen.getByRole('menuitem', { name: /팀 삭제/ })).toBeInTheDocument()

      // Press escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menuitem', { name: /팀 삭제/ })).not.toBeInTheDocument()
      })
    })

    it('stops propagation on menu button click', async () => {
      const user = userEvent.setup()
      const parentClickHandler = vi.fn()

      render(
        <div onClick={parentClickHandler}>
          <TeamManagementMenu
            team={mockTeam}
            onDeleteTeam={mockOnDeleteTeam}
            onLeaveTeam={mockOnLeaveTeam}
          />
        </div>
      )

      const menuButton = screen.getByLabelText('팀 관리 메뉴')
      await user.click(menuButton)

      // Parent click handler should not be called
      expect(parentClickHandler).not.toHaveBeenCalled()
    })
  })
})
