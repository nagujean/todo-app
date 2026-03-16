# SPEC-CHECKLIST-001: Implementation Plan

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-CHECKLIST-001 |
| **버전** | 1.0 |
| **생성일** | 2026-03-16 |
| **상태** | Planned |
| **예상 파일 수** | 15-20개 |

---

## 구현 개요

### 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Tiptap React | 2.11.x | 리치 텍스트 에디터 프레임워크 |
| Tiptap Starter Kit | 2.11.x | 기본 확장 모음 |
| Tiptap Task List | 2.11.x | 체크리스트 확장 |
| Tiptap Placeholder | 2.11.x | 플레이스홀더 확장 |
| TypeScript | 5.x | 타입 정의 |
| React 19 | 19.2.3 | UI 라이브러리 |
| Zustand | 5.0.10 | 상태 관리 |
| Tailwind CSS | 4.x | 스타일링 |
| Vitest | 4.0.18 | 단위 테스트 |
| Playwright | 1.57.0 | E2E 테스트 |

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│  TodoDetail Component                                        │
│  ├── RichTextEditor (NEW)                                   │
│  │   ├── EditorProvider (Tiptap)                            │
│  │   ├── EditorContent                                      │
│  │   ├── SlashCommandMenu                                   │
│  │   └── EditorToolbar (Optional)                           │
│  └── TodoDetailForm                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Data Layer                                                  │
│  ├── todoStore.ts (Zustand)                                 │
│  │   └── content: JSONContent                               │
│  └── Firestore                                              │
│      └── users/{userId}/todos/{todoId}                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 마일스톤 (Milestones)

### Milestone 1: Foundation (필수)

**목표:** Tiptap 기본 에디터 통합 및 렌더링

**작업 항목:**
1. Tiptap 패키지 설치 및 설정
2. `RichTextEditor` 컴포넌트 생성
3. 기본 확장 프로그램 구성
4. `TodoDetail` 컴포넌트에 에디터 통합
5. 기본 스타일링 (라이트/다크 모드)

**산출물:**
- `src/components/editor/RichTextEditor.tsx`
- `src/components/editor/extensions.ts`
- `src/components/editor/styles.css`
- `src/types/tiptap.d.ts`

**완료 기준:**
- [ ] 에디터가 TodoDetail에 렌더링됨
- [ ] 기본 텍스트 입력 가능
- [ ] 다크 모드 지원

---

### Milestone 2: Slash Commands (필수)

**목표:** 노션 스타일 슬래시 명령 메뉴 구현

**작업 항목:**
1. `SlashCommandMenu` 컴포넌트 생성
2. `/` 키 입력 감지 및 메뉴 표시
3. 블록 타입 선택 기능
4. 키보드 네비게이션 (방향키, Enter)
5. 메뉴 필터링 기능

**지원 블록 타입:**

| 블록 | 확장 프로그램 | 설명 |
|------|--------------|------|
| Task List | TaskList, TaskItem | 체크리스트 (핵심) |
| Bullet List | BulletList, ListItem | 글머리 기호 |
| Ordered List | OrderedList, ListItem | 번호 매기기 |
| Heading 1/2 | Heading | 제목 |
| Horizontal Rule | HorizontalRule | 구분선 |

**산출물:**
- `src/components/editor/SlashCommandMenu.tsx`
- `src/components/editor/slashCommands.ts`
- `src/components/editor/CommandItem.tsx`

**완료 기준:**
- [ ] `/` 입력 시 메뉴 표시
- [ ] 키보드/마우스로 블록 선택 가능
- [ ] 선택한 블록이 에디터에 삽입됨

---

### Milestone 3: Data Persistence (필수)

**목표:** Firestore에 JSON 형식으로 콘텐츠 저장

**작업 항목:**
1. `Todo` 인터페이스에 `content` 필드 추가
2. `todoStore` 수정 (updateTodo 로직 변경)
3. Firestore 저장 로직 수정
4. 기존 `description` 데이터 마이그레이션 로직
5. 하위 호환성 처리

**데이터 모델:**
```typescript
interface Todo {
  id: string
  title: string
  description?: string  // deprecated, read-only
  content?: JSONContent // NEW: Tiptap JSON format
  // ... 기타 필드
}
```

**산출물:**
- `src/store/todoStore.ts` (수정)
- `src/lib/migration.ts` (신규)

**완료 기준:**
- [ ] 콘텐츠가 JSON 형식으로 Firestore에 저장됨
- [ ] 기존 description 데이터가 올바르게 표시됨
- [ ] 저장 후 페이지 새로고침 시 데이터 유지

---

### Milestone 4: Checklist Functionality (필수)

**목표:** 체크리스트 토글 및 상태 관리

**작업 항목:**
1. TaskItem 확장 프로그램 커스터마이징
2. 체크박스 클릭 핸들러
3. 체크된 항목 스타일링 (취소선)
4. 체크 상태 Firestore 동기화
5. 체크리스트 단축키 지원

**산출물:**
- `src/components/editor/extensions/TaskListExtension.ts`
- `src/components/editor/extensions/TaskItemExtension.ts`

**완료 기준:**
- [ ] 체크박스 클릭 시 상태 토글
- [ ] 체크된 항목에 취소선 표시
- [ ] 상태 변경이 즉시 저장됨

---

### Milestone 5: Testing (필수)

**목표:** 85% 테스트 커버리지 달성

**단위 테스트 (Vitest):**
- [ ] `RichTextEditor` 컴포넌트 테스트
- [ ] `SlashCommandMenu` 컴포넌트 테스트
- [ ] 데이터 변환 유틸리티 테스트
- [ ] `todoStore` 업데이트 로직 테스트

**통합 테스트:**
- [ ] 에디터 → 저장 → 로드 플로우 테스트
- [ ] 기존 데이터 마이그레이션 테스트

**E2E 테스트 (Playwright):**
- [ ] 슬래시 명령어 플로우
- [ ] 체크리스트 토글 플로우
- [ ] 콘텐츠 저장 및 복원 플로우

**산출물:**
- `src/components/editor/__tests__/RichTextEditor.test.tsx`
- `src/components/editor/__tests__/SlashCommandMenu.test.tsx`
- `e2e/checklist.spec.ts`

---

### Milestone 6: Optimization (선택)

**목표:** 성능 최적화 및 사용자 경험 개선

**작업 항목:**
1. 동적 import로 에디터 지연 로딩
2. 번들 사이즈 분석 및 최적화
3. 키보드 단축키 추가 (Ctrl+B, Ctrl+I)
4. 에디터 툴바 추가 (선택 사항)
5. 접근성 개선

**산출물:**
- `next.config.ts` 최적화 설정
- `src/components/editor/EditorToolbar.tsx` (선택)

**완료 기준:**
- [ ] 초기 로딩 시간 < 100ms
- [ ] 번들 사이즈 증가 < 60KB gzip
- [ ] Lighthouse 접근성 점수 100/100

---

## 파일 구조

```
src/
├── components/
│   ├── editor/
│   │   ├── RichTextEditor.tsx         # 메인 에디터 컴포넌트
│   │   ├── SlashCommandMenu.tsx       # 슬래시 명령 메뉴
│   │   ├── CommandItem.tsx            # 명령 항목 컴포넌트
│   │   ├── EditorToolbar.tsx          # 툴바 (선택 사항)
│   │   ├── extensions/
│   │   │   ├── index.ts               # 확장 프로그램 내보내기
│   │   │   ├── TaskListExtension.ts   # 커스텀 TaskList
│   │   │   └── TaskItemExtension.ts   # 커스텀 TaskItem
│   │   ├── hooks/
│   │   │   └── useEditor.ts           # 에디터 훅
│   │   ├── utils/
│   │   │   ├── contentConverter.ts    # 콘텐츠 변환 유틸
│   │   │   └── slashCommands.ts       # 슬래시 명령 정의
│   │   └── __tests__/
│   │       ├── RichTextEditor.test.tsx
│   │       └── SlashCommandMenu.test.tsx
│   └── todo/
│       └── TodoDetail.tsx             # 수정: RichTextEditor 사용
├── store/
│   └── todoStore.ts                   # 수정: content 필드 추가
├── lib/
│   └── migration.ts                   # 신규: 데이터 마이그레이션
├── types/
│   ├── tiptap.d.ts                    # 신규: Tiptap 타입 확장
│   └── todo.ts                        # 수정: content 필드 추가
└── styles/
    └── editor.css                     # 신규: 에디터 스타일

e2e/
└── checklist.spec.ts                  # 신규: 체크리스트 E2E 테스트
```

---

## 설치 패키지

### 프로덕션 의존성

```json
{
  "dependencies": {
    "@tiptap/react": "^2.11.0",
    "@tiptap/pm": "^2.11.0",
    "@tiptap/starter-kit": "^2.11.0",
    "@tiptap/extension-task-list": "^2.11.0",
    "@tiptap/extension-task-item": "^2.11.0",
    "@tiptap/extension-placeholder": "^2.11.0"
  }
}
```

### 개발 의존성

```json
{
  "devDependencies": {
    "@testing-library/user-event": "^14.6.1"
  }
}
```

---

## API 및 인터페이스 설계

### RichTextEditor Props

```typescript
interface RichTextEditorProps {
  content: JSONContent | null
  onChange: (content: JSONContent) => void
  placeholder?: string
  editable?: boolean
  className?: string
}
```

### SlashCommandMenu Props

```typescript
interface SlashCommandMenuProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
}
```

### Content Conversion Utilities

```typescript
// description 텍스트를 JSONContent로 변환
function textToContent(text: string): JSONContent

// JSONContent를 description 텍스트로 변환 (백업용)
function contentToText(content: JSONContent): string

// 두 콘텐츠가 동등한지 비교
function isContentEqual(a: JSONContent | null, b: JSONContent | null): boolean
```

---

## 테스트 전략

### 단위 테스트

**RichTextEditor:**
- 렌더링 테스트
- 콘텐츠 변경 핸들러 테스트
- 다크 모드 스타일 테스트
- 플레이스홀더 표시 테스트

**SlashCommandMenu:**
- 메뉴 열림/닫힘 테스트
- 키보드 네비게이션 테스트
- 블록 삽입 테스트
- 필터링 테스트

### 통합 테스트

- 에디터 입력 → onChange → 저장 플로우
- 기존 description → JSONContent 변환
- 체크리스트 상태 변경 → Firestore 동기화

### E2E 테스트

```typescript
// e2e/checklist.spec.ts
test('체크리스트 생성 및 토글', async ({ page }) => {
  // 1. Todo 생성
  // 2. 상세 다이얼로그 열기
  // 3. "/" 입력 → 슬래시 메뉴 열림
  // 4. "Task List" 선택 → 체크리스트 삽입
  // 5. 체크박스 클릭 → 체크 상태 변경
  // 6. 저장 → 새로고침 후 상태 유지 확인
})
```

---

## 성능 최적화 전략

### 동적 import

```typescript
// TodoDetail.tsx
const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false
  }
)
```

### Tree Shaking

```typescript
// extensions/index.ts
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'

export const extensions = [
  Document,
  Paragraph,
  Text,
  TaskList,
  TaskItem,
  BulletList,
  OrderedList,
  Heading.configure({ levels: [1, 2] }),
  HorizontalRule,
]
```

### 번들 사이즈 모니터링

```bash
# 분석 명령어
ANALYZE=true npm run build
```

---

## 위험 완화 계획

### Risk 1: 번들 사이즈 초과

**완화 전략:**
1. 필수 확장 프로그램만 포함
2. 동적 import로 지연 로딩
3. 코드 스플리팅

**대안:**
- 더 가벼운 에디터 라이브러리 고려 (lexical, prosemirror 직접 사용)

### Risk 2: 기존 데이터 호환성

**완화 전략:**
1. `description` 필드를 읽기 전용으로 유지
2. `content`가 없을 때만 `description` 표시
3. 저장 시 `content` 필드만 업데이트

**마이그레이션 스크립트:**
```typescript
// Firebase Cloud Function 또는 클라이언트 사이드
async function migrateTodos(userId: string) {
  const todos = await getTodos(userId)
  for (const todo of todos) {
    if (!todo.content && todo.description) {
      const content = textToContent(todo.description)
      await updateTodo(todo.id, { content })
    }
  }
}
```

### Risk 3: 모바일 UX

**완화 전략:**
1. 터치 영역 최소 44x44px 확보
2. 슬래시 메뉴 위치 자동 조정
3. 가상 키보드 대응

---

## 롤백 계획

### Feature Flag

```typescript
// src/lib/features.ts
export const FEATURES = {
  RICH_TEXT_EDITOR: process.env.NEXT_PUBLIC_RICH_TEXT_EDITOR === 'true'
}
```

### 비활성화 방법

1. 환경 변수 `NEXT_PUBLIC_RICH_TEXT_EDITOR=false` 설정
2. `TodoDetail`에서 기존 `Textarea` 렌더링
3. `content` 필드 무시, `description` 필드 사용

---

## 완료 정의 (Definition of Done)

### 필수 완료 항목

- [ ] 모든 Milestone 1-5 작업 완료
- [ ] 단위 테스트 커버리지 85% 이상
- [ ] E2E 테스트 주요 시나리오 100% 통과
- [ ] 번들 사이즈 증가 60KB gzip 이하
- [ ] Lighthouse 성능 점수 90점 이상
- [ ] 접근성 점수 100점
- [ ] 다크 모드 정상 동작
- [ ] 모바일 반응형 테스트 통과
- [ ] 기존 데이터 호환성 검증
- [ ] 코드 리뷰 승인

### 품질 게이트

| 게이트 | 기준 | 검증 도구 |
|--------|------|----------|
| TypeScript | strict mode 0 errors | tsc --noEmit |
| ESLint | 0 warnings, 0 errors | next lint |
| 테스트 | 85%+ coverage | npm run test:coverage |
| E2E | 100% pass | npm run test |
| 번들 | < 60KB increase | next build |

---

## 다음 단계

1. **구현 시작**: `/moai:2-run SPEC-CHECKLIST-001`
2. **expert-frontend 에이전트**에게 UI 구현 위임
3. **expert-testing 에이전트**에게 테스트 작성 위임
4. **완료 후**: `/moai:3-sync SPEC-CHECKLIST-001` 문서화

---

TAG: SPEC-CHECKLIST-001
