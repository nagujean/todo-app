// 콘텐츠 변환 유틸리티
// Tiptap JSON 포맷과 일반 텍스트 간의 변환을 담당합니다.

import type { JSONContent } from '@tiptap/react'

/**
 * 일반 텍스트를 Tiptap JSON 콘텐츠로 변환
 * @param text - 변환할 텍스트
 * @returns Tiptap JSON 콘텐츠
 */
export function textToContent(text: string): JSONContent {
  if (!text || !text.trim()) {
    return {
      type: 'doc',
      content: [],
    }
  }

  // 줄바꿈으로 구분된 텍스트를 단락으로 변환
  const paragraphs = text.split('\n').map((line) => ({
    type: 'paragraph',
    content: line
      ? [
          {
            type: 'text',
            text: line,
          },
        ]
      : [],
  }))

  return {
    type: 'doc',
    content: paragraphs,
  }
}

/**
 * Tiptap JSON 콘텐츠를 일반 텍스트로 변환
 * JSONContent를 텍스트로 직렬화합니다.
 *
 * @param content - Tiptap JSON 콘텐츠
 * @returns 변환된 텍스트
 */
export function contentToText(content: JSONContent | undefined): string {
  if (!content || !content.content || content.content.length === 0) {
    return ''
  }

  // 텍스트 노드 추출 헬퍼 함수
  function extractText(node: JSONContent): string {
    if (node.type === 'text') {
      return node.text || ''
    }

    if (node.content && node.content.length > 0) {
      return node.content.map(extractText).join('')
    }

    return ''
  }

  // 각 단락의 텍스트 추출 및 줄바꿈으로 연결
  const paragraphs = content.content
    .map((node) => extractText(node))
    .filter((text) => text.length > 0)

  return paragraphs.join('\n')
}

/**
 * 빈 콘텐츠인지 확인
 * @param content - 확인할 JSON 콘텐츠
 * @returns 비어있으면 true
 */
export function isEmptyContent(content: JSONContent | undefined): boolean {
  if (!content || !content.content || content.content.length === 0) {
    return true
  }

  // 모든 노드가 비어있는지 확인
  return content.content.every((node) => {
    if (!node.content || node.content.length === 0) {
      return true
    }
    return node.content.every((child) => !child.text || child.text.trim() === '')
  })
}
