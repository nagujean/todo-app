'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Todo, type Priority } from '@/store/todoStore'
import { usePresetStore } from '@/store/presetStore'
import { Star, Calendar, FileText } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
  onOpenDetail?: (todo: Todo) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: '높음', color: 'bg-red-500' },
  medium: { label: '중간', color: 'bg-yellow-500' },
  low: { label: '낮음', color: 'bg-blue-500' },
}

export function TodoItem({ todo, onOpenDetail }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()
  const { presets, addPreset } = usePresetStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const isPreset = presets.some((p) => p.title === todo.title)
  const hasDate = todo.startDate || todo.endDate
  const hasDescription = !!todo.description

  const handleDelete = () => {
    setIsDeleting(true)
    // REQ-FUNC-009: 페이드아웃 애니메이션 (300ms)
    setTimeout(() => {
      deleteTodo(todo.id)
    }, 300)
  }

  if (isDeleting) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-card rounded-lg border group hover:border-primary/30 transition-all cursor-pointer ${
        todo.completed ? 'opacity-60' : ''
      }`}
      data-testid="todo-item"
      onClick={() => onOpenDetail?.(todo)}
    >
      {todo.priority && (
        <div
          className={`w-1 h-8 rounded-full ${priorityConfig[todo.priority].color}`}
          title={`우선순위: ${priorityConfig[todo.priority].label}`}
          aria-label={`우선순위: ${priorityConfig[todo.priority].label}`}
        />
      )}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          id={todo.id}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </span>
          {hasDescription && (
            <FileText className="h-3 w-3 text-muted-foreground" title="상세 내용 있음" />
          )}
        </div>
        {hasDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>
              {todo.startDate && formatDate(todo.startDate)}
              {todo.startDate && todo.endDate && ' ~ '}
              {todo.endDate && formatDate(todo.endDate)}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {!isPreset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addPreset(todo.title)}
            title="프리셋으로 저장"
            aria-label="프리셋으로 저장"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          삭제
        </Button>
      </div>
    </div>
  )
}
