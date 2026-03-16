import type { Todo, Priority } from '@/store/todoStore'
import type { Preset } from '@/store/presetStore'
import type { JSONContent } from '@tiptap/react'

export interface MockTodoOptions {
  id?: string
  title?: string
  description?: string
  content?: JSONContent
  completed?: boolean
  createdAt?: string
  updatedAt?: string
  completedAt?: string | null
  startDate?: string
  endDate?: string
  priority?: Priority
}

let todoCounter = 0

export function createMockTodo(options: MockTodoOptions = {}): Todo {
  todoCounter++
  const now = new Date().toISOString()
  return {
    id: options.id ?? `todo-${todoCounter}`,
    title: options.title ?? `Test Todo ${todoCounter}`,
    description: options.description,
    content: options.content,
    completed: options.completed ?? false,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
    completedAt: options.completedAt ?? null,
    startDate: options.startDate,
    endDate: options.endDate,
    priority: options.priority,
  }
}

let presetCounter = 0

export function createMockPreset(options: { id?: string; title?: string; createdAt?: string } = {}): Preset {
  presetCounter++
  return {
    id: options.id ?? `preset-${presetCounter}`,
    title: options.title ?? `Preset ${presetCounter}`,
    createdAt: options.createdAt ?? new Date().toISOString(),
  }
}
