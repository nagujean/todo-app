import { create } from "zustand";
import { persist } from "zustand/middleware";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { convertTimestamp } from "@/lib/utils";
import { logger } from "@/lib/logger";

import type { JSONContent } from "@tiptap/react";

export type Priority = "high" | "medium" | "low";
export type SortType = "created" | "priority" | "startDate" | "endDate";
export type SortOrder = "asc" | "desc";
export type ViewMode = "list" | "calendar";
export type FilterMode = "all" | "incomplete" | "completed";

export interface Todo {
  id: string;
  title: string;
  description?: string; // @MX:NOTE: Deprecated - read-only for backward compatibility
  content?: JSONContent; // @MX:NOTE: Tiptap JSON format for rich text content
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  startDate?: string;
  endDate?: string;
  priority?: Priority;
  teamId?: string; // 팀 할일인 경우 팀 ID (null = 개인 할일)
}

interface AddTodoParams {
  title: string;
  description?: string; // @MX:NOTE: Deprecated - use content instead
  content?: JSONContent; // Tiptap JSON format
  startDate?: string;
  endDate?: string;
  priority?: Priority;
}

interface UpdateTodoParams {
  id: string;
  title?: string;
  description?: string; // @MX:NOTE: Deprecated - use content instead
  content?: JSONContent; // Tiptap JSON format
  startDate?: string;
  endDate?: string;
  priority?: Priority;
}

interface TodoState {
  todos: Todo[];
  sortType: SortType;
  sortOrder: SortOrder;
  hideCompleted: boolean;
  viewMode: ViewMode;
  filterMode: FilterMode;
  userId: string | null;
  currentTeamId: string | null; // null = 개인 모드, string = 팀 모드
  isLoading: boolean;
  addTodo: (params: AddTodoParams) => Promise<void>;
  updateTodo: (params: UpdateTodoParams) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  setSortType: (sortType: SortType) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setHideCompleted: (hide: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilterMode: (mode: FilterMode) => void;
  setUserId: (userId: string | null) => void;
  setCurrentTeamId: (teamId: string | null) => void;
  setTodos: (todos: Todo[]) => void;
  setLoading: (loading: boolean) => void;
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function getTimestamp(): string {
  return new Date().toISOString();
}

export function sortTodos(todos: Todo[], sortType: SortType, sortOrder: SortOrder): Todo[] {
  const sorted = [...todos].sort((a, b) => {
    let comparison = 0;

    switch (sortType) {
      case "priority": {
        const aPriority = a.priority ? priorityOrder[a.priority] : 3;
        const bPriority = b.priority ? priorityOrder[b.priority] : 3;
        comparison = aPriority - bPriority;
        break;
      }
      case "startDate": {
        const aDate = a.startDate || "";
        const bDate = b.startDate || "";
        if (!aDate && !bDate) comparison = 0;
        else if (!aDate) comparison = 1;
        else if (!bDate) comparison = -1;
        else comparison = aDate.localeCompare(bDate);
        break;
      }
      case "endDate": {
        const aDate = a.endDate || "";
        const bDate = b.endDate || "";
        if (!aDate && !bDate) comparison = 0;
        else if (!aDate) comparison = 1;
        else if (!bDate) comparison = -1;
        else comparison = aDate.localeCompare(bDate);
        break;
      }
      case "created":
      default: {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        comparison = aTime - bTime;
        break;
      }
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

// 개인 할일 컬렉션 경로: users/{userId}/todos
function getPersonalTodosCollection(userId: string) {
  if (!db) throw new Error("Firestore not initialized");
  return collection(db, "users", userId, "todos");
}

// 팀 할일 컬렉션 경로: teams/{teamId}/todos
function getTeamTodosCollection(teamId: string) {
  if (!db) throw new Error("Firestore not initialized");
  return collection(db, "teams", teamId, "todos");
}

// 현재 모드에 따라 적절한 컬렉션 반환
function getTodosCollection(userId: string, teamId: string | null) {
  if (teamId) {
    return getTeamTodosCollection(teamId);
  }
  return getPersonalTodosCollection(userId);
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      sortType: "created",
      sortOrder: "desc",
      hideCompleted: false,
      viewMode: "list",
      filterMode: "all",
      userId: null,
      currentTeamId: null,
      isLoading: false,

      addTodo: async ({ title, description, content, startDate, endDate, priority }) => {
        const { userId, currentTeamId } = get();
        const trimmedTitle = title.trim().slice(0, 200);
        if (!trimmedTitle) return;

        const now = getTimestamp();
        const mode = currentTeamId ? "team" : "personal";

        logger.info("[addTodo] Adding todo:", {
          title: trimmedTitle,
          userId,
          teamId: currentTeamId,
          mode,
        });

        // 낙관적 업데이트
        const tempId = `temp-${crypto.randomUUID()}`;
        const newTodo: Todo = {
          id: tempId,
          title: trimmedTitle,
          description: description?.trim() || undefined,
          content,
          completed: false,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          startDate,
          endDate,
          priority,
          teamId: currentTeamId || undefined,
        };

        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));

        // 팀 모드에서는 userId가 없어도 팀 ID로 저장 가능
        if ((userId || currentTeamId) && db) {
          try {
            const todoData = {
              title: trimmedTitle,
              description: description?.trim() || null,
              content: content || null,
              completed: false,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              completedAt: null,
              startDate: startDate || null,
              endDate: endDate || null,
              priority: priority || null,
              teamId: currentTeamId || null,
            };

            const collectionRef = getTodosCollection(userId!, currentTeamId);
            const docRef = await addDoc(collectionRef, todoData);
            logger.info("[addTodo] Todo saved:", { id: docRef.id, mode, teamId: currentTeamId });

            set((state) => ({
              todos: state.todos.map((todo) =>
                todo.id === tempId ? { ...todo, id: docRef.id } : todo
              ),
            }));
          } catch (error) {
            logger.error("[addTodo] Failed to save todo:", error);
            set((state) => ({
              todos: state.todos.filter((todo) => todo.id !== tempId),
            }));
          }
        }
      },

      updateTodo: async ({ id, title, description, content, startDate, endDate, priority }) => {
        const { userId, currentTeamId } = get();

        if ((userId || currentTeamId) && db) {
          try {
            const todoRef = currentTeamId
              ? doc(db, "teams", currentTeamId, "todos", id)
              : doc(db, "users", userId!, "todos", id);

            const updates: Record<string, unknown> = {
              updatedAt: Timestamp.now(),
            };

            if (title !== undefined) updates.title = title.trim().slice(0, 200);
            if (description !== undefined) updates.description = description || null;
            if (content !== undefined) updates.content = content || null;
            if (startDate !== undefined) updates.startDate = startDate || null;
            if (endDate !== undefined) updates.endDate = endDate || null;
            if (priority !== undefined) updates.priority = priority || null;

            await updateDoc(todoRef, updates);
            logger.info("Todo updated:", { id, mode: currentTeamId ? "team" : "personal" });
          } catch (error) {
            logger.error("Failed to update todo, falling back to local:", error);
            set((state) => ({
              todos: state.todos.map((todo) =>
                todo.id === id
                  ? {
                      ...todo,
                      title: title !== undefined ? title.trim().slice(0, 200) : todo.title,
                      description: description !== undefined ? description : todo.description,
                      content: content !== undefined ? content : todo.content,
                      startDate: startDate !== undefined ? startDate : todo.startDate,
                      endDate: endDate !== undefined ? endDate : todo.endDate,
                      priority: priority !== undefined ? priority : todo.priority,
                      updatedAt: getTimestamp(),
                    }
                  : todo
              ),
            }));
          }
        } else {
          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id
                ? {
                    ...todo,
                    title: title !== undefined ? title.trim().slice(0, 200) : todo.title,
                    description: description !== undefined ? description : todo.description,
                    content: content !== undefined ? content : todo.content,
                    startDate: startDate !== undefined ? startDate : todo.startDate,
                    endDate: endDate !== undefined ? endDate : todo.endDate,
                    priority: priority !== undefined ? priority : todo.priority,
                    updatedAt: getTimestamp(),
                  }
                : todo
            ),
          }));
        }
      },

      toggleTodo: async (id) => {
        const { userId, currentTeamId, todos } = get();
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        const newCompleted = !todo.completed;
        const now = Timestamp.now();

        if ((userId || currentTeamId) && db) {
          try {
            const todoRef = currentTeamId
              ? doc(db, "teams", currentTeamId, "todos", id)
              : doc(db, "users", userId!, "todos", id);

            await updateDoc(todoRef, {
              completed: newCompleted,
              updatedAt: now,
              completedAt: newCompleted ? now : null,
            });
            logger.info("Todo toggled:", {
              id,
              newCompleted,
              mode: currentTeamId ? "team" : "personal",
            });
          } catch (error) {
            logger.error("Failed to toggle todo, falling back to local:", error);
            const nowStr = getTimestamp();
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
            }));
          }
        } else {
          const nowStr = getTimestamp();
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
          }));
        }
      },

      deleteTodo: async (id) => {
        const { userId, currentTeamId } = get();

        if ((userId || currentTeamId) && db) {
          try {
            const todoRef = currentTeamId
              ? doc(db, "teams", currentTeamId, "todos", id)
              : doc(db, "users", userId!, "todos", id);

            await deleteDoc(todoRef);
            logger.info("Todo deleted:", { id, mode: currentTeamId ? "team" : "personal" });
          } catch (error) {
            logger.error("Failed to delete todo, falling back to local:", error);
            set((state) => ({
              todos: state.todos.filter((todo) => todo.id !== id),
            }));
          }
        } else {
          set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
          }));
        }
      },

      clearCompleted: async () => {
        const { userId, currentTeamId, todos } = get();

        if ((userId || currentTeamId) && db) {
          try {
            const completedTodos = todos.filter((t) => t.completed);
            const firestoreDb = db; // Capture db reference for type safety
            const batch = writeBatch(firestoreDb);

            completedTodos.forEach((todo) => {
              const todoRef = currentTeamId
                ? doc(firestoreDb, "teams", currentTeamId, "todos", todo.id)
                : doc(firestoreDb, "users", userId!, "todos", todo.id);
              batch.delete(todoRef);
            });

            await batch.commit();
            logger.info("Cleared completed todos:", {
              count: completedTodos.length,
              mode: currentTeamId ? "team" : "personal",
            });
          } catch (error) {
            logger.error("Failed to clear completed todos, falling back to local:", error);
            set((state) => ({
              todos: state.todos.filter((todo) => !todo.completed),
            }));
          }
        } else {
          set((state) => ({
            todos: state.todos.filter((todo) => !todo.completed),
          }));
        }
      },

      setSortType: (sortType) => set({ sortType }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setHideCompleted: (hide) => set({ hideCompleted: hide }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFilterMode: (filterMode) => set({ filterMode }),
      setUserId: (userId) => set({ userId, todos: userId ? [] : get().todos }),
      setCurrentTeamId: (teamId) => set({ currentTeamId: teamId, todos: [] }),
      setTodos: (todos) => set({ todos }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "todo-storage",
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
);

// Firestore 구독 관리
let unsubscribe: Unsubscribe | null = null;

// 개인 할일 구독
export function subscribeToTodos(userId: string) {
  logger.debug("[TodoStore] subscribeToTodos called with userId:", userId);

  if (unsubscribe) {
    logger.debug("[TodoStore] Unsubscribing previous listener");
    unsubscribe();
  }

  if (!db) {
    logger.warn("[TodoStore] Firestore not initialized");
    return () => {};
  }

  const { setTodos, setLoading, setUserId, setCurrentTeamId } = useTodoStore.getState();
  logger.debug("[TodoStore] Setting userId in store:", userId);
  setUserId(userId);
  setCurrentTeamId(null); // 개인 모드
  setLoading(true);

  const todosQuery = query(getPersonalTodosCollection(userId));

  unsubscribe = onSnapshot(
    todosQuery,
    (snapshot) => {
      logger.debug("[TodoStore] onSnapshot fired, docs:", snapshot.docs.length);
      const todos: Todo[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || undefined,
          content: data.content || undefined,
          completed: data.completed,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          completedAt: data.completedAt ? convertTimestamp(data.completedAt) : null,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          priority: data.priority || undefined,
          teamId: data.teamId || undefined,
        };
      });

      setTodos(todos);
      setLoading(false);
      logger.debug("[TodoStore] Todos loaded:", todos.length);
    },
    (error) => {
      logger.error("[TodoStore] Error subscribing to todos:", error);
      setLoading(false);
    }
  );

  return unsubscribe;
}

// 팀 할일 구독
export function subscribeToTeamTodos(teamId: string) {
  logger.debug("[TodoStore] subscribeToTeamTodos called with teamId:", teamId);

  if (unsubscribe) {
    logger.debug("[TodoStore] Unsubscribing previous listener");
    unsubscribe();
  }

  if (!db) {
    logger.warn("[TodoStore] Firestore not initialized");
    return () => {};
  }

  const { setTodos, setLoading, setCurrentTeamId } = useTodoStore.getState();
  logger.debug("[TodoStore] Setting teamId in store:", teamId);
  setCurrentTeamId(teamId);
  setLoading(true);

  const todosQuery = query(getTeamTodosCollection(teamId));

  unsubscribe = onSnapshot(
    todosQuery,
    (snapshot) => {
      logger.debug("[TodoStore] Team onSnapshot fired, docs:", snapshot.docs.length);
      // @MX:NOTE: SPEC-CHECKLIST-001 - content 필드 누락 버그 수정
      const todos: Todo[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || undefined,
          content: data.content || undefined, // @MX:FIX: 팀 할일에서 content 필드 로드 누락 수정
          completed: data.completed,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          completedAt: data.completedAt ? convertTimestamp(data.completedAt) : null,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          priority: data.priority || undefined,
          teamId: teamId,
        };
      });

      setTodos(todos);
      setLoading(false);
      logger.debug("[TodoStore] Team todos loaded:", todos.length);
    },
    (error) => {
      logger.error("[TodoStore] Error subscribing to team todos:", error);
      setLoading(false);
    }
  );

  return unsubscribe;
}

export function unsubscribeFromTodos() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  const { setUserId, setCurrentTeamId } = useTodoStore.getState();
  setUserId(null);
  setCurrentTeamId(null);
}
