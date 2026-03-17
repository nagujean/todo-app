"use client";

// Slash Command Menu 컴포넌트
// "/" 키를 입력했을 때 표시되는 명령어 메뉴입니다.

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import type { Editor } from "@tiptap/react";
import { filterCommands, type SlashCommandItemType } from "./utils/slashCommands";
import { createPortal } from "react-dom";

interface SlashCommandMenuProps {
  /** 에디터 인스턴스 */
  editor: Editor | null;
}

// @MX:NOTE: SSR hydration 오류 방지 - 클라이언트에서만 Portal 렌더링
// useSyncExternalStore를 사용하여 React 19 권장 패턴 준수
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * SlashCommandMenu 컴포넌트
 * "/" 키 입력 시 블록 타입 선택 메뉴를 표시합니다.
 */
export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  // @MX:NOTE: SSR hydration 오류 방지 - 최상위에서 호출
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // 필터링된 명령어 목록
  const filteredCommands = filterCommands(query);

  // 에디터에서 "/" 입력 감지
  // keydown 이벤트는 문자 입력 전에 발생하므로,
  // 커서가 줄 시작이나 공백 뒤에 있을 때 "/" 입력을 감지합니다.
  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // "/" 키 감지 (Shift 키와 함께 눌린 경우 제외)
      if (event.key === "/" && !event.shiftKey) {
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 100), from);

        // 줄 시작이거나 공백 뒤에서 "/" 입력 시 메뉴 표시 (Notion 스타일)
        const shouldOpenMenu = textBefore === "" || /\s$/.test(textBefore);

        if (shouldOpenMenu) {
          const { view } = editor;
          const coords = view.coordsAtPos(from);
          const scrollX = window.scrollX;
          const scrollY = window.scrollY;

          setCoords({
            x: coords.left + scrollX,
            y: coords.bottom + scrollY,
          });
          setIsOpen(true);
          setQuery("");
          setSelectedIndex(0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 키보드 네비게이션 (document 레벨 이벤트 리스너)
  useEffect(() => {
    if (!isOpen || !editor) return;

    const handleNavigationKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            insertCommand(filteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleNavigationKeyDown);
    return () => {
      document.removeEventListener("keydown", handleNavigationKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedIndex, filteredCommands, editor]);

  // 명령어 삽입
  const insertCommand = useCallback(
    (command: SlashCommandItemType) => {
      if (!editor) return;

      // "/" 제거
      editor.view.dispatch(
        editor.state.tr.delete(editor.state.selection.from - 1, editor.state.selection.from)
      );

      // 명령어 실행 (editor를 전달하여 chain 명령어 사용)
      command.action(editor);

      setIsOpen(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [editor]
  );

  // 쿼리 업데이트 (에디터의 텍스트 변경 감지)
  useEffect(() => {
    if (!editor || !isOpen) return;

    const handleUpdate = () => {
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 100), from);

      // "/" 다음의 텍스트를 쿼리로 사용
      const match = textBefore.match(/\/([^/]*)$/);
      if (match) {
        setQuery(match[1]);
      } else {
        setIsOpen(false);
      }
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, isOpen]);

  // @MX:NOTE: SSR hydration 오류 방지 - 클라이언트에서만 렌더링
  if (!isOpen || !editor || !isClient) {
    return null;
  }

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-popover text-popover-foreground rounded-md border shadow-lg max-h-[300px] overflow-auto"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }}
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
  );

  // Portal을 사용하여 메뉴 렌더링 (클라이언트에서만)
  return createPortal(menuContent, document.body);
}

interface CommandItemProps {
  command: SlashCommandItemType;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

/**
 * CommandItem 컴포넌트
 * 개별 명령어 아이템입니다.
 */
function CommandItem({ command, isSelected, onClick, onMouseEnter }: CommandItemProps) {
  return (
    <li
      className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm transition-colors ${
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"
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
  );
}
