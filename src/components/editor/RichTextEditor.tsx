'use client'

// Rich Text Editor 컴포넌트
// Tiptap 기반의 리치 텍스트 에디터입니다.

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from './extensions'
import { textToContent, isEmptyContent } from './utils/contentConverter'
import { useEffect, useRef } from 'react'
import type { JSONContent } from '@tiptap/react'

interface RichTextEditorProps {
  /** 초기 콘텐츠 (JSON 형식) */
  initialContent?: JSONContent
  /** 기존 description 텍스트 (마이그레이션용 - 초기화 시에만 사용) */
  description?: string
  /** 콘텐츠 변경 핸들러 (debounced) */
  onChange?: (content: JSONContent) => void
  /** 에디터가 비어있을 때 표시할 플레이스홀더 */
  placeholder?: string
  /** Debounce 지연 시간 (ms) */
  debounceMs?: number
}

/** Debounce hook */
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }) as T
}

/**
 * RichTextEditor 컴포넌트
 * Tiptap 에디터를 래핑한 React 컴포넌트입니다.
 */
export function RichTextEditor({
  initialContent,
  description,
  onChange,
  placeholder = '상세 내용을 입력하세요... (/ 로 명령어 메뉴 열기)',
  debounceMs = 300,
}: RichTextEditorProps) {
  // Debounced onChange to prevent excessive parent re-renders
  const debouncedOnChange = useDebouncedCallback((content: JSONContent) => {
    onChange?.(content)
  }, debounceMs)

  // 에디터 초기화
  const editor = useEditor({
    extensions: extensions.map((ext) =>
      ext.name === 'placeholder'
        ? ext.configure({
            placeholder,
          })
        : ext
    ),
    content: initialContent || (description ? textToContent(description) : undefined),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      // 즉시 debounced callback 호출
      debouncedOnChange(editor.getJSON())
    },
    immediatelyRender: false, // SSR 환경에서의 hydrated mismatch 방지
  })

  // initialContent prop이 변경되면 에디터 내용 업데이트 (단일 useEffect)
  useEffect(() => {
    if (!editor) return

    // initialContent 우선, 없으면 description 사용
    const newContent = initialContent || (description ? textToContent(description) : null)

    if (newContent) {
      const currentContent = editor.getJSON()
      // 내용이 실제로 다를 때만 업데이트
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent)
      }
    }
  }, [initialContent, description, editor])

  // 에디터가 준비되지 않았으면 렌더링하지 않음
  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-colors">
      <EditorContent editor={editor} className="min-h-[100px]" />
    </div>
  )
}

/**
 * RichTextEditor에서 사용할 수 있는 Hook
 * 에디터 인스턴스와 관련 유틸리티를 제공합니다.
 */
export function useRichTextEditor() {
  return {
    isEmptyContent,
  }
}
