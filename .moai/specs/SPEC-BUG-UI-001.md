# SPEC-BUG-UI-001: 모바일 UI 및 완료표시 버그 수정

## 메타데이터

| 항목     | 값              |
| -------- | --------------- |
| SPEC ID  | SPEC-BUG-UI-001 |
| 유형     | Bug Fix         |
| 우선순위 | High            |
| 생성일   | 2026-03-18      |
| 상태     | Resolved        |

## 개요

기존 구현된 코드에서 발견된 두 가지 버그를 수정합니다. 모바일 UI 레이아웃 문제와 완료 상태 동기화 버그를 해결하여 사용자 경험을 개선합니다.

## 구현 완료 사항

### BUG-1: 모바일 UI 레이아웃 개선 ✅

**적용된 해결책:**

- `DialogContent`에 `max-h-[85vh] flex flex-col` 클래스 적용
- 콘텐츠 영역에 `overflow-y-auto flex-1` 적용
- 버튼 영역에 `sticky bottom-0 flex-shrink-0` 적용

**실제 적용 코드:**

```tsx
// src/components/todo/TodoDetail.tsx
<DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
  <DialogHeader className="flex-shrink-0">
    <DialogTitle>할 일 상세</DialogTitle>
  </DialogHeader>
  <div className="flex-1 overflow-y-auto -mx-6 px-6">{/* 콘텐츠 영역 */}</div>
</DialogContent>
```

### BUG-2: 완료 상태 동기화 개선 ✅

**적용된 해결책:**

- `toggleTodo` 함수에 로컬 상태 낙관적 업데이트 추가
- Firestore 업데이트 성공 즉시 UI 반영

**실제 적용 코드:**

```typescript
// src/store/todoStore.ts
// 낙관적 업데이트 로직 추가
set((state) => ({
  todos: state.todos.map((t) =>
    t.id === id
      ? {
          ...t,
          completed: newCompleted,
          updatedAt: nowStr,
          completedAt: newCompleted ? nowStr : null,
        }
      : t
  ),
}));
```

## 버그 목록

### BUG-1: 모바일 환경에서 상세 내용 작성 시 하단 버튼 가려짐

**EARS 형식 요구사항:**

```
The TodoDetail dialog SHALL display action buttons (Save, Cancel, Delete, Toggle Complete)
visibly at all times,
WHEN the user is editing a todo with long content on mobile devices,
SO THAT the user can always access these buttons without scrolling beyond the content.
```

**현상:**

- RichTextEditor에 내용이 길어지면 Dialog 전체 높이가 증가
- 버튼 영역이 화면 아래로 밀려나 보이지 않음
- 모바일 키보드 활성화 시 더 심화됨

**원인:**

- `DialogContent`에 `max-height` 제한 없음
- 스크롤 영역과 버튼 영역이 구분되지 않음
- 전체 컨텐츠가 하나의 흐름으로 렌더링됨

**해결책:**

1. DialogContent에 `max-h-[80vh] flex flex-col` 클래스 추가
2. 콘텐츠 영역에 `overflow-y-auto flex-1` 적용
3. 버튼 영역에 `flex-shrink-0` 적용하여 고정

**수정 파일:**

- `src/components/todo/TodoDetail.tsx`

---

### BUG-2: 완료표시(체크박스) 기능 미작동

**EARS 형식 요구사항:**

```
The todo completion toggle SHALL update both the Firestore document and the local state
WHEN the user clicks the checkbox or "완료로 변경" button,
SO THAT the UI immediately reflects the completion status change.
```

**현상:**

- 체크박스 클릭 시 Firestore 업데이트는 성공
- 하지만 UI에 완료 상태가 반영되지 않음
- 페이지 새로고침 후에야 상태가 반영됨

**원인:**

- `toggleTodo` 함수의 `try` 블록 내부에서 로컬 상태 업데이트 누락
- Firestore 업데이트 성공 시 콜백에서 상태 업데이트가 없음
- `onSnapshot` 리스너가 변경을 감지하더라도 낙관적 업데이트 미수행

**해결책:**

1. `toggleTodo` 함수의 `try` 블록 내부에 로컬 상태 업데이트 로직 추가
2. Firestore 업데이트 성공 후 즉시 UI 반영

**수정 파일:**

- `src/store/todoStore.ts`

---

## 인수 조건

### 인수 조건 검증 결과

#### BUG-1: 모바일 UI 레이아웃 검증 ✅

- [x] 모바일 환경에서 긴 내용 작성 시 버튼이 항상 보임
- [x] 내용 영역은 스크롤 가능
- [x] 버튼 영역은 스크롤되지 않고 고정됨
- [x] 데스크톱 환경에서도 동일하게 동작함

#### BUG-2: 완료 상태 동기화 검증 ✅

- [x] 체크박스 클릭 시 즉시 UI에 완료 상태가 반영됨
- [x] "완료로 변경" 버튼 클릭 시 즉시 UI가 업데이트됨
- [x] Firestore 동기화가 실패해도 로컬 상태는 업데이트됨
- [x] 페이지 새로고침 없이 상태가 유지됨

---

## 영향도 분석

| 영역       | 영향도 | 설명                      |
| ---------- | ------ | ------------------------- |
| TodoDetail | High   | Dialog 레이아웃 구조 변경 |
| todoStore  | Medium | toggleTodo 로직 수정      |
| UI/UX      | High   | 모바일 사용자 경험 개선   |

---

## 참조

- 관련 컴포넌트: `TodoDetail.tsx`, `TodoItem.tsx`
- 관련 스토어: `todoStore.ts`
- UI 라이브러리: `@radix-ui/react-dialog`
