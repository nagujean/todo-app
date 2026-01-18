'use client'

import { useState } from 'react'
import { useTodoStore, type Todo, type Priority } from '@/store/todoStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days: (number | null)[] = []

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return days
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getTodosForDate(todos: Todo[], dateStr: string): Todo[] {
  return todos.filter((todo) => {
    if (!todo.startDate && !todo.endDate) return false

    const date = new Date(dateStr)
    const startDate = todo.startDate ? new Date(todo.startDate) : null
    const endDate = todo.endDate ? new Date(todo.endDate) : null

    // If only start date, show on that date
    if (startDate && !endDate) {
      return todo.startDate === dateStr
    }

    // If only end date, show on that date
    if (!startDate && endDate) {
      return todo.endDate === dateStr
    }

    // If both dates, show on range
    if (startDate && endDate) {
      return date >= startDate && date <= endDate
    }

    return false
  })
}

interface CalendarDayProps {
  day: number | null
  dateStr: string
  todos: Todo[]
  isToday: boolean
  hideCompleted: boolean
}

function CalendarDay({ day, dateStr, todos, isToday, hideCompleted }: CalendarDayProps) {
  const filteredTodos = hideCompleted ? todos.filter((t) => !t.completed) : todos
  const displayTodos = filteredTodos.slice(0, 3)
  const remainingCount = filteredTodos.length - 3

  if (day === null) {
    return <div className="h-24 bg-muted/30" />
  }

  return (
    <div
      className={`h-24 border-t p-1 overflow-hidden ${
        isToday ? 'bg-primary/5' : ''
      }`}
    >
      <div
        className={`text-xs font-medium mb-1 ${
          isToday
            ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center'
            : 'text-muted-foreground'
        }`}
      >
        {day}
      </div>
      <div className="space-y-0.5">
        {displayTodos.map((todo) => (
          <div
            key={todo.id}
            className={`text-xs px-1 py-0.5 rounded truncate ${
              todo.completed
                ? 'bg-muted text-muted-foreground line-through'
                : todo.priority
                  ? `${priorityColors[todo.priority]} text-white`
                  : 'bg-primary/20 text-primary'
            }`}
            title={todo.title}
          >
            {todo.title}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground px-1">
            +{remainingCount}개 더
          </div>
        )}
      </div>
    </div>
  )
}

export function CalendarView() {
  const { todos, hideCompleted } = useTodoStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = getMonthDays(year, month)

  const today = new Date()
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate())

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Count todos with dates
  const todosWithDates = todos.filter((t) => t.startDate || t.endDate)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            오늘
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {year}년 {MONTHS[month]}
        </h2>
        <div className="text-sm text-muted-foreground">
          {todosWithDates.length}개의 일정
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateStr = day ? formatDateString(year, month, day) : ''
            const dayTodos = day ? getTodosForDate(todos, dateStr) : []
            const isToday = dateStr === todayStr

            return (
              <CalendarDay
                key={index}
                day={day}
                dateStr={dateStr}
                todos={dayTodos}
                isToday={isToday}
                hideCompleted={hideCompleted}
              />
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>높음</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>중간</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>낮음</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/20" />
          <span>기본</span>
        </div>
      </div>
    </div>
  )
}
