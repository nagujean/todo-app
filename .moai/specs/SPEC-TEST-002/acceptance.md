# SPEC-TEST-002: Acceptance Criteria

## AC-01: Test Infrastructure (REQ-01)

### Scenario: Custom render utility works with all providers

```gherkin
Given a React component that requires ThemeProvider and auth context
When rendered using the custom test render utility
Then the component renders without provider-related errors
And the test can access theme and auth state
```

### Scenario: Test data factories produce valid objects

```gherkin
Given a test that needs a User, Todo, or Team object
When the factory function is called with optional overrides
Then a valid typed object is returned with sensible defaults
```

---

## AC-02: UI Primitive Tests (REQ-02)

### Scenario: Button component handles interactions

```gherkin
Given a Button component rendered with an onClick handler
When the user clicks the button
Then the onClick handler is called exactly once
And when the button is disabled, clicks are not propagated
```

### Scenario: Dialog component manages open/close state

```gherkin
Given a Dialog component in closed state
When the trigger element is clicked
Then the dialog content becomes visible
And when the Escape key is pressed, the dialog closes
```

---

## AC-03: Todo Component Tests (REQ-03)

### Scenario: TodoInput submits new todo

```gherkin
Given the TodoInput component is rendered
When the user types "Buy groceries" and presses Enter
Then the addTodo store action is called with title "Buy groceries"
And the input field is cleared
```

### Scenario: TodoItem toggles completion

```gherkin
Given a TodoItem rendered with an incomplete todo
When the user clicks the checkbox
Then the toggleTodo store action is called with the todo ID
```

---

## AC-04: Auth Component Tests (REQ-04)

### Scenario: LoginForm handles authentication

```gherkin
Given the LoginForm component is rendered
When the user enters valid email and password and submits
Then the Firebase signInWithEmailAndPassword is called
And on success, the auth state updates to authenticated
```

### Scenario: LoginForm shows validation errors

```gherkin
Given the LoginForm component is rendered
When the user submits with an empty email field
Then a validation error message is displayed
And the Firebase auth function is not called
```

---

## AC-05: Team Component Tests (REQ-05)

### Scenario: TeamSwitcher displays and switches teams

```gherkin
Given the TeamSwitcher with 3 teams in the store
When the user opens the switcher dropdown
Then all 3 team names are visible
And when a different team is selected, the setActiveTeam action is called
```

### Scenario: CreateTeamDialog validates input

```gherkin
Given the CreateTeamDialog is open
When the user submits without a team name
Then a validation error is shown
And the createTeam action is not called
```

---

## AC-06: No Unhandled Errors (REQ-06)

### Scenario: Clean test execution

```gherkin
Given any component test in the suite
When the test executes
Then no console.error output is produced
And no React act() warnings are logged
And no unhandled promise rejections occur
```

---

## AC-07: E2E Critical Path (REQ-07, Optional)

### Scenario: Login to todo creation flow

```gherkin
Given a user on the login page (Playwright)
When the user logs in with valid credentials
And navigates to the todo list
And creates a new todo item
Then the todo appears in the list
And persists after page reload
```

---

## Quality Gates

| Gate | Criteria | Tool |
|------|----------|------|
| Overall Coverage | >= 80% | Vitest --coverage |
| Component Coverage | >= 80% per component file | Vitest coverage report |
| Zero Test Failures | All tests pass | Vitest |
| No Console Errors | No console.error in test output | Custom Vitest reporter / spy |
| Type Safety | Zero TypeScript errors in test files | tsc --noEmit |

---

## Definition of Done

- [ ] All 22+ component files have corresponding test files
- [ ] Overall test coverage >= 80%
- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors in test files
- [ ] Test utilities documented in `src/tests/utils/README.md` (optional)
- [ ] CI pipeline updated to run component tests

---

## Traceability

SPEC-TEST-002 | AC-01 through AC-07 | REQ-01 through REQ-07
