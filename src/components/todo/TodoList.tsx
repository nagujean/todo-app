'use client'

import { useTodoStore, sortTodos, type SortType } from '@/store/todoStore'
import { TodoItem } from './TodoItem'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'created', label: '입력일' },
  { value: 'priority', label: '우선순위' },
  { value: 'startDate', label: '시작일' },
  { value: 'endDate', label: '종료일' },
]

export function TodoList() {
  const { todos, clearCompleted, sortType, sortOrder, setSortType, setSortOrder } = useTodoStore()
  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  const sortedTodos = sortTodos(todos, sortType, sortOrder)

  const handleSortClick = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortType(type)
      setSortOrder('asc')
    }
  }

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
      <div className="flex items-center gap-1 text-xs">
        <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortClick(option.value)}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
              sortType === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {option.label}
            {sortType === option.value && (
              sortOrder === 'asc'
                ? <ArrowUp className="h-3 w-3" />
                : <ArrowDown className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {sortedTodos.map((todo) => (
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
