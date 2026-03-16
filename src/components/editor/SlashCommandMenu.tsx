'use client'

// Slash Command Menu 컴포넌트
// "/" 키를 입력했을 때 표시되는 명령어 메뉴입니다.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { filterCommands, type SlashCommandItemType } from './utils/slashCommands'
import { createPortal } from 'react-dom'

interface SlashCommandMenuProps {
  /** 에디터 인스턴스 */
  editor: Editor | null
}

/**
 * SlashCommandMenu 컴포넌트
 * "/" 키 입력 시 블록 타입 선택 메뉴를 표시합니다.
 */
export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  // 필터링된 명령어 목록
  const filteredCommands = filterCommands(query)

  // 에디터에서 "/" 입력 감지
  useEffect(() => {
    if (!editor) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // "/" 키 감지 (Shift 키와 함께 눌린 경우 제외)
      if (event.key === '/' && !event.shiftKey) {
        const { from } = editor.state.selection
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 100), from)

        // 이미 "/"가 입력된 상태인지 확인
        if (textBefore.endsWith('/')) {
          const { view } = editor
          const coords = view.coordsAtPos(from)
          const scrollX = window.scrollX
          const scrollY = window.scrollY

          setCoords({
            x: coords.left + scrollX,
            y: coords.bottom + scrollY,
          })
          setIsOpen(true)
          setQuery('')
          setSelectedIndex(0)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
          break
        case 'Enter':
          event.preventDefault()
          if (filteredCommands[selectedIndex]) {
            insertCommand(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          break
      }
    },
    [isOpen, selectedIndex, filteredCommands]
  )

  // 명령어 삽입
  const insertCommand = useCallback(
    (command: SlashCommandItemType) => {
      if (!editor) return

      // "/" 제거
      editor.view.dispatch(
        editor.state.tr.delete(
          editor.state.selection.from - 1,
          editor.state.selection.from
        )
      )

      // 명령어 실행
      const content = command.action()
      editor.chain().focus().insertContent(content).run()

      setIsOpen(false)
      setQuery('')
      setSelectedIndex(0)
    },
    [editor]
  )

  // 쿼리 업데이트 (에디터의 텍스트 변경 감지)
  useEffect(() => {
    if (!editor || !isOpen) return

    const handleUpdate = () => {
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 100), from)

      // "/" 다음의 텍스트를 쿼리로 사용
      const match = textBefore.match(/\/([^/]*)$/)
      if (match) {
        setQuery(match[1])
      } else {
        setIsOpen(false)
      }
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, isOpen])

  if (!isOpen || !editor) {
    return null
  }

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-popover text-popover-foreground rounded-md border shadow-lg max-h-[300px] overflow-auto"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }}
      onKeyDown={handleKeyDown}
    >
      {filteredCommands.length === 0 ? (
        <div className="p-3 text-sm text-muted-foreground">검색 결과가 없습니다</div>
      ) : (
        <ul className="py-1">
          {filteredCommands.map((command, index) => (
            <CommandItem
              key={command.id}
              command={command}
              isSelected={index === selectedIndex}
              onClick={() => insertCommand(command)}
              onMouseEnter={() => setSelectedIndex(index)}
            />
          ))}
        </ul>
      )}
    </div>
  )

  // Portal을 사용하여 메뉴 렌더링
  return createPortal(menuContent, document.body)
}

interface CommandItemProps {
  command: SlashCommandItemType
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

/**
 * CommandItem 컴포넌트
 * 개별 명령어 아이템입니다.
 */
function CommandItem({ command, isSelected, onClick, onMouseEnter }: CommandItemProps) {
  return (
    <li
      className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm transition-colors ${
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-foreground'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={isSelected}
    >
      <span className="text-lg" aria-hidden="true">
        {command.icon}
      </span>
      <div className="flex-1">
        <div className="font-medium">{command.label}</div>
        <div className="text-xs text-muted-foreground">{command.description}</div>
      </div>
    </li>
  )
}
