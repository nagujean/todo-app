import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamMembers } from './TeamMembers'
import { useTeamStore, subscribeToTeamMembers, unsubscribeFromTeamMembers } from '@/store/teamStore'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
  subscribeToTeamMembers: vi.fn(() => vi.fn()),
  unsubscribeFromTeamMembers: vi.fn(),
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

const mockUpdateMemberRole = vi.fn()
const mockRemoveMember = vi.fn()

function setupStores(overrides: { members?: unknown[]; currentUserId?: string } = {}) {
  vi.mocked(useTeamStore).mockReturnValue({
    members: overrides.members ?? [],
    updateMemberRole: mockUpdateMemberRole,
    removeMember: mockRemoveMember,
  } as ReturnType<typeof useTeamStore>)

  vi.mocked(useAuthStore).mockReturnValue({
    user: { uid: overrides.currentUserId ?? 'u1' },
  } as ReturnType<typeof useAuthStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('TeamMembers', () => {
  it('renders empty state when no members', () => {
    setupStores({ members: [] })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('팀 멤버가 없습니다.')).toBeInTheDocument()
  })

  it('renders member list', () => {
    setupStores({
      members: [
        { id: 'u1', displayName: 'Alice', email: 'alice@test.com', role: 'owner', joinedAt: '' },
        { id: 'u2', displayName: 'Bob', email: 'bob@test.com', role: 'editor', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows role labels', () => {
    setupStores({
      members: [
        { id: 'u1', displayName: 'Owner', email: '', role: 'owner', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('소유자')).toBeInTheDocument()
  })

  it('shows (나) label for current user', () => {
    setupStores({
      currentUserId: 'u1',
      members: [
        { id: 'u1', displayName: 'Me', email: '', role: 'owner', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('(나)')).toBeInTheDocument()
  })

  it('shows member email', () => {
    setupStores({
      members: [
        { id: 'u2', displayName: 'Bob', email: 'bob@test.com', role: 'editor', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('shows remove button for admin acting on non-owner non-self member', () => {
    setupStores({
      currentUserId: 'u1',
      members: [
        { id: 'u1', displayName: 'Admin', email: '', role: 'owner', joinedAt: '' },
        { id: 'u2', displayName: 'Editor', email: '', role: 'editor', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByTitle('멤버 제거')).toBeInTheDocument()
  })

  it('does not show remove button for owner members', () => {
    setupStores({
      currentUserId: 'u2',
      members: [
        { id: 'u1', displayName: 'Owner', email: '', role: 'owner', joinedAt: '' },
        { id: 'u2', displayName: 'Viewer', email: '', role: 'viewer', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.queryByTitle('멤버 제거')).not.toBeInTheDocument()
  })

  it('subscribes to team members when open', () => {
    setupStores({ members: [] })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(subscribeToTeamMembers).toHaveBeenCalledWith('team-1')
  })

  it('renders dialog with title when open and onOpenChange provided', () => {
    setupStores({ members: [] })
    render(<TeamMembers teamId="team-1" open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('팀 멤버')).toBeInTheDocument()
  })

  it('renders without dialog when open is undefined', () => {
    setupStores({
      members: [
        { id: 'u1', displayName: 'Alice', email: '', role: 'editor', joinedAt: '' },
      ],
    })
    render(<TeamMembers teamId="team-1" />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('팀 멤버')).not.toBeInTheDocument()
  })
})
