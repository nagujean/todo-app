# SPEC-TEST-002: Implementation Plan

## Overview

React component test coverage implementation for the Todo App. Builds on SPEC-TEST-001 (store tests completed at 66.62% overall coverage) to achieve 80%+ overall coverage by testing all 22+ React component files.

---

## Phase 0: Test Infrastructure Setup

**Priority: High (Prerequisite)**

### Tasks

- [ ] Create `src/tests/utils/render.tsx` with custom render wrapper including providers
- [ ] Create `src/tests/utils/mocks.ts` with Firebase, Next.js router, and common mocks
- [ ] Create `src/tests/utils/factories.ts` with test data factories (user, todo, team)
- [ ] Verify Vitest + RTL configuration supports React 19 concurrent features
- [ ] Add `@testing-library/user-event` if not present

### Technical Approach

Custom render utility wraps components with:
- ThemeProvider (light/dark)
- Zustand store provider (configurable initial state)
- Next.js navigation mocks

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
| Dialog | dialog.test.tsx | open/close, overlay click, escape key |
| Textarea | textarea.test.tsx | render, value change, resize |

### Technical Approach

- Direct RTL render without store dependencies
- Focus on accessibility: roles, labels, keyboard navigation
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

- Mock `useTodoStore` with `vi.mock` or inline store creation
- Test user interactions with `@testing-library/user-event`
- Verify store action calls (addTodo, toggleTodo, deleteTodo)
- Test loading and error states

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
- Test form validation messages
- Test auth state transitions (loading -> authenticated/unauthenticated)

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

- Mock `useTeamStore` and `useInvitationStore`
- Test dialog open/close lifecycle
- Verify Firestore operations are called correctly

---

## Phase 5: Other Components

**Priority: Medium**

### Components (5 files)

| Component | Test File | Key Scenarios |
|-----------|----------|---------------|
| CalendarView | CalendarView.test.tsx | date display, todo markers, navigation |
| PresetList | PresetList.test.tsx | preset render, selection, apply |
| ThemeToggle | ThemeToggle.test.tsx | toggle light/dark, persistence |
| ViewToggle | ViewToggle.test.tsx | view switch (list/grid/calendar) |
| page.tsx | page.test.tsx | main page render, auth redirect |

### Technical Approach

- CalendarView: Mock date for deterministic tests
- ThemeToggle/ViewToggle: Verify store state changes
- page.tsx: Integration-level test with mocked stores

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| React 19 + RTL compatibility issues | Test failures | Pin RTL version, check compatibility matrix |
| Firebase mock complexity | Slow test development | Create shared mock utilities in Phase 0 |
| Server Component testing limitations | Incomplete coverage | Test as rendered output, skip server-only logic |
| Radix UI portal rendering | DOM query issues | Use `screen.getByRole` instead of container queries |

---

## Dependencies

- SPEC-TEST-001 (Completed): Store tests provide mocking patterns to reuse
- `@testing-library/user-event`: Required for realistic user interaction simulation
- Vitest `vi.mock`: Required for module-level mocking (Firebase, Next.js)

---

## Coverage Projection

| Phase | Components | Est. Coverage Increase |
|-------|-----------|----------------------|
| Current | Stores only | 66.62% |
| Phase 1 | + UI Primitives | ~70% |
| Phase 2 | + Todo Components | ~74% |
| Phase 3 | + Auth Components | ~78% |
| Phase 4 | + Team Components | ~82% |
| Phase 5 | + Other Components | ~85% |

---

## Traceability

SPEC-TEST-002 | REQ-01 through REQ-07
