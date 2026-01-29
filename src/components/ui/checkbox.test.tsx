import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders a checkbox', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('has data-slot attribute', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-slot', 'checkbox')
  })

  it('renders unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Checkbox onCheckedChange={handleChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox')
  })
})
