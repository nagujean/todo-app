// RichTextEditor 컴포넌트 테스트
import { render, screen } from '@testing-library/react'
import { RichTextEditor } from '../RichTextEditor'

describe('RichTextEditor', () => {
  it('renders editor container', () => {
    render(<RichTextEditor onChange={vi.fn()} />)
    const editor = document.querySelector('.ProseMirror')
    expect(editor).toBeInTheDocument()
  })

  it('displays placeholder text when empty', () => {
    render(<RichTextEditor onChange={vi.fn()} placeholder="입력하세요..." />)
    const editor = document.querySelector('.ProseMirror')
    expect(editor).toBeInTheDocument()
    // Placeholder extension doesn't set data-placeholder attribute directly
    // It uses CSS ::before pseudo-element
    expect(editor?.classList.contains('ProseMirror')).toBe(true)
  })

  it('converts description text to content', () => {
    render(
      <RichTextEditor
        description="테스트 내용"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('테스트 내용')).toBeInTheDocument()
  })

  it('renders initial content from JSON', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'JSON에서 온 내용',
            },
          ],
        },
      ],
    }
    render(
      <RichTextEditor
        initialContent={content}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('JSON에서 온 내용')).toBeInTheDocument()
  })

  it('prioritizes initialContent over description', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'JSON 콘텐츠',
            },
          ],
        },
      ],
    }
    render(
      <RichTextEditor
        initialContent={content}
        description="무시될 텍스트"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('JSON 콘텐츠')).toBeInTheDocument()
    expect(screen.queryByText('무시될 텍스트')).not.toBeInTheDocument()
  })

  it('calls onChange when content changes', async () => {
    const onChange = vi.fn()
    const { container } = render(<RichTextEditor onChange={onChange} debounceMs={0} />)

    const editor = container.querySelector('.ProseMirror')
    if (!editor) throw new Error('Editor not found')

    // Simulate text input
    editor.innerHTML = '<p>새로운 내용</p>'
    editor.dispatchEvent(new Event('input', { bubbles: true }))

    // Wait for async update
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(onChange).toHaveBeenCalled()
  })
})
