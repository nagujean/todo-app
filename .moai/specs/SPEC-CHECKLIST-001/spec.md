# SPEC-CHECKLIST-001: Todo Checklist Rich Text Editor

## 메타데이터

| 항목          | 값                                          |
| ------------- | ------------------------------------------- |
| **SPEC ID**   | SPEC-CHECKLIST-001                          |
| **제목**      | Todo Checklist Rich Text Editor with Tiptap |
| **생성일**    | 2026-03-16                                  |
| **상태**      | Completed                                   |
| **우선순위**  | High                                        |
| **담당자**    | expert-frontend                             |
| **부모 SPEC** | None                                        |
| **태그**      | ui, editor, checklist, tiptap, rich-text    |

---

## 문제 분석 (Problem Analysis)

### 현재 상황

Todo App의 `TodoDetail` 컴포넌트는 `description` 필드를 일반 텍스트(`Textarea`)로만 처리한다. 사용자는 할 일의 상세 내용에 체크리스트, 글머리 기호, 번호 매기기 등의 서식을 추가할 수 없다.

### 사용자 요청

"할일 하위 상세 내용 항목에 체크리스트 기능을 만들고 싶다. 노션 처럼 `/`을 입력하면 체크 박스 등 기타 기능을 추가할 수 있도록 하는 것."

### 근본 원인 (Root Cause)

1. **표면 문제**: 상세 내용 입력 필드가 단순 텍스트만 지원
2. **직접 원인**: `Textarea` 컴포넌트 사용으로 리치 텍스트 기능 부재
3. **시스템 원인**: Todo 데이터 모델에 구조화된 콘텐츠 저장 메커니즘 미구현
4. **근본 원인**: 노션 스타일 블록 에디터 아키텍처가 필요하나 현재 미도입

### 가정 (Assumptions)

| 가정                              | 신뢰도 | 검증 방법                                   |
| --------------------------------- | ------ | ------------------------------------------- |
| 사용자가 `/` 키로 메뉴 접근 선호  | High   | Notion, Slack 등 업계 표준 패턴             |
| Tiptap이 프로젝트 요구사항 충족   | High   | 오픈소스, React 지원, 확장성 입증           |
| Firestore JSON 저장 용량 충분     | High   | 문서당 1MB 제한, 리치 텍스트는 평균 10-50KB |
| 기존 description 데이터 호환 가능 | High   | 마이그레이션 전략 수립                      |

---

## 요구사항 (Requirements) - EARS Format

### EARS Pattern 1: Ubiquitous (시스템 전체 항상 적용)

**REQ-001: 리치 텍스트 에디터 렌더링**

시스템은 **항상** TodoDetail 컴포넌트에서 Tiptap 기반 리치 텍스트 에디터를 렌더링해야 한다.

```
The system shall render a Tiptap-based rich text editor in the TodoDetail component.
```

**수용 기준:**

- [ ] TodoDetail 다이얼로그가 Tiptap 에디터를 포함한다
- [ ] 에디터가 100ms 이내에 로드된다
- [ ] 기존 description 텍스트가 paragraph 블록으로 표시된다

---

**REQ-002: 다크 모드 지원**

시스템은 **항상** 프로젝트의 기존 테마 시스템과 호환되는 다크 모드를 지원해야 한다.

```
The system shall support dark mode compatible with the existing theme system.
```

**수용 기준:**

- [ ] 라이트 모드에서 에디터 스타일이 올바르게 표시된다
- [ ] 다크 모드에서 에디터 스타일이 올바르게 표시된다
- [ ] 테마 전환 시 스타일이 즉시 반영된다

---

### EARS Pattern 2: Event-Driven (이벤트 기반)

**REQ-003: 슬래시 명령 메뉴**

**WHEN** 사용자가 `/` 키를 입력하면, **THEN** 시스템은 블록 타입 선택 메뉴를 표시해야 한다.

```
WHEN the user types "/" key, THEN the system shall display a block type selection menu.
```

**수용 기준:**

- [ ] `/` 입력 시 팝업 메뉴가 나타난다
- [ ] 메뉴는 에디터 내 커서 위치 근처에 표시된다
- [ ] ESC 키로 메뉴를 닫을 수 있다
- [ ] 메뉴 외부 클릭 시 메뉴가 닫힌다

---

**REQ-004: 블록 타입 삽입**

**WHEN** 사용자가 메뉴에서 블록 타입을 선택하면, **THEN** 시스템은 해당 블록을 현재 커서 위치에 삽입해야 한다.

```
WHEN the user selects a block type from the menu, THEN the system shall insert the block at the current cursor position.
```

**수용 기준:**

- [ ] Task List 선택 시 체크박스 블록이 삽입된다
- [ ] Bullet List 선택 시 글머리 기호 블록이 삽입된다
- [ ] Ordered List 선택 시 번호 매기기 블록이 삽입된다
- [ ] Heading 1/2 선택 시 제목 블록이 삽입된다
- [ ] Horizontal Rule 선택 시 구분선이 삽입된다

---

**REQ-005: 체크리스트 토글**

**WHEN** 사용자가 체크박스를 클릭하면, **THEN** 시스템은 체크 상태를 토글하고 시각적으로 반영해야 한다.

```
WHEN the user clicks a checkbox, THEN the system shall toggle the checked state and reflect it visually.
```

**수용 기준:**

- [ ] 체크박스 클릭 시 체크/언체크 상태가 전환된다
- [ ] 체크된 항목은 취소선 스타일이 적용된다
- [ ] 상태 변경이 즉시 Firestore에 저장된다

---

### EARS Pattern 3: State-Driven (상태 기반)

**REQ-006: 콘텐츠 저장**

**IF** 사용자가 콘텐츠를 수정하면, **THEN** 시스템은 JSON 형식으로 Firestore에 저장해야 한다.

```
IF the user modifies the content, THEN the system shall save it to Firestore in JSON format.
```

**수용 기준:**

- [ ] 에디터 콘텐츠가 JSONContent 형식으로 저장된다
- [ ] 저장 시 기존 `description` 필드 대신 `content` 필드를 사용한다
- [ ] 자동 저장은 저장 버튼 클릭 시에만 수행된다

---

**REQ-007: 기존 데이터 호환성**

**IF** Todo에 `content` 필드가 없고 `description`만 존재하면, **THEN** 시스템은 description을 paragraph 블록으로 변환하여 표시해야 한다.

```
IF a Todo has no content field but only description, THEN the system shall convert description to a paragraph block for display.
```

**수용 기준:**

- [ ] `content`가 null인 경우 `description` 텍스트를 표시한다
- [ ] 기존 데이터 손실 없이 에디터에 표시된다
- [ ] 저장 시 `content` 필드가 생성된다

---

### EARS Pattern 4: Unwanted Behavior (금지 사항)

**REQ-008: 번들 사이즈 제한**

시스템은 **반드시** 총 번들 사이즈 증가를 60KB(gzip) 이내로 유지해야 한다.

```
The system shall not exceed 60KB gzip bundle size increase.
```

**수용 기준:**

- [ ] Tiptap 코어 및 확장 프로그램 총 크기 < 60KB gzip
- [ ] 동적 import를 통해 초기 로딩 최적화
- [ ] 불필요한 확장 프로그램 제외

---

**REQ-009: 보안 제약**

시스템은 **반드시** XSS 공격을 방지하기 위해 사용자 입력을 적절히 sanitize해야 한다.

```
The system shall sanitize user input to prevent XSS attacks.
```

**수용 기준:**

- [ ] HTML 태그 직접 입력 허용 안 함
- [ ] 스크립트 태그 자동 제거
- [ ] 허용된 블록 타입만 렌더링

---

### EARS Pattern 5: Optional (선택 사항)

**REQ-010: 키보드 단축키**

**Where possible**, 시스템은 키보드 단축키를 제공해야 한다.

```
Where possible, the system shall provide keyboard shortcuts.
```

| 단축키             | 동작   |
| ------------------ | ------ |
| `Ctrl/Cmd + B`     | 굵게   |
| `Ctrl/Cmd + I`     | 기울임 |
| `Ctrl/Cmd + Enter` | 저장   |
| `Esc`              | 취소   |

**수용 기준:**

- [ ] 단축키가 macOS/Windows에서 정상 작동한다
- [ ] 단축키 충돌이 없다

---

## 제약사항 (Constraints)

### 기술적 제약

| 제약           | 설명                | 영향                       |
| -------------- | ------------------- | -------------------------- |
| TypeScript 5.x | strict mode 준수    | 모든 타입 명시 필요        |
| React 19.2.3   | 최신 React API 활용 | Server Components 고려     |
| Next.js 16.1.2 | App Router 사용     | 클라이언트 컴포넌트로 구현 |
| Firestore      | 문서당 1MB 제한     | 대용량 콘텐츠 제한         |
| 번들 사이즈    | +60KB gzip 이하     | 확장 프로그램 선별         |

### 비즈니스 제약

| 제약                | 설명                    | 영향                      |
| ------------------- | ----------------------- | ------------------------- |
| 개인/팀 모드 호환   | 동일 에디터 사용        | 팀 할 일에도 동일 기능    |
| 모바일 반응형       | 기존 디자인 시스템 준수 | 터치 UI 최적화            |
| 85% 테스트 커버리지 | TRUST 5 프레임워크      | 단위/통합/E2E 테스트 필요 |

---

## 의존성 (Dependencies)

### 내부 의존성

- `src/store/todoStore.ts`: Todo 모델 수정 필요
- `src/components/todo/TodoDetail.tsx`: 에디터 교체 대상
- `src/components/ui/`: 기존 UI 컴포넌트 활용

### 외부 의존성 (Tiptap Extensions)

| 패키지                                | 용도            | 예상 크기 (gzip) |
| ------------------------------------- | --------------- | ---------------- |
| `@tiptap/react`                       | React 바인딩    | ~10KB            |
| `@tiptap/starter-kit`                 | 기본 확장 모음  | ~15KB            |
| `@tiptap/extension-task-list`         | 체크리스트      | ~3KB             |
| `@tiptap/extension-task-item`         | 체크리스트 항목 | ~2KB             |
| `@tiptap/extension-placeholder`       | 플레이스홀더    | ~1KB             |
| `tiptap-extension-global-drag-handle` | 드래그 핸들     | ~2KB             |
| **총 예상 크기**                      |                 | **~33KB**        |

---

## 데이터 모델 변경

### 기존 Todo 인터페이스

```typescript
export interface Todo {
  id: string;
  title: string;
  description?: string; // 일반 텍스트 (deprecated)
  completed: boolean;
  // ... 기타 필드
}
```

### 변경 후 Todo 인터페이스

```typescript
import type { JSONContent } from "@tiptap/react";

export interface Todo {
  id: string;
  title: string;
  description?: string; // 하위 호환성 유지 (읽기 전용)
  content?: JSONContent; // 새로운 리치 텍스트 콘텐츠
  completed: boolean;
  // ... 기타 필드
}
```

### Firestore 문서 구조

```json
{
  "title": "프로젝트 계획 작성",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "상세 내용입니다." }]
      },
      {
        "type": "taskList",
        "content": [
          {
            "type": "taskItem",
            "attrs": { "checked": false },
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "체크리스트 항목" }] }
            ]
          }
        ]
      }
    ]
  },
  "description": null,
  "completed": false,
  "createdAt": "2026-03-16T00:00:00.000Z",
  "updatedAt": "2026-03-16T00:00:00.000Z"
}
```

---

## 성공 지표 (Success Metrics)

### 기능적 지표

| 지표                    | 목표    | 측정 방법            |
| ----------------------- | ------- | -------------------- |
| 슬래시 명령어 응답 시간 | < 100ms | Performance API      |
| 에디터 초기 로딩 시간   | < 100ms | Lighthouse           |
| 저장 소요 시간          | < 500ms | Firestore write time |
| 체크리스트 토글 반응    | < 50ms  | Event timing         |

### 품질 지표

| 지표                 | 목표               | 측정 방법                |
| -------------------- | ------------------ | ------------------------ |
| 단위 테스트 커버리지 | 85%+               | Vitest coverage          |
| E2E 테스트 커버리지  | 주요 시나리오 100% | Playwright               |
| 번들 사이즈 증가     | < 60KB gzip        | Next.js bundle analyzer  |
| 접근성 점수          | 100/100            | Lighthouse Accessibility |

---

## 위험 요소 및 완화 전략

| 위험                     | 확률   | 영향   | 완화 전략                            |
| ------------------------ | ------ | ------ | ------------------------------------ |
| Tiptap 학습 곡선         | Medium | Medium | 공식 문서 참조, 샘플 코드 작성       |
| 번들 사이즈 초과         | Low    | High   | Tree-shaking, 동적 import            |
| 기존 데이터 호환성 이슈  | Medium | High   | 마이그레이션 스크립트, fallback 로직 |
| 모바일 UX 저하           | Medium | High   | 반응형 테스트, 터치 최적화           |
| Firestore 저장 용량 초과 | Low    | Medium | 콘텐츠 크기 제한 (10KB 권장)         |

---

## 참조 (References)

### 기술 문서

- [Tiptap 공식 문서](https://tiptap.dev/)
- [Tiptap React 가이드](https://tiptap.dev/installation/react)
- [Tiptap Task List 확장](https://tiptap.dev/extensions/nodes/tasklist)
- [Tiptap Slash Command](https://tiptap.dev/examples/slash-commands)

### 관련 SPEC

- SPEC-UI-001: 팀 목록 토글 높이 확장
- SPEC-MOBILE-001: Mobile UI Responsive Design
- SPEC-TEST-001: 테스트 커버리지 개선

### 업계 표준

- Notion Block Editor: 사용자 경험 벤치마크
- GitHub Markdown Editor: 툴바 디자인 참조
- Confluence Editor: 단축키 패턴

---

## 승인 이력

| 버전 | 날짜       | 작성자       | 상태  | 비고      |
| ---- | ---------- | ------------ | ----- | --------- |
| 1.0  | 2026-03-16 | manager-spec | Draft | 초기 작성 |

---

TAG: SPEC-CHECKLIST-001
