import { render, screen } from '@testing-library/react'
import LoginPage from './page'
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

beforeEach(() => {
  vi.mocked(useAuthStore).mockReturnValue({
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  } as ReturnType<typeof useAuthStore>)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('Login Page', () => {
  it('renders LoginForm component', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('renders Google login option', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /Google로 로그인/ })).toBeInTheDocument()
  })

  it('renders signup link', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup')
  })
})
