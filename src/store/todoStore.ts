import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'high' | 'medium' | 'low'
export type SortType = 'created' | 'priority' | 'startDate' | 'endDate'
export type SortOrder = 'asc' | 'desc'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface AddTodoParams {
  text: string
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface TodoState {
  todos: Todo[]
  sortType: SortType
  sortOrder: SortOrder
  addTodo: (params: AddTodoParams) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
  setSortType: (sortType: SortType) => void
  setSortOrder: (sortOrder: SortOrder) => void
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
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
      addTodo: ({ text, startDate, endDate, priority }) =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: crypto.randomUUID(),
              text,
              completed: false,
              createdAt: new Date(),
              startDate,
              endDate,
              priority,
            },
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
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
    }),
    {
      name: 'todo-storage',
    }
  )
)
