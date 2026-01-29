import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './card'

describe('Card', () => {
  it('renders Card with data-slot', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-slot', 'card')
    expect(card).toHaveTextContent('Content')
  })

  it('renders CardHeader with data-slot', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveAttribute('data-slot', 'card-header')
  })

  it('renders CardTitle with data-slot', () => {
    render(<CardTitle>My Title</CardTitle>)
    expect(screen.getByText('My Title')).toHaveAttribute('data-slot', 'card-title')
  })

  it('renders CardDescription with data-slot', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toHaveAttribute('data-slot', 'card-description')
  })

  it('renders CardContent with data-slot', () => {
    render(<CardContent data-testid="content">Body</CardContent>)
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content')
  })

  it('renders CardFooter with data-slot', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('renders CardAction with data-slot', () => {
    render(<CardAction data-testid="action">Action</CardAction>)
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action')
  })

  it('applies custom className to Card', () => {
    render(<Card data-testid="card" className="custom">Content</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom')
  })

  it('composes full card structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Desc')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
