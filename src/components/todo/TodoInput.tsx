'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTodoStore } from '@/store/todoStore'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function TodoInput() {
  const [text, setText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDates, setShowDates] = useState(false)
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      addTodo({
        text: text.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setText('')
      setStartDate('')
      setEndDate('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하세요..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowDates(!showDates)}
          title={showDates ? '날짜 숨기기' : '날짜 설정'}
        >
          {showDates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button type="submit" disabled={!text.trim()}>
          추가
        </Button>
      </div>
      {showDates && (
        <div className="flex gap-2 text-sm">
          <div className="flex-1">
            <label className="text-muted-foreground text-xs mb-1 block">시작일</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="text-muted-foreground text-xs mb-1 block">종료일</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full"
            />
          </div>
        </div>
      )}
    </form>
  )
}
