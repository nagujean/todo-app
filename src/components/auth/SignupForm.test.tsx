import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './SignupForm'
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

const mockSignUp = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockClearError = vi.fn()

function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useAuthStore).mockReturnValue({
    signUp: mockSignUp,
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

describe('SignupForm', () => {
  it('renders signup form fields', () => {
    setupStore()
    render(<SignupForm />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
  })

  it('renders signup button', () => {
    setupStore()
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('renders login link', () => {
    setupStore()
    render(<SignupForm />)
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
  })

  it('renders Google signup button', () => {
    setupStore()
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: /Google로 가입/ })).toBeInTheDocument()
  })

  it('calls signUp with email and password on submit', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    setupStore()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')
    await user.click(screen.getByRole('button', { name: '회원가입' }))
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'different')
    await user.click(screen.getByRole('button', { name: '회원가입' }))
    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows validation error when password is too short', async () => {
    const user = userEvent.setup()
    setupStore()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), '12345')
    await user.type(screen.getByLabelText('비밀번호 확인'), '12345')
    await user.click(screen.getByRole('button', { name: '회원가입' }))
    expect(screen.getByText('비밀번호는 6자 이상이어야 합니다.')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('displays store error', () => {
    setupStore({ error: '이미 사용 중인 이메일입니다.' })
    render(<SignupForm />)
    expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    setupStore({ loading: true })
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: '가입 중...' })).toBeDisabled()
  })

  it('disables inputs during loading', () => {
    setupStore({ loading: true })
    render(<SignupForm />)
    expect(screen.getByLabelText('이메일')).toBeDisabled()
    expect(screen.getByLabelText('비밀번호')).toBeDisabled()
    expect(screen.getByLabelText('비밀번호 확인')).toBeDisabled()
  })

  it('renders card title', () => {
    setupStore()
    render(<SignupForm />)
    expect(screen.getAllByText('회원가입').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('새 계정을 만드세요')).toBeInTheDocument()
  })
})
