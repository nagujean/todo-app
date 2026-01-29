# SPEC-TEST-002: React Component Test Coverage

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-TEST-002 |
| Title | React Component Test Coverage |
| Status | Planned |
| Priority | High |
| Created | 2026-01-29 |
| Related | SPEC-TEST-001 (Store Tests - Completed) |
| Lifecycle | spec-first |

---

## Environment

- **Framework**: Next.js 16.1.2 + React 19.2.3 + TypeScript 5.x
- **Test Stack**: Vitest 4.0.18, @testing-library/react 16.3.2, Playwright 1.57.0
- **State Management**: Zustand 5.0.10
- **UI Libraries**: Tailwind CSS 4.x, Radix UI
- **Backend**: Firebase 12.8.0
- **Current Coverage**: 66.62% (stores tested, components at 0%)
- **Target Coverage**: 80%+

---

## Assumptions

1. Store layer is fully tested (SPEC-TEST-001 completed) and can be mocked reliably
2. @testing-library/react 16.3.2 supports React 19 concurrent features
3. Firebase services will be mocked at the module level (no live connections in unit tests)
4. Radix UI primitives do not require custom test wrappers beyond standard RTL utilities
5. Server Components (if any) will be tested as rendered output, not as async server functions

---

## Requirements

### REQ-01: Ubiquitous - Test Infrastructure

The test infrastructure **shall** provide reusable render utilities with common providers (ThemeProvider, AuthProvider, Zustand stores) for all component tests.

### REQ-02: Event-Driven - UI Primitive Interaction

**When** a user interacts with a UI primitive (button, input, checkbox, dialog), the component test **shall** verify the correct DOM state change and callback invocation.

### REQ-03: Event-Driven - Todo CRUD Operations

**When** a user creates, updates, toggles, or deletes a todo item through the UI, the component test **shall** verify the correct store action is called with expected arguments.

### REQ-04: State-Driven - Authentication UI

**While** the user is unauthenticated, the component test **shall** verify that LoginForm and SignupForm render correctly and handle form submission. **While** the user is authenticated, the component test **shall** verify that UserMenu displays user info and logout functionality.

### REQ-05: State-Driven - Team Components

**While** teams exist, the component test **shall** verify TeamSwitcher displays team list and allows switching. **While** a team is selected, the component test **shall** verify InviteDialog and TeamMembers render correct team data.

### REQ-06: Unwanted - No Unhandled Errors

The component tests **shall not** produce unhandled React warnings, act() warnings, or console.error output during test execution.

### REQ-07: Optional - E2E Critical Path

**Where** Playwright is configured, the test suite **shall** provide E2E tests for the critical login-to-todo-creation user flow.

---

## Specifications

### Component Coverage Matrix

| Phase | Components | Target Coverage |
|-------|-----------|----------------|
| Phase 1 | UI Primitives (button, input, checkbox, card, dialog, textarea) | 90%+ |
| Phase 2 | Todo (TodoItem, TodoList, TodoInput, TodoDetail) | 85%+ |
| Phase 3 | Auth (LoginForm, SignupForm, UserMenu, AuthProvider) | 85%+ |
| Phase 4 | Team (TeamSwitcher, CreateTeamDialog, InviteDialog, TeamMembers) | 80%+ |
| Phase 5 | Others (CalendarView, PresetList, ThemeToggle, ViewToggle, page.tsx) | 80%+ |

### Test Patterns

- **UI Primitives**: Render, accessibility attributes, event handlers, disabled/loading states
- **Container Components**: Store integration via mocked Zustand, async operations, error states
- **Form Components**: Validation, submission, error display, loading states
- **Page Components**: Route params, data fetching mocks, layout rendering

### Mocking Strategy

- Firebase: `vi.mock('firebase/auth')`, `vi.mock('firebase/firestore')`
- Zustand stores: Per-test store initialization with `create()` or `vi.mock`
- Next.js router: `vi.mock('next/navigation')`

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
