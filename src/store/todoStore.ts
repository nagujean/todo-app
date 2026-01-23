import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type Priority = 'high' | 'medium' | 'low'
export type SortType = 'created' | 'priority' | 'startDate' | 'endDate'
export type SortOrder = 'asc' | 'desc'
export type ViewMode = 'list' | 'calendar'
export type FilterMode = 'all' | 'incomplete' | 'completed'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  completedAt: string | null
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface AddTodoParams {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface UpdateTodoParams {
  id: string
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  priority?: Priority
}

interface TodoState {
  todos: Todo[]
  sortType: SortType
  sortOrder: SortOrder
  hideCompleted: boolean
  viewMode: ViewMode
  filterMode: FilterMode
  userId: string | null
  isLoading: boolean
  addTodo: (params: AddTodoParams) => Promise<void>
  updateTodo: (params: UpdateTodoParams) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearCompleted: () => Promise<void>
  setSortType: (sortType: SortType) => void
  setSortOrder: (sortOrder: SortOrder) => void
  setHideCompleted: (hide: boolean) => void
  setViewMode: (mode: ViewMode) => void
  setFilterMode: (mode: FilterMode) => void
  setUserId: (userId: string | null) => void
  setTodos: (todos: Todo[]) => void
  setLoading: (loading: boolean) => void
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

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

// Helper to get todos collection reference
function getTodosCollection(userId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'users', userId, 'todos')
}

// Helper to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  return timestamp.toDate().toISOString()
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      sortType: 'created',
      sortOrder: 'desc',
      hideCompleted: false,
      viewMode: 'list',
      filterMode: 'all',
      userId: null,
      isLoading: false,

      addTodo: async ({ title, description, startDate, endDate, priority }) => {
        const { userId } = get()
        const trimmedTitle = title.trim().slice(0, 200)
        if (!trimmedTitle) return

        const now = getTimestamp()

        if (userId && db) {
          // Save to Firestore
          const todoData = {
            title: trimmedTitle,
            description: description?.trim() || null,
            completed: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            completedAt: null,
            startDate: startDate || null,
            endDate: endDate || null,
            priority: priority || null,
          }

          await addDoc(getTodosCollection(userId), todoData)
        } else {
          // Fallback to local storage
          const newTodo: Todo = {
            id: crypto.randomUUID(),
            title: trimmedTitle,
            description: description?.trim() || undefined,
            completed: false,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            startDate,
            endDate,
            priority,
          }

          set((state) => ({
            todos: [newTodo, ...state.todos],
          }))
        }
      },

      updateTodo: async ({ id, title, description, startDate, endDate, priority }) => {
        const { userId } = get()

        if (userId && db) {
          const todoRef = doc(db, 'users', userId, 'todos', id)
          const updates: Record<string, unknown> = {
            updatedAt: Timestamp.now(),
          }

          if (title !== undefined) updates.title = title.trim().slice(0, 200)
          if (description !== undefined) updates.description = description || null
          if (startDate !== undefined) updates.startDate = startDate || null
          if (endDate !== undefined) updates.endDate = endDate || null
          if (priority !== undefined) updates.priority = priority || null

          await updateDoc(todoRef, updates)
        } else {
          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id
                ? {
                    ...todo,
                    title: title !== undefined ? title.trim().slice(0, 200) : todo.title,
                    description: description !== undefined ? description : todo.description,
                    startDate: startDate !== undefined ? startDate : todo.startDate,
                    endDate: endDate !== undefined ? endDate : todo.endDate,
                    priority: priority !== undefined ? priority : todo.priority,
                    updatedAt: getTimestamp(),
                  }
                : todo
            ),
          }))
        }
      },

      toggleTodo: async (id) => {
        const { userId, todos } = get()
        const todo = todos.find((t) => t.id === id)
        if (!todo) return

        const newCompleted = !todo.completed
        const now = Timestamp.now()

        if (userId && db) {
          const todoRef = doc(db, 'users', userId, 'todos', id)
          await updateDoc(todoRef, {
            completed: newCompleted,
            updatedAt: now,
            completedAt: newCompleted ? now : null,
          })
        } else {
          const nowStr = getTimestamp()
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id
                ? {
                    ...t,
                    completed: newCompleted,
                    updatedAt: nowStr,
                    completedAt: newCompleted ? nowStr : null,
                  }
                : t
            ),
          }))
        }
      },

      deleteTodo: async (id) => {
        const { userId } = get()

        if (userId && db) {
          const todoRef = doc(db, 'users', userId, 'todos', id)
          await deleteDoc(todoRef)
        } else {
          set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
          }))
        }
      },

      clearCompleted: async () => {
        const { userId, todos } = get()

        if (userId && db) {
          const completedTodos = todos.filter((t) => t.completed)
          const firestoreDb = db
          const batch = writeBatch(firestoreDb)

          completedTodos.forEach((todo) => {
            const todoRef = doc(firestoreDb, 'users', userId, 'todos', todo.id)
            batch.delete(todoRef)
          })

          await batch.commit()
        } else {
          set((state) => ({
            todos: state.todos.filter((todo) => !todo.completed),
          }))
        }
      },

      setSortType: (sortType) => set({ sortType }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setHideCompleted: (hide) => set({ hideCompleted: hide }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFilterMode: (filterMode) => set({ filterMode }),
      setUserId: (userId) => set({ userId, todos: userId ? [] : get().todos }),
      setTodos: (todos) => set({ todos }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({
        sortType: state.sortType,
        sortOrder: state.sortOrder,
        hideCompleted: state.hideCompleted,
        viewMode: state.viewMode,
        filterMode: state.filterMode,
        // Only persist local todos when not logged in
        todos: state.userId ? [] : state.todos,
      }),
    }
  )
)

// Subscribe to Firestore changes
let unsubscribe: Unsubscribe | null = null

export function subscribeToTodos(userId: string) {
  // Unsubscribe from previous listener
  if (unsubscribe) {
    unsubscribe()
  }

  if (!db) {
    return () => {}
  }

  const { setTodos, setLoading, setUserId } = useTodoStore.getState()
  setUserId(userId)
  setLoading(true)

  const todosQuery = query(getTodosCollection(userId))

  unsubscribe = onSnapshot(
    todosQuery,
    (snapshot) => {
      const todos: Todo[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          description: data.description || undefined,
          completed: data.completed,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          completedAt: data.completedAt ? convertTimestamp(data.completedAt) : null,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          priority: data.priority || undefined,
        }
      })

      setTodos(todos)
      setLoading(false)
    },
    (error) => {
      console.error('Error subscribing to todos:', error)
      setLoading(false)
    }
  )

  return unsubscribe
}

export function unsubscribeFromTodos() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  const { setUserId } = useTodoStore.getState()
  setUserId(null)
}
