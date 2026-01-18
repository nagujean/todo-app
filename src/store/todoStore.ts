import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'high' | 'medium' | 'low'
export type SortType = 'created' | 'priority' | 'startDate' | 'endDate'
export type SortOrder = 'asc' | 'desc'

/**
 * Todo Interface
 *
 * Based on REQ-DATA-001 from Requirements.md
 * - id: UUID v4 format (REQ-DATA-006)
 * - title: Max 200 characters (REQ-DATA-005)
 * - createdAt: ISO 8601 format (REQ-DATA-007)
 * - updatedAt: ISO 8601 format (REQ-DATA-007)
 * - completedAt: ISO 8601 format or null (REQ-DATA-001)
 */
export interface Todo {
  id: string
  title: string // Max 200 characters (REQ-DATA-005)
  completed: boolean
  createdAt: string // ISO 8601 format (REQ-DATA-007)
  updatedAt: string // ISO 8601 format (REQ-DATA-001)
  completedAt: string | null // ISO 8601 or null (REQ-DATA-001)
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface AddTodoParams {
  title: string
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface TodoState {
  todos: Todo[]
  sortType: SortType
  sortOrder: SortOrder
  hideCompleted: boolean
  addTodo: (params: AddTodoParams) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
  setSortType: (sortType: SortType) => void
  setSortOrder: (sortOrder: SortOrder) => void
  setHideCompleted: (hide: boolean) => void
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/**
 * Helper function to generate ISO 8601 timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString()
}

export function sortTodos(todos: Todo[], sortType: SortType, sortOrder: SortOrder): Todo[] {
  const sorted = [...todos].sort((a, b) => {
    let comparison = 0

    switch (sortType) {
      case 'priority': {
        const aPriority = a.priority ? priorityOrder[a.priority] : 3
        const bPriority = b.priority ? priorityOrder[b.priority] : 3
        comparison = aPriority - bPriority
        break
      }
      case 'startDate': {
        const aDate = a.startDate || ''
        const bDate = b.startDate || ''
        if (!aDate && !bDate) comparison = 0
        else if (!aDate) comparison = 1
        else if (!bDate) comparison = -1
        else comparison = aDate.localeCompare(bDate)
        break
      }
      case 'endDate': {
        const aDate = a.endDate || ''
        const bDate = b.endDate || ''
        if (!aDate && !bDate) comparison = 0
        else if (!aDate) comparison = 1
        else if (!bDate) comparison = -1
        else comparison = aDate.localeCompare(bDate)
        break
      }
      case 'created':
      default: {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        comparison = aTime - bTime
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return sorted
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      sortType: 'created',
      sortOrder: 'desc',
      hideCompleted: false,
      addTodo: ({ title, startDate, endDate, priority }) =>
        set((state) => {
          // Validate title length (REQ-DATA-005: Max 200 characters)
          const trimmedTitle = title.trim().slice(0, 200)

          // Don't add empty todos (REQ-FUNC-002)
          if (!trimmedTitle) {
            return state
          }

          const now = getTimestamp()
          const newTodo: Todo = {
            id: crypto.randomUUID(),
            title: trimmedTitle,
            completed: false,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            startDate,
            endDate,
            priority,
          }

          return {
            todos: [newTodo, ...state.todos], // Add to top (AC-001)
          }
        }),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  updatedAt: getTimestamp(),
                  completedAt: !todo.completed ? getTimestamp() : null,
                }
              : todo
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        })),
      setSortType: (sortType) => set({ sortType }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setHideCompleted: (hide) => set({ hideCompleted: hide }),
    }),
    {
      name: 'todo-storage',
    }
  )
)
