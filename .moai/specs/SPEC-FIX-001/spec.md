---
id: SPEC-FIX-001
title: "Code Quality and Security Fix"
version: "1.0.0"
status: "completed"
created: "2026-01-29"
updated: "2026-02-04"
author: "Alfred"
priority: "high"
tags: ["code-quality", "security", "accessibility", "refactoring"]
related_specs: ["SPEC-REFACTOR-001"]
completion_date: "2026-02-04"
---

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-29 | Alfred | 초기 SPEC 작성 |

---

# SPEC-FIX-001: 코드 품질 및 보안 이슈 수정

## 1. Environment (환경)

- **프로젝트**: Todo App
- **기술 스택**: Next.js 16 + React 19 + Zustand 5 + Firebase + Tailwind CSS 4
- **대상 파일**:
  - `src/components/todo/TodoList.tsx`
  - `src/components/todo/TodoInput.tsx`
  - `src/components/auth/SignupForm.tsx`
  - `src/store/authStore.ts`
  - `src/store/invitationStore.ts`
  - `src/components/invitation/InviteDialog.tsx`
  - `next.config.ts`

## 2. Assumptions (가정)

- 기존 테스트 커버리지(SPEC-TEST-001, SPEC-TEST-002)가 동작 보존 검증에 활용 가능하다
- Firebase Auth 에러 코드 구조가 현재 패턴을 따른다
- Next.js 16의 `headers()` 설정으로 보안 헤더 적용이 가능하다
- Clipboard API(`navigator.clipboard`)가 대상 브라우저에서 지원된다

## 3. Requirements (요구사항)

### REQ-01: 코드 중복 제거 (CRITICAL)

시스템은 **항상** TodoList 컴포넌트의 필터/정렬 UI를 단일 `FilterSortBar` 컴포넌트로 추출하여 중복 코드를 제거해야 한다.

- **WHEN** TodoList 컴포넌트가 렌더링될 때, **THEN** FilterSortBar 컴포넌트를 재사용하여 필터/정렬 UI를 표시해야 한다
- 현재 약 110줄이 3회 반복되는 중복 코드를 단일 컴포넌트로 통합한다
- 대상: `src/components/todo/TodoList.tsx:70-220`

### REQ-02: 입력 길이 제한 (HIGH)

- **WHEN** 사용자가 할일 설명(description)을 입력할 때, **THEN** textarea에 maxLength 속성이 적용되어 최대 글자수를 제한해야 한다
- 대상: `src/components/todo/TodoInput.tsx:97-103`

### REQ-03: 인증 에러 메시지 보안 (HIGH)

시스템은 Firebase Auth 에러 메시지를 사용자에게 직접 노출**하지 않아야 한다**.

- **IF** Firebase Auth에서 에러가 발생하면, **THEN** 일반화된(generic) 에러 메시지를 사용자에게 표시해야 한다
- 사용자 열거(user enumeration) 공격을 방지하기 위해 `auth/user-not-found`와 `auth/wrong-password` 에러를 동일한 메시지로 처리한다
- 대상: `src/store/authStore.ts:93-94`

### REQ-04: 이메일 및 비밀번호 검증 통합 (HIGH)

- **WHEN** 사용자가 회원가입 또는 초대를 진행할 때, **THEN** 동일한 이메일 검증 로직이 적용되어야 한다
- **WHEN** 사용자가 비밀번호를 설정할 때, **THEN** 최소 8자, 대/소문자, 숫자, 특수문자 조합의 복잡성 검증이 적용되어야 한다
- 대상: `src/components/auth/SignupForm.tsx:24-32`, `InviteDialog`, `invitationStore`

### REQ-05: 보안 헤더 및 코드 품질 개선 (MEDIUM)

- **가능하면** `next.config.ts`에 CSP(Content-Security-Policy)와 HSTS(Strict-Transport-Security) 보안 헤더를 설정해야 한다
- **WHEN** 클립보드 복사가 필요할 때, **THEN** `navigator.clipboard.writeText()` API를 사용해야 한다 (deprecated `document.execCommand('copy')` 대체)
- `invitationStore.ts`의 `as` 타입 단언(type assertion)을 타입 가드 또는 `unknown` 기반 안전한 패턴으로 교체한다
- **가능하면** 커스텀 버튼 요소에 `role="button"` 및 `focus-visible` 스타일링을 추가하여 접근성을 개선해야 한다

## 4. Specifications (세부 사양)

### FilterSortBar 컴포넌트 설계

```typescript
// src/components/todo/FilterSortBar.tsx
interface FilterSortBarProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}
```

### 인증 에러 메시지 매핑

```typescript
const AUTH_ERROR_MAP: Record<string, string> = {
  'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
  default: '인증 중 오류가 발생했습니다. 다시 시도해주세요.',
};
```

### 비밀번호 복잡성 규칙

- 최소 8자 이상
- 대문자 1자 이상 포함
- 소문자 1자 이상 포함
- 숫자 1자 이상 포함
- 특수문자 1자 이상 포함

## 5. Traceability (추적성)

| 요구사항 | 우선순위 | 대상 파일 | 관련 테스트 |
|---------|---------|----------|------------|
| REQ-01 | CRITICAL | TodoList.tsx, FilterSortBar.tsx (신규) | FilterSortBar 렌더링 테스트 |
| REQ-02 | HIGH | TodoInput.tsx | maxLength 검증 테스트 |
| REQ-03 | HIGH | authStore.ts | 에러 메시지 일반화 테스트 |
| REQ-04 | HIGH | SignupForm.tsx, InviteDialog.tsx, invitationStore.ts | 검증 통합 테스트 |
| REQ-05 | MEDIUM | next.config.ts, InviteDialog.tsx, invitationStore.ts | 보안 헤더/접근성 테스트 |
