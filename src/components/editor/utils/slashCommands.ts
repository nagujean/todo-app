// 슬래시 명령어 유틸리티
// 에디터에서 "/" 키 입력 시 표시할 명령어 메뉴를 정의합니다.

import type { JSONContent } from '@tiptap/react'

/**
 * 슬래시 명령어 타입
 */
export type SlashCommandItemType = {
  id: string
  label: string
  description: string
  icon: string
  keywords: string[]
  action: () => JSONContent
}

/**
 * 슬래시 명령어 목록
 * Notion 스타일의 블록 타입 삽입 명령어들
 */
export const slashCommands: SlashCommandItemType[] = [
  {
    id: 'task-list',
    label: '체크리스트',
    description: '체크 가능한 항목 리스트',
    icon: '☑️',
    keywords: ['task', 'checklist', 'todo', '할일'],
    action: () => ({
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {
            checked: false,
          },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  {
    id: 'bullet-list',
    label: '글머리 기호 리스트',
    description: '글머리 기호가 있는 리스트',
    icon: '•',
    keywords: ['bullet', 'list', 'ul', '점'],
    action: () => ({
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  {
    id: 'ordered-list',
    label: '번호 매기기 리스트',
    description: '번호가 있는 리스트',
    icon: '1.',
    keywords: ['ordered', 'number', 'ol', '숫자', '번호'],
    action: () => ({
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '',
                },
              ],
            },
          ],
        },
      ],
    }),
  },
  {
    id: 'heading-1',
    label: '제목 1',
    description: '큰 제목',
    icon: 'H1',
    keywords: ['heading', 'h1', 'title', '제목'],
    action: () => ({
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    }),
  },
  {
    id: 'heading-2',
    label: '제목 2',
    description: '중간 제목',
    icon: 'H2',
    keywords: ['heading', 'h2', 'subtitle', '부제목'],
    action: () => ({
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    }),
  },
  {
    id: 'horizontal-rule',
    label: '구분선',
    description: '가로 구분선',
    icon: '—',
    keywords: ['hr', 'divider', 'separator', '구분선', '선'],
    action: () => ({
      type: 'horizontalRule',
    }),
  },
]

/**
 * 키워드로 명령어 필터링
 * @param query - 검색어
 * @returns 필터링된 명령어 목록
 */
export function filterCommands(query: string): SlashCommandItemType[] {
  const lowerQuery = query.toLowerCase()

  return slashCommands.filter(
    (command) =>
      command.label.toLowerCase().includes(lowerQuery) ||
      command.description.toLowerCase().includes(lowerQuery) ||
      command.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  )
}
