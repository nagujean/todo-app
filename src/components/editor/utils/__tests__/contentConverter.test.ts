// Content Converter 유틸리티 테스트
import { describe, it, expect } from 'vitest'
import { textToContent, contentToText, isEmptyContent } from '../contentConverter'

describe('contentConverter', () => {
  describe('textToContent', () => {
    it('converts empty string to empty content', () => {
      const result = textToContent('')
      expect(result).toEqual({
        type: 'doc',
        content: [],
      })
    })

    it('converts undefined to empty content', () => {
      const result = textToContent(undefined as unknown as string)
      expect(result).toEqual({
        type: 'doc',
        content: [],
      })
    })

    it('converts single line text to paragraph', () => {
      const result = textToContent('Hello World')
      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello World',
              },
            ],
          },
        ],
      })
    })

    it('converts multi-line text to multiple paragraphs', () => {
      const result = textToContent('Line 1\nLine 2\nLine 3')
      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 1' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 2' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 3' }],
          },
        ],
      })
    })

    it('handles empty lines', () => {
      const result = textToContent('Line 1\n\nLine 3')
      expect(result.content).toHaveLength(3)
    })
  })

  describe('contentToText', () => {
    it('converts empty content to empty string', () => {
      const result = contentToText(undefined)
      expect(result).toBe('')
    })

    it('converts content with no content array to empty string', () => {
      const result = contentToText({ type: 'doc' })
      expect(result).toBe('')
    })

    it('converts single paragraph to text', () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello World',
              },
            ],
          },
        ],
      }
      const result = contentToText(content)
      expect(result).toBe('Hello World')
    })

    it('converts multiple paragraphs to multi-line text', () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 1' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Line 2' }],
          },
        ],
      }
      const result = contentToText(content)
      expect(result).toBe('Line 1\nLine 2')
    })

    it('extracts text from complex structures', () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Bold' },
              { type: 'text', text: ' text' },
            ],
          },
        ],
      }
      const result = contentToText(content)
      expect(result).toBe('Bold text')
    })
  })

  describe('isEmptyContent', () => {
    it('returns true for undefined content', () => {
      expect(isEmptyContent(undefined)).toBe(true)
    })

    it('returns true for content with no content array', () => {
      expect(isEmptyContent({ type: 'doc' })).toBe(true)
    })

    it('returns true for content with empty content array', () => {
      expect(
        isEmptyContent({
          type: 'doc',
          content: [],
        })
      ).toBe(true)
    })

    it('returns true for content with only empty paragraphs', () => {
      expect(
        isEmptyContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [],
            },
          ],
        })
      ).toBe(true)
    })

    it('returns false for content with text', () => {
      expect(
        isEmptyContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        })
      ).toBe(false)
    })

    it('returns false for content with only whitespace', () => {
      expect(
        isEmptyContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '   ' }],
            },
          ],
        })
      ).toBe(true)
    })
  })
})
