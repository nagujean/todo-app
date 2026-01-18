'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Todo, type Priority } from '@/store/todoStore'
import { usePresetStore } from '@/store/presetStore'
import { Star, Calendar } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
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

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()
  const { presets, addPreset } = usePresetStore()

  const isPreset = presets.some((p) => p.text === todo.title) // Changed from todo.text to todo.title
  const hasDate = todo.startDate || todo.endDate

  return (
    <div
      className="flex items-center gap-3 p-3 bg-card rounded-lg border group"
      data-testid="todo-item" // Added for E2E testing
    >
      {todo.priority && (
        <div
          className={`w-1 h-8 rounded-full ${priorityConfig[todo.priority].color}`}
          title={`우선순위: ${priorityConfig[todo.priority].label}`}
          aria-label={`우선순위: ${priorityConfig[todo.priority].label}`}
        />
      )}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        id={todo.id}
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={todo.id}
          className={`cursor-pointer block ${
            todo.completed ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {todo.title} {/* Changed from todo.text to todo.title */}
        </label>
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
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isPreset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addPreset(todo.title)} // Changed from todo.text to todo.title
            title="프리셋으로 저장"
            aria-label="프리셋으로 저장"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTodo(todo.id)}
          className="text-destructive hover:text-destructive"
        >
          삭제
        </Button>
      </div>
    </div>
  )
}
