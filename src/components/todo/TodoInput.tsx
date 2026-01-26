'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Priority } from '@/store/todoStore'
import { ChevronDown, ChevronUp } from 'lucide-react'

const MAX_TITLE_LENGTH = 200 // REQ-DATA-005: Max 200 characters

const priorityOptions: { value: Priority | ''; label: string; color: string }[] = [
  { value: '', label: '없음', color: 'bg-gray-100 dark:bg-gray-800' },
  { value: 'high', label: '높음', color: 'bg-red-100 dark:bg-red-900/30' },
  { value: 'medium', label: '중간', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: '낮음', color: 'bg-blue-100 dark:bg-blue-900/30' },
]

export function TodoInput() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [showOptions, setShowOptions] = useState(false)
  const addTodo = useTodoStore((state) => state.addTodo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      addTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        priority: priority || undefined,
      })
      setTitle('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setPriority('')
    }
  }

  // Handle input with 200 character limit (REQ-DATA-005)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_TITLE_LENGTH) {
      setTitle(newValue)
    }
  }

  const characterCount = title.length
  const isNearLimit = characterCount > MAX_TITLE_LENGTH * 0.9 // Show warning at 90%

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="할 일을 입력하세요..."
            className="flex-1 pr-16"
            maxLength={MAX_TITLE_LENGTH}
          />
          {title.length > 0 && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                isNearLimit ? 'text-orange-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {characterCount}/{MAX_TITLE_LENGTH}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowOptions(!showOptions)}
          title={showOptions ? '옵션 숨기기' : '옵션 설정'}
          aria-label={showOptions ? '옵션 숨기기' : '옵션 설정'}
        >
          {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          추가
        </Button>
      </div>
      {showOptions && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-muted-foreground text-xs mb-1.5 block">상세 내용</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 입력하세요..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs mb-2 block">우선순위</label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                    priority === option.value
                      ? `${option.color} border-foreground/30 font-medium`
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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
        </div>
      )}
    </form>
  )
}
