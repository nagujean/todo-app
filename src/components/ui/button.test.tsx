import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'default')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveAttribute('data-variant', 'destructive')
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost')
  })

  it('renders with sm size', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')
  })

  it('renders with lg size', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg')
  })

  it('renders with icon size', () => {
    render(<Button size="icon">X</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('supports type attribute', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
