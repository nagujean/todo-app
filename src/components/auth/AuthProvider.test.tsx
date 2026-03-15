import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuthStore, setupAuthListener } from '@/store/authStore'
import { subscribeToTodos, unsubscribeFromTodos } from '@/store/todoStore'
import { subscribeToPresets, unsubscribeFromPresets } from '@/store/presetStore'
import { subscribeToTeams, unsubscribeFromTeams } from '@/store/teamStore'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
  setupAuthListener: vi.fn(() => vi.fn()),
}))

vi.mock('@/store/todoStore', () => ({
  subscribeToTodos: vi.fn(),
  unsubscribeFromTodos: vi.fn(),
}))

vi.mock('@/store/presetStore', () => ({
  subscribeToPresets: vi.fn(),
  unsubscribeFromPresets: vi.fn(),
}))

vi.mock('@/store/teamStore', () => ({
  subscribeToTeams: vi.fn(),
  unsubscribeFromTeams: vi.fn(),
}))

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: () => false,
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn() },
}))

function setupAuth(overrides: Record<string, unknown> = {}) {
  const state = {
    user: null,
    initialized: false,
    loading: true,
    ...overrides,
  }
  vi.mocked(useAuthStore).mockImplementation((selector?: unknown) => {
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useAuthStore>
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('renders loading state when not initialized', () => {
    setupAuth({ initialized: false, loading: true })
    render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    expect(screen.queryByText('Child')).not.toBeInTheDocument()
  })

  it('renders children when initialized and not loading', () => {
    setupAuth({ initialized: true, loading: false, user: { uid: 'u1' } })
    render(<AuthProvider><div>Child Content</div></AuthProvider>)
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('calls setupAuthListener on mount', () => {
    setupAuth({ initialized: false, loading: false })
    render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(setupAuthListener).toHaveBeenCalled()
  })

  it('subscribes to data stores when user is present', () => {
    setupAuth({ initialized: true, loading: false, user: { uid: 'u1' } })
    render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(subscribeToTodos).toHaveBeenCalledWith('u1')
    expect(subscribeToPresets).toHaveBeenCalledWith('u1')
    expect(subscribeToTeams).toHaveBeenCalledWith('u1')
  })

  it('unsubscribes from data stores when user is null', () => {
    setupAuth({ initialized: true, loading: false, user: null })
    render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(unsubscribeFromTodos).toHaveBeenCalled()
    expect(unsubscribeFromPresets).toHaveBeenCalled()
    expect(unsubscribeFromTeams).toHaveBeenCalled()
  })

  it('shows loading when initialized is true but loading is also true', () => {
    setupAuth({ initialized: true, loading: true })
    render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })
})
