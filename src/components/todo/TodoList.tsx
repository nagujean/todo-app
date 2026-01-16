'use client'

import { useTodoStore } from '@/store/todoStore'
import { TodoItem } from './TodoItem'
import { Button } from '@/components/ui/button'

export function TodoList() {
  const { todos, clearCompleted } = useTodoStore()
  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">할 일이 없어요</p>
        <p className="text-sm mt-1">위에서 새로운 할 일을 추가해보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <span>
          {completedCount}/{totalCount} 완료
        </span>
        {completedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            완료된 항목 삭제
          </Button>
        )}
      </div>
    </div>
  )
}
