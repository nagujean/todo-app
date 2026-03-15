import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '@/store/themeStore'

vi.mock('@/store/themeStore', () => ({
  useThemeStore: vi.fn(),
}))

const mockToggleTheme = vi.fn()

function setupStore(isDark: boolean) {
  vi.mocked(useThemeStore).mockReturnValue({
    isDark,
    toggleTheme: mockToggleTheme,
  } as ReturnType<typeof useThemeStore>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ThemeToggle', () => {
  it('renders toggle button for light mode', () => {
    setupStore(false)
    render(<ThemeToggle />)
    expect(screen.getByLabelText('다크 모드로 전환')).toBeInTheDocument()
  })

  it('renders toggle button for dark mode', () => {
    setupStore(true)
    render(<ThemeToggle />)
    expect(screen.getByLabelText('라이트 모드로 전환')).toBeInTheDocument()
  })

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup()
    setupStore(false)
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('adds dark class to documentElement when isDark', () => {
    setupStore(true)
    render(<ThemeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from documentElement when not isDark', () => {
    document.documentElement.classList.add('dark')
    setupStore(false)
    render(<ThemeToggle />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
