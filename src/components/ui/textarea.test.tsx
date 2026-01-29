import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('has data-slot attribute', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveAttribute('data-slot', 'textarea')
  })

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description..." />)
    expect(screen.getByPlaceholderText('Enter description...')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    await user.type(screen.getByRole('textbox'), 'hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays value when controlled', () => {
    render(<Textarea value="test content" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('test content')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-textarea')
  })

  it('supports rows attribute', () => {
    render(<Textarea rows={5} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
  })
})
