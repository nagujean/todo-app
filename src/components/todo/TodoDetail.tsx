'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useTodoStore, type Todo, type Priority } from '@/store/todoStore'
import { Calendar, Clock } from 'lucide-react'

interface TodoDetailProps {
  todo: Todo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const priorityOptions: { value: Priority | ''; label: string; color: string }[] = [
  { value: '', label: '없음', color: 'bg-gray-100 dark:bg-gray-800' },
  { value: 'high', label: '높음', color: 'bg-red-100 dark:bg-red-900/30' },
  { value: 'medium', label: '중간', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: '낮음', color: 'bg-blue-100 dark:bg-blue-900/30' },
]

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Inner component that resets state when todo.id changes via key prop
function TodoDetailForm({ todo, onOpenChange }: { todo: Todo; onOpenChange: (open: boolean) => void }) {
  const { updateTodo, toggleTodo, deleteTodo } = useTodoStore()

  // Initialize state from todo prop - state resets when component remounts via key
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [startDate, setStartDate] = useState(todo.startDate || '')
  const [endDate, setEndDate] = useState(todo.endDate || '')
  const [priority, setPriority] = useState<Priority | ''>(todo.priority || '')

  const handleSave = () => {
    if (!title.trim()) return

    updateTodo({
      id: todo.id,
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      priority: priority || undefined,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteTodo(todo.id)
    onOpenChange(false)
  }

  const handleToggleComplete = () => {
    toggleTodo(todo.id)
  }

  return (
    <>
      <div className="space-y-4 py-2">
        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">제목</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일 제목"
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">상세 내용</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세 내용을 입력하세요..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">우선순위</label>
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

        {/* Dates */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">시작일</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">종료일</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>생성: {formatDateTime(todo.createdAt)}</span>
          </div>
          {todo.updatedAt !== todo.createdAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>수정: {formatDateTime(todo.updatedAt)}</span>
            </div>
          )}
          {todo.completedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>완료: {formatDateTime(todo.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleComplete}
          >
            {todo.completed ? '미완료로 변경' : '완료로 변경'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            저장
          </Button>
        </div>
      </div>
    </>
  )
}

export function TodoDetail({ todo, open, onOpenChange }: TodoDetailProps) {
  if (!todo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>할 일 상세</DialogTitle>
        </DialogHeader>
        {/* Use key prop to reset form state when todo changes */}
        <TodoDetailForm key={todo.id} todo={todo} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}
