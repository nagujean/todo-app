# SPEC-TEST-002: Acceptance Criteria

## AC-01: Test Infrastructure (REQ-01)

### Scenario: Custom render utility가 모든 providers와 동작

```gherkin
Given ThemeProvider와 auth context가 필요한 React component
When custom test render utility를 사용하여 렌더링할 때
Then component가 provider 관련 오류 없이 렌더링됨
And test에서 theme과 auth state에 접근 가능
```

### Scenario: Test data factories가 유효한 객체를 생성

```gherkin
Given User, Todo, 또는 Team 객체가 필요한 test
When factory function이 optional overrides와 함께 호출될 때
Then sensible defaults를 가진 유효한 typed 객체가 반환됨
```

---

## AC-02: UI Primitive Tests (REQ-02)

### Scenario: Button component가 상호작용을 처리

```gherkin
Given onClick handler와 함께 렌더링된 Button component
When 사용자가 button을 클릭할 때
Then onClick handler가 정확히 한 번 호출됨
And button이 disabled일 때 clicks가 전파되지 않음
```

### Scenario: Dialog component가 open/close 상태를 관리

```gherkin
Given closed 상태의 Dialog component
When trigger element가 클릭될 때
Then dialog content가 visible 상태가 됨
And Escape key가 눌릴 때 dialog가 닫힘
```

---

## AC-03: Todo Component Tests (REQ-03)

### Scenario: TodoInput이 새로운 todo를 제출

```gherkin
Given TodoInput component가 렌더링된 상태
When 사용자가 "Buy groceries"를 입력하고 Enter를 누를 때
Then addTodo store action이 title "Buy groceries"와 함께 호출됨
And input field가 비워짐
```

### Scenario: TodoItem이 완료 상태를 토글

```gherkin
Given 미완료 todo와 함께 렌더링된 TodoItem
When 사용자가 checkbox를 클릭할 때
Then toggleTodo store action이 해당 todo ID와 함께 호출됨
```

---

## AC-04: Auth Component Tests (REQ-04)

### Scenario: LoginForm이 인증을 처리

```gherkin
Given LoginForm component가 렌더링된 상태
When 사용자가 유효한 email과 password를 입력하고 제출할 때
Then Firebase signInWithEmailAndPassword가 호출됨
And 성공 시 auth state가 authenticated로 업데이트됨
```

### Scenario: LoginForm이 validation 오류를 표시

```gherkin
Given LoginForm component가 렌더링된 상태
When 사용자가 빈 email field로 제출할 때
Then validation error message가 표시됨
And Firebase auth function이 호출되지 않음
```

---

## AC-05: Team Component Tests (REQ-05)

### Scenario: TeamSwitcher가 teams를 표시하고 전환

```gherkin
Given store에 3개 teams가 있는 TeamSwitcher
When 사용자가 switcher dropdown을 열 때
Then 3개 team name이 모두 표시됨
And 다른 team이 선택될 때 setActiveTeam action이 호출됨
```

### Scenario: CreateTeamDialog가 입력을 검증

```gherkin
Given CreateTeamDialog가 열린 상태
When 사용자가 team name 없이 제출할 때
Then validation error가 표시됨
And createTeam action이 호출되지 않음
```

---

## AC-06: No Unhandled Errors (REQ-06)

### Scenario: Clean test execution

```gherkin
Given test suite의 모든 component test
When test가 실행될 때
Then console.error 출력이 생성되지 않음
And React act() warnings가 로깅되지 않음
And unhandled promise rejections가 발생하지 않음
```

### Scenario: Memory leak 방지 및 cleanup 검증

```gherkin
Given subscriptions 또는 timers를 사용하는 component test
When component가 unmount될 때
Then 모든 subscriptions이 정리됨 (unsubscribe 호출)
And 모든 timers가 cleared됨
And memory leak 관련 warning이 발생하지 않음
```

---

## AC-07: E2E Critical Path (REQ-07, Optional)

### Scenario: Login to todo creation flow

```gherkin
Given login page에 있는 사용자 (Playwright)
When 사용자가 유효한 credentials로 로그인하고
And todo list로 이동하고
And 새로운 todo item을 생성할 때
Then todo가 list에 표시됨
And page reload 후에도 유지됨
```

### Scenario: Team collaboration E2E flow

```gherkin
Given 인증된 사용자가 team을 보유한 상태 (Playwright)
When 사용자가 team을 전환하고
And 해당 team의 todo list를 확인할 때
Then team-specific todo items만 표시됨
And team member 정보가 올바르게 렌더링됨
```

---

## AC-08: Security - No Credential Exposure (REQ-08)

### Scenario: Test fixtures에 실제 credentials 미포함

```gherkin
Given 모든 test 파일의 mock data 및 factory functions
When test data를 검사할 때
Then 실제 API key, password, token이 포함되지 않음
And 모든 credentials가 명백한 dummy 값을 사용함 (예: test@example.com, password123)
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

- [ ] 모든 26+ component 파일에 대응하는 test 파일이 존재
- [ ] 전체 test coverage >= 80%
- [ ] 모든 tests 통과 (`npm run test`)
- [ ] Test 파일에 TypeScript errors 없음
- [ ] TRUST 5 검증 완료 (Tested, Readable, Unified, Secured, Trackable)
- [ ] Code review 완료 및 승인
- [ ] Conventional commits 형식 준수
- [ ] Coverage 비교: SPEC-TEST-001 이후 coverage 개선 확인 (66.62% -> 80%+)
- [ ] Test utilities 문서화 `src/__tests__/utils/README.md` (optional)
- [ ] CI pipeline이 component tests를 실행하도록 업데이트

---

## Traceability

| Acceptance Criteria | Requirement |
|---------------------|-------------|
| AC-01 | REQ-01 |
| AC-02 | REQ-02 |
| AC-03 | REQ-03 |
| AC-04 | REQ-04 |
| AC-05 | REQ-05 |
| AC-06 | REQ-06 |
| AC-07 | REQ-07 |
| AC-08 | REQ-08 |
