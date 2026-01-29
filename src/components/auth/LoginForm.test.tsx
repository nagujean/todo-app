import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'
import { useAuthStore } from '@/store/authStore'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const mockSignIn = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockClearError = vi.fn()

function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useAuthStore).mockReturnValue({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    loading: false,
    error: null,
    clearError: mockClearError,
    ...overrides,
  } as ReturnType<typeof useAuthStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('LoginForm', () => {
  it('renders login form with email and password fields', () => {
    setupStore()
    render(<LoginForm />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
  })

  it('renders login button', () => {
    setupStore()
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('renders Google login button', () => {
    setupStore()
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /Google로 로그인/ })).toBeInTheDocument()
  })

  it('renders signup link', () => {
    setupStore()
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup')
  })

  it('calls signIn with email and password on submit', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)
    setupStore()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '로그인' }))
    expect(mockClearError).toHaveBeenCalled()
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('calls signInWithGoogle when Google button is clicked', async () => {
    const user = userEvent.setup()
    mockSignInWithGoogle.mockResolvedValue(undefined)
    setupStore()
    render(<LoginForm />)
    await user.click(screen.getByRole('button', { name: /Google로 로그인/ }))
    expect(mockClearError).toHaveBeenCalled()
    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })

  it('displays error message when error exists', () => {
    setupStore({ error: '잘못된 이메일 또는 비밀번호입니다.' })
    render(<LoginForm />)
    expect(screen.getByText('잘못된 이메일 또는 비밀번호입니다.')).toBeInTheDocument()
  })

  it('shows loading state on login button', () => {
    setupStore({ loading: true })
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled()
  })

  it('disables inputs during loading', () => {
    setupStore({ loading: true })
    render(<LoginForm />)
    expect(screen.getByLabelText('이메일')).toBeDisabled()
    expect(screen.getByLabelText('비밀번호')).toBeDisabled()
  })

  it('disables Google button during loading', () => {
    setupStore({ loading: true })
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /Google로 로그인/ })).toBeDisabled()
  })

  it('renders card title', () => {
    setupStore()
    render(<LoginForm />)
    expect(screen.getAllByText('로그인').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('계정에 로그인하세요')).toBeInTheDocument()
  })
})
