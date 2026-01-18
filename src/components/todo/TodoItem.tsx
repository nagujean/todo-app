'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Todo } from '@/store/todoStore'
import { usePresetStore } from '@/store/presetStore'
import { Star } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()
  const { presets, addPreset } = usePresetStore()

  const isPreset = presets.some((p) => p.text === todo.text)

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border group">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        id={todo.id}
      />
      <label
        htmlFor={todo.id}
        className={`flex-1 cursor-pointer ${
          todo.completed ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {todo.text}
      </label>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isPreset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addPreset(todo.text)}
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
