---
spec_id: SPEC-FIX-001
type: acceptance
version: "1.0.0"
---

# SPEC-FIX-001 인수 기준

## Phase 1: TodoList FilterSortBar 추출

### AC-1.1: FilterSortBar 컴포넌트 렌더링

```gherkin
Given TodoList 컴포넌트가 렌더링되었을 때
When 필터/정렬 UI 영역을 확인하면
Then FilterSortBar 컴포넌트가 사용되어야 한다
And TodoList.tsx에 필터/정렬 관련 중복 코드가 존재하지 않아야 한다
```

### AC-1.2: FilterSortBar 기능 동작 보존

```gherkin
Given FilterSortBar 컴포넌트가 렌더링되었을 때
When 사용자가 필터 옵션(전체/완료/미완료)을 변경하면
Then 상위 컴포넌트의 onFilterChange 콜백이 호출되어야 한다
And 할일 목록이 선택된 필터에 따라 정렬되어야 한다
```

### AC-1.3: 코드 중복 제거 검증

```gherkin
Given 리팩토링이 완료되었을 때
When TodoList.tsx의 코드를 검사하면
Then 필터/정렬 UI 코드가 1곳(FilterSortBar)에만 존재해야 한다
And 기존 SPEC-TEST-002 테스트가 모두 통과해야 한다
```

---

## Phase 2: 보안 수정

### AC-2.1: 인증 에러 메시지 일반화

```gherkin
Given 로그인 폼에서 존재하지 않는 이메일을 입력했을 때
When Firebase에서 auth/user-not-found 에러가 반환되면
Then "이메일 또는 비밀번호가 올바르지 않습니다." 메시지가 표시되어야 한다
And Firebase 원본 에러 코드가 사용자에게 노출되지 않아야 한다
```

### AC-2.2: 잘못된 비밀번호 에러 일반화

```gherkin
Given 로그인 폼에서 올바른 이메일과 잘못된 비밀번호를 입력했을 때
When Firebase에서 auth/wrong-password 에러가 반환되면
Then auth/user-not-found와 동일한 일반화된 메시지가 표시되어야 한다
```

### AC-2.3: 비밀번호 복잡성 검증

```gherkin
Given 회원가입 폼에서 비밀번호를 입력할 때
When 비밀번호가 "abc" (8자 미만)이면
Then "비밀번호는 최소 8자 이상이어야 합니다" 에러가 표시되어야 한다

When 비밀번호가 "abcdefgh" (대문자/숫자/특수문자 누락)이면
Then 누락된 조건에 대한 에러 메시지가 표시되어야 한다

When 비밀번호가 "Abc123!@" (모든 조건 충족)이면
Then 검증을 통과해야 한다
```

### AC-2.4: Description maxLength 적용

```gherkin
Given 할일 추가 폼의 description textarea가 표시될 때
When 사용자가 최대 글자 수를 초과하여 입력을 시도하면
Then maxLength 속성에 의해 추가 입력이 차단되어야 한다
```

### AC-2.5: 이메일 검증 통합

```gherkin
Given SignupForm과 InviteDialog에서 이메일을 입력할 때
When 동일한 잘못된 이메일 형식(예: "test@")을 입력하면
Then 두 컴포넌트 모두 동일한 검증 결과를 반환해야 한다
And 공용 validation 함수가 사용되어야 한다
```

---

## Phase 3: 품질 개선

### AC-3.1: 보안 헤더 적용

```gherkin
Given Next.js 앱이 배포되었을 때
When HTTP 응답 헤더를 확인하면
Then Content-Security-Policy 헤더가 포함되어야 한다
And Strict-Transport-Security 헤더가 포함되어야 한다
And X-Content-Type-Options: nosniff 헤더가 포함되어야 한다
```

### AC-3.2: Clipboard API 사용

```gherkin
Given InviteDialog에서 초대 링크 복사 버튼을 클릭할 때
When navigator.clipboard API가 사용 가능하면
Then navigator.clipboard.writeText()로 복사되어야 한다
And document.execCommand('copy')가 호출되지 않아야 한다
```

### AC-3.3: 타입 안전성

```gherkin
Given invitationStore.ts의 에러 핸들링 코드를 검사할 때
When 에러 객체를 처리하는 부분을 확인하면
Then as 키워드를 사용한 타입 단언이 존재하지 않아야 한다
And unknown 타입 기반의 타입 가드 패턴이 사용되어야 한다
```

### AC-3.4: 접근성 검증

```gherkin
Given 커스텀 클릭 가능 요소가 렌더링될 때
When 요소의 HTML 속성을 확인하면
Then role="button" 속성이 포함되어야 한다
And tabIndex가 설정되어 키보드 포커스가 가능해야 한다
And focus-visible 스타일이 적용되어야 한다
```

---

## Definition of Done

- [ ] 모든 인수 기준 시나리오 통과
- [ ] 기존 테스트(SPEC-TEST-001, SPEC-TEST-002) 회귀 없음
- [ ] 신규 테스트 추가 (FilterSortBar, validation 유틸)
- [ ] TypeScript 컴파일 에러 0건
- [ ] ESLint 경고 0건 (신규 코드)
- [ ] `as` 타입 단언 제거 확인
- [ ] deprecated API 사용 제거 확인
