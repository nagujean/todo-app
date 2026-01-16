'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Todo } from '@/store/todoStore'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
      >
        삭제
      </Button>
    </div>
  )
}
