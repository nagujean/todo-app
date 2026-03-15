import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          Content
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('Dialog Description')).toBeInTheDocument()
  })

  it('renders close button by default', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          Content
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  it('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          Content
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('renders controlled dialog when open prop is true', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Controlled</DialogTitle>
          Content
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders header and footer sections', async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="footer">Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'dialog-header')
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'dialog-footer')
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          No close button
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })
})
