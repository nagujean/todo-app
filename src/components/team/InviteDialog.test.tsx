import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteDialog } from './InviteDialog'
import { useTeamStore } from '@/store/teamStore'
import { useInvitationStore } from '@/store/invitationStore'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

vi.mock('@/store/invitationStore', () => ({
  useInvitationStore: vi.fn(),
  generateInvitationLink: vi.fn((id: string) => `https://example.com/join/${id}`),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}))

const mockCreateEmailInvitation = vi.fn()
const mockCreateLinkInvitation = vi.fn()

function setupStores() {
  vi.mocked(useTeamStore).mockReturnValue({
    currentTeam: { id: 'team-1', name: 'Test Team' },
  } as ReturnType<typeof useTeamStore>)

  vi.mocked(useInvitationStore).mockReturnValue({
    createEmailInvitation: mockCreateEmailInvitation,
    createLinkInvitation: mockCreateLinkInvitation,
  } as ReturnType<typeof useInvitationStore>)

  vi.mocked(useAuthStore).mockReturnValue({
    user: { uid: 'user-1' },
  } as ReturnType<typeof useAuthStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('InviteDialog', () => {
  it('renders dialog when open', () => {
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('팀원 초대')).toBeInTheDocument()
  })

  it('shows email and link invite method toggles', () => {
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('이메일로 초대')).toBeInTheDocument()
    expect(screen.getByText('링크로 초대')).toBeInTheDocument()
  })

  it('shows role selection options', () => {
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('편집자')).toBeInTheDocument()
    expect(screen.getByText('뷰어')).toBeInTheDocument()
  })

  it('shows email input in email mode', () => {
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument()
  })

  it('submits email invitation', async () => {
    const user = userEvent.setup()
    mockCreateEmailInvitation.mockResolvedValue('inv-1')
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('email@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: '초대하기' }))
    await waitFor(() => {
      expect(mockCreateEmailInvitation).toHaveBeenCalledWith(
        'team-1', 'Test Team', 'test@example.com', 'editor', 'user-1'
      )
    })
  })

  it('shows error when createEmailInvitation fails', async () => {
    const user = userEvent.setup()
    mockCreateEmailInvitation.mockResolvedValue(null)
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('email@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: '초대하기' }))
    await waitFor(() => {
      expect(screen.getByText(/초대 생성에 실패했습니다/)).toBeInTheDocument()
    })
  })

  it('disables submit button when email is empty', () => {
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '초대하기' })).toBeDisabled()
  })

  it('switches to link invite mode', async () => {
    const user = userEvent.setup()
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    await user.click(screen.getByText('링크로 초대'))
    expect(screen.getByText('초대 링크 생성')).toBeInTheDocument()
    expect(screen.getByText(/링크 생성 버튼을 눌러/)).toBeInTheDocument()
  })

  it('generates invite link', async () => {
    const user = userEvent.setup()
    mockCreateLinkInvitation.mockResolvedValue('inv-link-1')
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    await user.click(screen.getByText('링크로 초대'))
    await user.click(screen.getByText('초대 링크 생성'))
    await waitFor(() => {
      expect(mockCreateLinkInvitation).toHaveBeenCalledWith(
        'team-1', 'Test Team', 'editor', 'user-1'
      )
    })
  })

  it('shows success message after email invite', async () => {
    const user = userEvent.setup()
    mockCreateEmailInvitation.mockResolvedValue('inv-1')
    setupStores()
    render(<InviteDialog teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('email@example.com'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: '초대하기' }))
    await waitFor(() => {
      expect(screen.getByText(/test@example.com에 초대 이메일을 보냈습니다./)).toBeInTheDocument()
    })
  })
})
