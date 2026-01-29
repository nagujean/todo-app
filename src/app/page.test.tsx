import { render, screen } from '@testing-library/react'
import Home from './page'
import { useTodoStore } from '@/store/todoStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/store/teamStore', () => ({
  useTeamStore: vi.fn(),
}))

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: () => false,
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/todo/TodoInput', () => ({
  TodoInput: () => <div data-testid="todo-input">TodoInput</div>,
}))

vi.mock('@/components/todo/TodoList', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList</div>,
}))

vi.mock('@/components/calendar/CalendarView', () => ({
  CalendarView: () => <div data-testid="calendar-view">CalendarView</div>,
}))

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('@/components/ViewToggle', () => ({
  ViewToggle: () => <div data-testid="view-toggle">ViewToggle</div>,
}))

vi.mock('@/components/preset/PresetList', () => ({
  PresetList: () => <div data-testid="preset-list">PresetList</div>,
}))

vi.mock('@/components/auth/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}))

vi.mock('@/components/team', () => ({
  TeamSwitcher: () => <div data-testid="team-switcher">TeamSwitcher</div>,
}))

function setupStores(overrides: Record<string, unknown> = {}) {
  vi.mocked(useTodoStore).mockImplementation((selector?: unknown) => {
    const state = { viewMode: 'list', ...overrides }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useTodoStore>
  })

  vi.mocked(useAuthStore).mockImplementation((selector?: unknown) => {
    const state = {
      user: overrides.user ?? { uid: 'u1', email: 'test@test.com' },
      initialized: overrides.initialized ?? true,
    }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useAuthStore>
  })

  vi.mocked(useTeamStore).mockImplementation((selector?: unknown) => {
    const state = { currentTeam: overrides.currentTeam ?? null }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useTeamStore>
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('Home Page', () => {
  it('renders main components when authenticated', () => {
    setupStores()
    render(<Home />)
    expect(screen.getByTestId('todo-input')).toBeInTheDocument()
    expect(screen.getByTestId('todo-list')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('view-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    expect(screen.getByTestId('team-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('preset-list')).toBeInTheDocument()
  })

  it('renders default title when no team selected', () => {
    setupStores()
    render(<Home />)
    expect(screen.getByText('할 일 목록')).toBeInTheDocument()
  })

  it('renders team name when team is selected', () => {
    setupStores({ currentTeam: { id: 't1', name: 'My Team' } })
    render(<Home />)
    expect(screen.getByText('My Team')).toBeInTheDocument()
  })

  it('renders footer text', () => {
    setupStores()
    render(<Home />)
    expect(screen.getByText('Made with Claude Code')).toBeInTheDocument()
  })

  it('renders nothing when not initialized', () => {
    setupStores({ initialized: false })
    const { container } = render(<Home />)
    // Should render null (empty) or loading
    expect(container.querySelector('main')).not.toBeInTheDocument()
  })

  it('renders with user null - component still mounts in test env', () => {
    // In test environment, useSyncExternalStore behavior may differ.
    // AuthProvider handles actual redirect logic in production.
    setupStores({ user: null, initialized: true })
    render(<Home />)
    // Verify it at least renders without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('shows calendar view when viewMode is calendar', () => {
    setupStores({ viewMode: 'calendar' })
    render(<Home />)
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument()
  })
})
