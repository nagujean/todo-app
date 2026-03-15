---
id: SPEC-TEST-002
title: React Component Test Coverage
version: "1.1.0"
status: "completed"
created: "2026-01-29"
updated: "2026-01-29"
author: "Todo App Team"
priority: "high"
related:
  - SPEC-TEST-001
lifecycle: spec-first
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-29 | Todo App Team | Initial specification |
| 1.1.0 | 2026-01-29 | Todo App Team | Applied multi-perspective review fixes |

---

## Environment

- **Framework**: Next.js 16.1.2 + React 19.2.3 + TypeScript 5.x
- **Test Stack**: Vitest 4.0.18, @testing-library/react 16.3.2, Playwright 1.57.0
- **State Management**: Zustand 5.0.10
- **UI Libraries**: Tailwind CSS 4.x, Radix UI
- **Backend**: Firebase 12.8.0
- **Current Coverage**: 66.62% (stores tested, components at 0%)
- **Target Coverage**: 80%+ (realistic range: 75-80% depending on vitest config)
- **CRITICAL Prerequisite**: `vitest.config.ts`의 coverage exclude 목록에서 `src/components/**/*` 및 `src/app/**/*` 패턴을 반드시 제거해야 합니다. 이 패턴이 남아있으면 component test coverage가 리포트에 반영되지 않습니다.

---

## Assumptions

1. Store layer는 완전히 테스트됨 (SPEC-TEST-001 완료) 및 안정적으로 mock 가능
2. @testing-library/react 16.3.2는 React 19를 지원하나, concurrent features (useTransition, Suspense boundary 등)에 대한 지원은 제한적임. Phase 0에서 호환성 검증 필요
3. Firebase services는 module level에서 mock됨 (unit test에서 live connection 없음)
4. Radix UI primitives는 표준 RTL utilities로 테스트 가능하나, portal rendering 시 `screen.getByRole()` 사용 필요
5. Server Components는 unit test가 아닌 E2E 테스트를 통해서만 검증. async server function은 unit test 대상이 아님
6. `vitest.config.ts` coverage exclude 설정이 Phase 0에서 수정된 상태

---

## Requirements

### REQ-01: Ubiquitous - Test Infrastructure

Test infrastructure는 **항상** 모든 component test를 위한 재사용 가능한 render utility (ThemeProvider, AuthProvider, Zustand stores 포함)를 제공해야 한다.

### REQ-02: Event-Driven - UI Primitive Interaction

**WHEN** 사용자가 UI primitive (button, input, checkbox, dialog)와 상호작용하면 **THEN** component test는 올바른 DOM 상태 변경과 callback 호출을 검증해야 한다.

### REQ-03: Event-Driven - Todo CRUD Operations

**WHEN** 사용자가 UI를 통해 todo item을 생성, 수정, 토글, 삭제하면 **THEN** component test는 올바른 store action이 예상 인자와 함께 호출됨을 검증해야 한다.

### REQ-04: State-Driven - Authentication UI

**IF** 사용자가 미인증 상태이면 **THEN** LoginForm과 SignupForm이 올바르게 렌더링되고 form submission을 처리해야 한다. **IF** 사용자가 인증 상태이면 **THEN** UserMenu가 사용자 정보와 logout 기능을 표시해야 한다.

### REQ-05: State-Driven - Team Components

**IF** teams이 존재하면 **THEN** TeamSwitcher가 team 목록을 표시하고 전환을 허용해야 한다. **IF** team이 선택된 상태이면 **THEN** InviteDialog와 TeamMembers가 올바른 team 데이터를 렌더링해야 한다.

### REQ-06: Unwanted - No Unhandled Errors

Component tests는 test 실행 중 unhandled React warnings, act() warnings, console.error 출력을 **생성하지 않아야 한다**.

### REQ-07: Optional - E2E Critical Path

**가능하면** Playwright가 구성된 환경에서 login-to-todo-creation critical user flow에 대한 E2E tests를 제공한다.

### REQ-08: Unwanted - Security (Credential Exposure 방지)

Test fixtures, mock data, factory functions에서 실제 API key, password, token 등의 credentials을 **노출하지 않아야 한다**. 모든 test data는 명백한 dummy 값 (예: `test@example.com`, `password123`)을 사용해야 한다.

---

## Specifications

### Component Coverage Matrix

| Phase | Components | Target Coverage |
|-------|-----------|----------------|
| Phase 1 | UI Primitives (button, input, checkbox, card, dialog, textarea) | 90%+ |
| Phase 2 | Todo (TodoItem, TodoList, TodoInput, TodoDetail) | 85%+ |
| Phase 3 | Auth (LoginForm, SignupForm, UserMenu, AuthProvider) | 85%+ |
| Phase 4 | Team (TeamSwitcher, CreateTeamDialog, InviteDialog, TeamMembers) | 80%+ |
| Phase 5 | Others (CalendarView, PresetList, ThemeToggle, ViewToggle, page.tsx, layout.tsx, auth/layout.tsx, join/page.tsx, loading.tsx) | 80%+ |

### Test Patterns

- **UI Primitives**: Render, accessibility attributes, event handlers, disabled/loading states
- **Container Components**: Store integration via mocked Zustand, async operations, error states
- **Form Components**: Validation, submission, error display, loading states
- **Page Components**: Route params, data fetching mocks, layout rendering
- **Radix UI Portal Content**: `screen.getByRole()` 사용하여 portal 내 콘텐츠 조회. animation이 있는 경우 `waitFor()` 사용하여 DOM 업데이트 대기

### Test File Location

- **Collocated Pattern**: test 파일은 component 파일 옆에 배치 (예: `button.tsx` 옆에 `button.test.tsx`)
- **Shared Utilities**: 공유 test utility는 `src/__tests__/utils/`에 배치
- **Test Data Factories**: `src/__tests__/utils/factories.ts`

### Mocking Strategy

- **Firebase**: `vi.mock('firebase/auth')`, `vi.mock('firebase/firestore')`
- **Firestore Real-time Listeners**: `onSnapshot` callback을 위한 custom mock utility 필요. `onSnapshot`은 실시간 데이터 구독을 위해 callback 패턴을 사용하므로, mock에서 callback을 수동으로 trigger하는 helper가 필요
- **Zustand stores**: 기본 전략은 실제 store instance 사용 + Firebase SDK mock. Firebase 통합이 SDK level에서 mock하기 너무 복잡한 경우에만 `vi.mock`으로 store 자체를 mock
- **Next.js router**: `vi.mock('next/navigation')`

---

## Traceability

| Requirement | Plan Reference | Acceptance Reference |
|-------------|---------------|---------------------|
| REQ-01 | Phase 0 (Setup) | AC-01 |
| REQ-02 | Phase 1 | AC-02 |
| REQ-03 | Phase 2 | AC-03 |
| REQ-04 | Phase 3 | AC-04 |
| REQ-05 | Phase 4 | AC-05 |
| REQ-06 | All Phases | AC-06 |
| REQ-07 | Phase 5 (Optional) | AC-07 |
| REQ-08 | All Phases | AC-08 |
