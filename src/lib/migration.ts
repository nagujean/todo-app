// 마이그레이션 유틸리티
// 기존 description 필드를 새로운 content 필드로 변환합니다.

import type { JSONContent } from '@tiptap/react'
import { textToContent } from '@/components/editor'

/**
 * Todo 인터페이스 (마이그레이션용)
 */
interface TodoWithDescription {
  description?: string
  content?: JSONContent
}

/**
 * description 필드를 content 필드로 마이그레이션
 * @param todo - 마이그레이션할 Todo 객체
 * @returns content 필드가 추가된 Todo 객체
 */
export function migrateDescriptionToContent(todo: TodoWithDescription): TodoWithDescription {
  // 이미 content가 있거나 description이 없는 경우 아무것도 하지 않음
  if (todo.content || !todo.description) {
    return todo
  }

  // description을 JSONContent로 변환
  return {
    ...todo,
    content: textToContent(todo.description),
  }
}

/**
 * 여러 Todo 객체를 일괄 마이그레이션
 * @param todos - 마이그레이션할 Todo 객체 배열
 * @returns 마이그레이션된 Todo 객체 배열
 */
export function migrateTodos(todos: TodoWithDescription[]): TodoWithDescription[] {
  return todos.map(migrateDescriptionToContent)
}

/**
 * 마이그레이션이 필요한 Todo 객체 필터링
 * @param todo - 확인할 Todo 객체
 * @returns 마이그레이션이 필요하면 true
 */
export function needsMigration(todo: TodoWithDescription): boolean {
  return !todo.content && !!todo.description
}

/**
 * 마이그레이션이 필요한 Todo 객체 수 계산
 * @param todos - 확인할 Todo 객체 배열
 * @returns 마이그레이션이 필요한 Todo 객체 수
 */
export function countNeedsMigration(todos: TodoWithDescription[]): number {
  return todos.filter(needsMigration).length
}
