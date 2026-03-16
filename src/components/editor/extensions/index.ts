// Tiptap 확장 설정
// Rich Text Editor를 위한 Tiptap 확장들을 구성합니다.

import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'

/**
 * 에디터 확장 목록
 * - StarterKit: 기본 텍스트 편집 기능 (볼드, 이탤릭, 리스트 등)
 * - TaskList: 체크리스트 컨테이너
 * - TaskItem: 체크리스트 아이템 (토글 가능)
 * - Placeholder: 빈 상태일 때 플레이스홀더 표시
 */
export const extensions = [
  StarterKit.configure({
    bulletList: {
      // HTML 태그 클래스 설정
      HTMLAttributes: {
        class: 'list-disc list-inside ml-4',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal list-inside ml-4',
      },
    },
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'not-prose pl-2',
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: 'flex items-start my-1',
    },
    nested: true,
  }),
  Placeholder.configure({
    placeholder: '상세 내용을 입력하세요... (/ 로 명령어 메뉴 열기)',
  }),
]
