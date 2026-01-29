import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresetList } from './PresetList'
import { usePresetStore } from '@/store/presetStore'
import { useTodoStore } from '@/store/todoStore'

vi.mock('@/store/presetStore', () => ({
  usePresetStore: vi.fn(),
}))

vi.mock('@/store/todoStore', () => ({
  useTodoStore: vi.fn(),
}))

const mockDeletePreset = vi.fn()
const mockAddTodo = vi.fn()

function setupStores(presets: Array<{ id: string; title: string; createdAt: string }> = []) {
  vi.mocked(usePresetStore).mockReturnValue({
    presets,
    deletePreset: mockDeletePreset,
  } as ReturnType<typeof usePresetStore>)

  vi.mocked(useTodoStore).mockImplementation((selector?: unknown) => {
    const state = { addTodo: mockAddTodo }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state as ReturnType<typeof useTodoStore>
  })
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('PresetList', () => {
  it('renders nothing when no presets', () => {
    setupStores([])
    const { container } = render(<PresetList />)
    expect(container.innerHTML).toBe('')
  })

  it('renders preset buttons when presets exist', () => {
    setupStores([
      { id: 'p1', title: 'Buy milk', createdAt: '' },
      { id: 'p2', title: 'Exercise', createdAt: '' },
    ])
    render(<PresetList />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('Exercise')).toBeInTheDocument()
  })

  it('renders section title', () => {
    setupStores([{ id: 'p1', title: 'Task', createdAt: '' }])
    render(<PresetList />)
    expect(screen.getByText('빠른 추가')).toBeInTheDocument()
  })

  it('calls addTodo when preset is clicked', async () => {
    const user = userEvent.setup()
    setupStores([{ id: 'p1', title: 'Buy milk', createdAt: '' }])
    render(<PresetList />)
    await user.click(screen.getByText('Buy milk'))
    expect(mockAddTodo).toHaveBeenCalledWith({ title: 'Buy milk' })
  })

  it('calls deletePreset when delete button is clicked', async () => {
    const user = userEvent.setup()
    setupStores([{ id: 'p1', title: 'Buy milk', createdAt: '' }])
    render(<PresetList />)
    await user.click(screen.getByLabelText('Buy milk 프리셋 삭제'))
    expect(mockDeletePreset).toHaveBeenCalledWith('p1')
  })

  it('renders delete button with aria-label for each preset', () => {
    setupStores([
      { id: 'p1', title: 'Task A', createdAt: '' },
      { id: 'p2', title: 'Task B', createdAt: '' },
    ])
    render(<PresetList />)
    expect(screen.getByLabelText('Task A 프리셋 삭제')).toBeInTheDocument()
    expect(screen.getByLabelText('Task B 프리셋 삭제')).toBeInTheDocument()
  })
})
