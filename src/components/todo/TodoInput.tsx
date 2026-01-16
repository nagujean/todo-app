'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTodoStore } from '@/store/todoStore'

export function TodoInput() {
  const [text, setText] = useState('')
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      addTodo(text.trim())
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 입력하세요..."
        className="flex-1"
      />
      <Button type="submit" disabled={!text.trim()}>
        추가
      </Button>
    </form>
  )
}
