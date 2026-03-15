import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTodoStore, sortTodos, type Todo } from './todoStore';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
  },
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@/lib/firebase', () => ({
  db: null, // Set to null to use local storage mode
}));

describe('todoStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useTodoStore.getState();
    store.setTodos([]);
    store.setUserId(null);
    store.setLoading(false);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useTodoStore.getState();

      expect(state.todos).toEqual([]);
      expect(state.sortType).toBe('created');
      expect(state.sortOrder).toBe('desc');
      expect(state.hideCompleted).toBe(false);
      expect(state.viewMode).toBe('list');
      expect(state.filterMode).toBe('all');
      expect(state.userId).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addTodo', () => {
    it('should create todo with correct structure (local mode)', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
      });

      const todos = useTodoStore.getState().todos;
      expect(todos).toHaveLength(1);

      const todo = todos[0];
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test Description');
      expect(todo.priority).toBe('high');
      expect(todo.completed).toBe(false);
      expect(todo.completedAt).toBeNull();
      expect(todo.id).toBeDefined();
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it('should trim and limit title to 200 characters', async () => {
      const store = useTodoStore.getState();
      const longTitle = 'a'.repeat(250);

      await store.addTodo({ title: `  ${longTitle}  ` });

      const todos = useTodoStore.getState().todos;
      expect(todos[0].title).toHaveLength(200);
      expect(todos[0].title).not.toMatch(/^\s/); // No leading whitespace
    });

    it('should not add todo with empty title', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: '   ' });

      const todos = useTodoStore.getState().todos;
      expect(todos).toHaveLength(0);
    });

    it('should add todo with optional fields', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({
        title: 'Todo with dates',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        priority: 'medium',
      });

      const todos = useTodoStore.getState().todos;
      expect(todos[0].startDate).toBe('2024-01-15');
      expect(todos[0].endDate).toBe('2024-01-20');
      expect(todos[0].priority).toBe('medium');
    });

    it('should prepend new todo to the list', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'First' });
      await store.addTodo({ title: 'Second' });

      const todos = useTodoStore.getState().todos;
      expect(todos[0].title).toBe('Second');
      expect(todos[1].title).toBe('First');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle completed status from false to true', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Test' });
      const todoId = useTodoStore.getState().todos[0].id;

      await store.toggleTodo(todoId);

      const todo = useTodoStore.getState().todos[0];
      expect(todo.completed).toBe(true);
      expect(todo.completedAt).not.toBeNull();
    });

    it('should toggle completed status from true to false', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Test' });
      const todoId = useTodoStore.getState().todos[0].id;

      // Toggle to completed
      await store.toggleTodo(todoId);
      expect(useTodoStore.getState().todos[0].completed).toBe(true);

      // Toggle back to incomplete
      await store.toggleTodo(todoId);

      const todo = useTodoStore.getState().todos[0];
      expect(todo.completed).toBe(false);
      expect(todo.completedAt).toBeNull();
    });

    it('should update updatedAt timestamp', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Test' });
      const todoId = useTodoStore.getState().todos[0].id;
      const originalUpdatedAt = useTodoStore.getState().todos[0].updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));
      await store.toggleTodo(todoId);

      const newUpdatedAt = useTodoStore.getState().todos[0].updatedAt;
      expect(newUpdatedAt).not.toBe(originalUpdatedAt);
    });

    it('should not throw for non-existent todo', async () => {
      const store = useTodoStore.getState();

      await expect(store.toggleTodo('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('deleteTodo', () => {
    it('should remove todo from list', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'To Delete' });
      await store.addTodo({ title: 'To Keep' });

      const todoIdToDelete = useTodoStore.getState().todos.find(
        (t) => t.title === 'To Delete'
      )!.id;

      await store.deleteTodo(todoIdToDelete);

      const todos = useTodoStore.getState().todos;
      expect(todos).toHaveLength(1);
      expect(todos[0].title).toBe('To Keep');
    });

    it('should handle deleting non-existent todo gracefully', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Existing' });

      await expect(store.deleteTodo('non-existent-id')).resolves.not.toThrow();

      const todos = useTodoStore.getState().todos;
      expect(todos).toHaveLength(1);
    });
  });

  describe('updateTodo', () => {
    it('should update todo properties', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Original Title' });
      const todoId = useTodoStore.getState().todos[0].id;

      await store.updateTodo({
        id: todoId,
        title: 'Updated Title',
        description: 'New Description',
        priority: 'low',
      });

      const todo = useTodoStore.getState().todos[0];
      expect(todo.title).toBe('Updated Title');
      expect(todo.description).toBe('New Description');
      expect(todo.priority).toBe('low');
    });

    it('should update only specified fields', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({
        title: 'Original',
        description: 'Original Desc',
        priority: 'high',
      });
      const todoId = useTodoStore.getState().todos[0].id;

      await store.updateTodo({
        id: todoId,
        title: 'New Title',
      });

      const todo = useTodoStore.getState().todos[0];
      expect(todo.title).toBe('New Title');
      expect(todo.description).toBe('Original Desc');
      expect(todo.priority).toBe('high');
    });

    it('should update dates', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Test' });
      const todoId = useTodoStore.getState().todos[0].id;

      await store.updateTodo({
        id: todoId,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      });

      const todo = useTodoStore.getState().todos[0];
      expect(todo.startDate).toBe('2024-02-01');
      expect(todo.endDate).toBe('2024-02-28');
    });

    it('should trim and limit title on update', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Test' });
      const todoId = useTodoStore.getState().todos[0].id;

      const longTitle = 'b'.repeat(250);
      await store.updateTodo({ id: todoId, title: `  ${longTitle}  ` });

      const todo = useTodoStore.getState().todos[0];
      expect(todo.title).toHaveLength(200);
    });
  });

  describe('clearCompleted', () => {
    it('should remove all completed todos', async () => {
      const store = useTodoStore.getState();

      await store.addTodo({ title: 'Incomplete 1' });
      await store.addTodo({ title: 'Incomplete 2' });
      await store.addTodo({ title: 'Complete 1' });
      await store.addTodo({ title: 'Complete 2' });

      // Mark some as completed
      const todos = useTodoStore.getState().todos;
      await store.toggleTodo(todos.find((t) => t.title === 'Complete 1')!.id);
      await store.toggleTodo(todos.find((t) => t.title === 'Complete 2')!.id);

      await store.clearCompleted();

      const remainingTodos = useTodoStore.getState().todos;
      expect(remainingTodos).toHaveLength(2);
      expect(remainingTodos.every((t) => !t.completed)).toBe(true);
    });
  });

  describe('Setter functions', () => {
    it('setSortType should update sortType', () => {
      const store = useTodoStore.getState();
      store.setSortType('priority');
      expect(useTodoStore.getState().sortType).toBe('priority');
    });

    it('setSortOrder should update sortOrder', () => {
      const store = useTodoStore.getState();
      store.setSortOrder('asc');
      expect(useTodoStore.getState().sortOrder).toBe('asc');
    });

    it('setHideCompleted should update hideCompleted', () => {
      const store = useTodoStore.getState();
      store.setHideCompleted(true);
      expect(useTodoStore.getState().hideCompleted).toBe(true);
    });

    it('setViewMode should update viewMode', () => {
      const store = useTodoStore.getState();
      store.setViewMode('calendar');
      expect(useTodoStore.getState().viewMode).toBe('calendar');
    });

    it('setFilterMode should update filterMode', () => {
      const store = useTodoStore.getState();
      store.setFilterMode('completed');
      expect(useTodoStore.getState().filterMode).toBe('completed');
    });

    it('setLoading should update isLoading', () => {
      const store = useTodoStore.getState();
      store.setLoading(true);
      expect(useTodoStore.getState().isLoading).toBe(true);
    });
  });
});

describe('sortTodos', () => {
  const createTodo = (overrides: Partial<Todo>): Todo => ({
    id: `id-${Math.random()}`,
    title: 'Test',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  });

  describe('Sort by created date', () => {
    it('should sort by createdAt ascending', () => {
      const todos: Todo[] = [
        createTodo({ createdAt: '2024-01-03T00:00:00Z' }),
        createTodo({ createdAt: '2024-01-01T00:00:00Z' }),
        createTodo({ createdAt: '2024-01-02T00:00:00Z' }),
      ];

      const sorted = sortTodos(todos, 'created', 'asc');

      expect(sorted[0].createdAt).toBe('2024-01-01T00:00:00Z');
      expect(sorted[1].createdAt).toBe('2024-01-02T00:00:00Z');
      expect(sorted[2].createdAt).toBe('2024-01-03T00:00:00Z');
    });

    it('should sort by createdAt descending', () => {
      const todos: Todo[] = [
        createTodo({ createdAt: '2024-01-01T00:00:00Z' }),
        createTodo({ createdAt: '2024-01-03T00:00:00Z' }),
        createTodo({ createdAt: '2024-01-02T00:00:00Z' }),
      ];

      const sorted = sortTodos(todos, 'created', 'desc');

      expect(sorted[0].createdAt).toBe('2024-01-03T00:00:00Z');
      expect(sorted[1].createdAt).toBe('2024-01-02T00:00:00Z');
      expect(sorted[2].createdAt).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('Sort by priority', () => {
    it('should sort by priority ascending (high first)', () => {
      const todos: Todo[] = [
        createTodo({ priority: 'low' }),
        createTodo({ priority: 'high' }),
        createTodo({ priority: 'medium' }),
      ];

      const sorted = sortTodos(todos, 'priority', 'asc');

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should sort by priority descending (low first)', () => {
      const todos: Todo[] = [
        createTodo({ priority: 'high' }),
        createTodo({ priority: 'low' }),
        createTodo({ priority: 'medium' }),
      ];

      const sorted = sortTodos(todos, 'priority', 'desc');

      expect(sorted[0].priority).toBe('low');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('high');
    });

    it('should handle todos without priority', () => {
      const todos: Todo[] = [
        createTodo({ priority: 'high' }),
        createTodo({ priority: undefined }),
        createTodo({ priority: 'low' }),
      ];

      const sorted = sortTodos(todos, 'priority', 'asc');

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('low');
      expect(sorted[2].priority).toBeUndefined();
    });
  });

  describe('Sort by startDate', () => {
    it('should sort by startDate ascending', () => {
      const todos: Todo[] = [
        createTodo({ startDate: '2024-01-15' }),
        createTodo({ startDate: '2024-01-10' }),
        createTodo({ startDate: '2024-01-20' }),
      ];

      const sorted = sortTodos(todos, 'startDate', 'asc');

      expect(sorted[0].startDate).toBe('2024-01-10');
      expect(sorted[1].startDate).toBe('2024-01-15');
      expect(sorted[2].startDate).toBe('2024-01-20');
    });

    it('should place todos without startDate at the end (ascending)', () => {
      const todos: Todo[] = [
        createTodo({ startDate: undefined }),
        createTodo({ startDate: '2024-01-10' }),
        createTodo({ startDate: undefined }),
      ];

      const sorted = sortTodos(todos, 'startDate', 'asc');

      expect(sorted[0].startDate).toBe('2024-01-10');
      expect(sorted[1].startDate).toBeUndefined();
      expect(sorted[2].startDate).toBeUndefined();
    });
  });

  describe('Sort by endDate', () => {
    it('should sort by endDate ascending', () => {
      const todos: Todo[] = [
        createTodo({ endDate: '2024-02-28' }),
        createTodo({ endDate: '2024-02-15' }),
        createTodo({ endDate: '2024-02-20' }),
      ];

      const sorted = sortTodos(todos, 'endDate', 'asc');

      expect(sorted[0].endDate).toBe('2024-02-15');
      expect(sorted[1].endDate).toBe('2024-02-20');
      expect(sorted[2].endDate).toBe('2024-02-28');
    });

    it('should place todos without endDate at the end (ascending)', () => {
      const todos: Todo[] = [
        createTodo({ endDate: '2024-02-15' }),
        createTodo({ endDate: undefined }),
        createTodo({ endDate: '2024-02-10' }),
      ];

      const sorted = sortTodos(todos, 'endDate', 'asc');

      expect(sorted[0].endDate).toBe('2024-02-10');
      expect(sorted[1].endDate).toBe('2024-02-15');
      expect(sorted[2].endDate).toBeUndefined();
    });
  });

  it('should not mutate the original array', () => {
    const original: Todo[] = [
      createTodo({ createdAt: '2024-01-02T00:00:00Z' }),
      createTodo({ createdAt: '2024-01-01T00:00:00Z' }),
    ];
    const originalFirst = original[0];

    sortTodos(original, 'created', 'asc');

    expect(original[0]).toBe(originalFirst);
  });
});
