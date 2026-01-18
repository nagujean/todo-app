import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'high' | 'medium' | 'low'

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
  addTodo: (params: AddTodoParams) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
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
    }),
    {
      name: 'todo-storage',
    }
  )
)
