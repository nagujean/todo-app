'use client'

import { useState } from 'react'
import { useTodoStore, sortTodos, type SortType, type Todo, type FilterMode } from '@/store/todoStore'
import { TodoItem } from './TodoItem'
import { TodoDetail } from './TodoDetail'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'created', label: '입력일' },
  { value: 'priority', label: '우선순위' },
  { value: 'startDate', label: '시작일' },
  { value: 'endDate', label: '종료일' },
]

const filterOptions: { value: FilterMode; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'incomplete', label: '미완료' },
  { value: 'completed', label: '완료' },
]

export function TodoList() {
  const {
    todos,
    clearCompleted,
    sortType,
    sortOrder,
    setSortType,
    setSortOrder,
    filterMode,
    setFilterMode
  } = useTodoStore()

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleOpenDetail = (todo: Todo) => {
    setSelectedTodo(todo)
    setDetailOpen(true)
  }

  // REQ-FUNC-015: 필터 상태에 따른 목록 필터링
  const filteredTodos = todos.filter((todo) => {
    if (filterMode === 'incomplete') return !todo.completed
    if (filterMode === 'completed') return todo.completed
    return true
  })

  const sortedTodos = sortTodos(filteredTodos, sortType, sortOrder)

  // REQ-FUNC-015: 진행 상황이 필터링된 항목 기준으로 표시
  const completedCount = filteredTodos.filter((t) => t.completed).length
  const totalCount = filteredTodos.length

  const handleSortClick = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortType(type)
      setSortOrder('asc')
    }
  }

  const handleFilterClick = (mode: FilterMode) => {
    setFilterMode(mode)
  }

  if (todos.length === 0) {
    return (
      <div className="space-y-4">
        {/* REQ-FUNC-014: 필터 모드 - 전체/미완료/완료 버튼 (빈 목록에서도 표시) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterClick(option.value)}
                data-state={filterMode === option.value ? 'active' : 'inactive'}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  filterMode === option.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortClick(option.value)}
                data-state={sortType === option.value ? (sortOrder === 'asc' ? 'active' : 'selected') : 'inactive'}
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
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">할 일이 없어요</p>
          <p className="text-sm mt-1">위에서 새로운 할 일을 추가해보세요!</p>
        </div>
      </div>
    )
  }

  // 필터링된 목록이 비어있을 때 안내 메시지
  if (filteredTodos.length === 0) {
    return (
      <div className="space-y-4">
        {/* REQ-FUNC-014: 필터 모드 - 전체/미완료/완료 버튼 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterClick(option.value)}
                data-state={filterMode === option.value ? 'active' : 'inactive'}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  filterMode === option.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortClick(option.value)}
                data-state={sortType === option.value ? (sortOrder === 'asc' ? 'active' : 'selected') : 'inactive'}
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
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">할 일이 없어요</p>
          <p className="text-sm mt-1">
            {filterMode === 'completed' && '완료된 할 일이 없습니다.'}
            {filterMode === 'incomplete' && '모든 할 일을 완료했습니다!'}
            {filterMode === 'all' && '위에서 새로운 할 일을 추가해보세요!'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* REQ-FUNC-014: 필터 모드 - 전체/미완료/완료 버튼 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterClick(option.value)}
              data-state={filterMode === option.value ? 'active' : 'inactive'}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                filterMode === option.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground mr-1" />
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortClick(option.value)}
              data-state={sortType === option.value ? (sortOrder === 'asc' ? 'active' : 'selected') : 'inactive'}
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
      </div>

      <div className="space-y-2">
        {sortedTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onOpenDetail={handleOpenDetail} />
        ))}
      </div>

      <TodoDetail
        todo={selectedTodo}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        {/* REQ-FUNC-015: 진행 상황이 필터링된 항목 기준으로 표시 */}
        <span>
          {completedCount}/{totalCount} 완료
        </span>

        {/* REQ-FUNC-010: 완료된 항목 일괄 삭제 */}
        {completedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            완료된 항목 삭제
          </Button>
        )}
      </div>
    </div>
  )
}
