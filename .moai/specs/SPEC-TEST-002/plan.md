# SPEC-TEST-002: Implementation Plan

## Overview

Todo App의 React component test coverage 구현. SPEC-TEST-001 (store tests 완료, 전체 coverage 66.62%) 기반으로 26+ React component 파일을 테스트하여 80%+ 전체 coverage 달성을 목표로 한다.

---

## Phase 0: Test Infrastructure Setup

**Priority: High (Prerequisite)**

### Tasks

- [ ] **CRITICAL**: `vitest.config.ts` coverage exclude 목록에서 `src/components/**/*` 및 `src/app/**/*` 패턴 제거. 이 패턴이 남아있으면 component coverage가 리포트에 포함되지 않음
- [ ] React 19 + RTL 16.3.2 호환성 검증 테스트 작성 (concurrent features: useTransition, Suspense 등)
- [ ] `src/__tests__/utils/render.tsx` 생성: providers 포함 custom render wrapper
- [ ] `src/__tests__/utils/mocks.ts` 생성: Firebase, Next.js router, common mocks
- [ ] `src/__tests__/utils/firestore-listener-mock.ts` 생성: Firestore `onSnapshot` real-time listener custom mock utility
- [ ] `src/__tests__/utils/factories.ts` 생성: test data factories (user, todo, team)
- [ ] `src/__tests__/utils/store-helpers.ts` 생성: `resetAllStores()` helper for test isolation
- [ ] Zustand mocking strategy 문서화: 기본 전략은 real store + Firebase SDK mock, store vi.mock은 최후 수단
- [ ] `@testing-library/user-event` 설치 확인

### Technical Approach

Custom render utility wraps components with:
- ThemeProvider (light/dark)
- Zustand store provider (configurable initial state)
- Next.js navigation mocks

Firestore real-time listener mock:
- `onSnapshot` callback을 수동으로 trigger하는 helper function
- subscribe/unsubscribe lifecycle 검증 지원

---

## Phase 1: UI Primitives

**Priority: High**

### Components (6 files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| Button | button.test.tsx | render, click, disabled, loading, variants |
| Input | input.test.tsx | render, value change, placeholder, disabled |
| Checkbox | checkbox.test.tsx | render, toggle, controlled/uncontrolled |
| Card | card.test.tsx | render, children, header/footer slots |
| Dialog | dialog.test.tsx | open/close, overlay click, escape key, portal content |
| Textarea | textarea.test.tsx | render, value change, resize |

### Technical Approach

- Component 파일 옆에 test 파일 배치 (collocated pattern)
- Direct RTL render without store dependencies
- Accessibility 중심: roles, labels, keyboard navigation
- Radix UI portal content: `screen.getByRole()` + `waitFor()` 사용
- Snapshot tests for visual regression (optional)

---

## Phase 2: Todo Components

**Priority: High**

### Components (4 files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| TodoItem | TodoItem.test.tsx | render, toggle complete, delete, edit |
| TodoList | TodoList.test.tsx | render list, empty state, filtering |
| TodoInput | TodoInput.test.tsx | input change, submit, validation |
| TodoDetail | TodoDetail.test.tsx | render details, edit mode, close |

### Technical Approach

- 기본: real store instance 사용 + Firebase SDK mock
- `@testing-library/user-event`로 user interaction 테스트
- Store action 호출 검증 (addTodo, toggleTodo, deleteTodo)
- Loading 및 error states 테스트

---

## Phase 3: Auth Components

**Priority: High**

### Components (4 files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| LoginForm | LoginForm.test.tsx | render, validation, submit, error display |
| SignupForm | SignupForm.test.tsx | render, validation, password match, submit |
| UserMenu | UserMenu.test.tsx | authenticated state, logout, avatar |
| AuthProvider | AuthProvider.test.tsx | auth state propagation, loading state |

### Technical Approach

- Mock Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`)
- `onAuthStateChanged` mock으로 auth state 전환 테스트
- Form validation messages 테스트
- Auth state transitions (loading -> authenticated/unauthenticated)

---

## Phase 4: Team Components

**Priority: Medium**

### Components (4 files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| TeamSwitcher | TeamSwitcher.test.tsx | team list, switch team, empty state |
| CreateTeamDialog | CreateTeamDialog.test.tsx | form render, validation, create |
| InviteDialog | InviteDialog.test.tsx | email input, send invite, error |
| TeamMembers | TeamMembers.test.tsx | member list, roles, remove member |

### Technical Approach

- Real store instance 사용 + Firebase SDK mock (기본 전략)
- Dialog open/close lifecycle 테스트
- Firestore `onSnapshot` listener mock을 활용한 real-time data 테스트

---

## Phase 5: Other Components

**Priority: Medium**

### Components (8+ files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| CalendarView | CalendarView.test.tsx | date display, todo markers, navigation |
| PresetList | PresetList.test.tsx | preset render, selection, apply |
| ThemeToggle | ThemeToggle.test.tsx | toggle light/dark, persistence |
| ViewToggle | ViewToggle.test.tsx | view switch (list/grid/calendar) |
| page.tsx | page.test.tsx | main page render, auth redirect |
| layout.tsx | layout.test.tsx | root layout rendering, providers |
| auth/layout.tsx | auth-layout.test.tsx | auth layout rendering |
| join/page.tsx | join-page.test.tsx | join page rendering |
| loading.tsx | loading.test.tsx | loading state rendering |

### Technical Approach

- CalendarView: Mock date for deterministic tests
- ThemeToggle/ViewToggle: Store state 변경 검증
- page.tsx: Integration-level test with mocked stores
- layout.tsx: Provider wrapping 및 children rendering 검증

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **vitest.config.ts가 components를 coverage에서 제외** | **CRITICAL** - coverage 리포트에 component 테스트가 반영 안됨 | Phase 0에서 exclude 패턴 제거를 최우선 수행 |
| **Firestore real-time listener testing** | **HIGH** - onSnapshot mock이 없으면 team/todo 실시간 기능 테스트 불가 | Phase 0에서 custom onSnapshot mock utility 생성 |
| React 19 + RTL 호환성 문제 | Test failures | RTL 버전 고정, Phase 0에서 호환성 매트릭스 확인 |
| Firebase mock 복잡도 | Slow test development | Phase 0에서 shared mock utilities 생성 |
| Server Component testing 제한 | Incomplete coverage | E2E로 테스트, server-only 로직 skip |
| Radix UI portal rendering | DOM query 문제 | `screen.getByRole` + `waitFor()` 사용 |
| **Next.js middleware testing 갭** | **MEDIUM** - middleware 로직이 unit test로 커버 안됨 | Middleware는 E2E에서 검증, coverage 목표에서 제외 고려 |
| **Concurrent feature test 불안정성** | **MEDIUM** - useTransition 등에서 flaky test 발생 가능 | RTL `waitFor()` 적극 활용, act() warning 모니터링 |

---

## Dependencies

- SPEC-TEST-001 (Completed): Store tests가 mocking patterns 제공
- `@testing-library/user-event`: 실사용자 interaction simulation에 필수
- Vitest `vi.mock`: Module-level mocking (Firebase, Next.js)에 필수

---

## Coverage Projection

| Phase | Components | Est. Coverage Increase |
|-------|-----------|----------------------|
| Current | Stores only | 66.62% |
| Phase 0 | + Config fix | ~67% (coverage 리포트 정확도 향상) |
| Phase 1 | + UI Primitives | ~70% |
| Phase 2 | + Todo Components | ~74% |
| Phase 3 | + Auth Components | ~78% |
| Phase 4 | + Team Components | ~82% |
| Phase 5 | + Other Components | ~85% |

---

## Traceability

SPEC-TEST-002 | REQ-01 through REQ-08
