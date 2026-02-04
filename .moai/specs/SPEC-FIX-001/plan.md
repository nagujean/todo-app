---
spec_id: SPEC-FIX-001
type: plan
version: "1.0.0"
---

# SPEC-FIX-001 구현 계획

## Phase 1: Critical - TodoList 리팩토링 (Primary Goal)

### 목표
TodoList.tsx에서 3회 반복되는 필터/정렬 UI(~110줄)를 FilterSortBar 컴포넌트로 추출한다.

### 작업 목록

1. **FilterSortBar 컴포넌트 생성**
   - `src/components/todo/FilterSortBar.tsx` 신규 생성
   - Props 인터페이스 정의 (filter, sort, onChange 핸들러)
   - 기존 필터/정렬 UI 로직 이전

2. **TodoList.tsx 리팩토링**
   - 중복 코드 3곳을 FilterSortBar 컴포넌트 호출로 교체
   - Props 전달 및 상태 연결 확인
   - 기존 동작 보존 검증 (SPEC-TEST-002 테스트 활용)

3. **테스트 작성**
   - FilterSortBar 단위 테스트 작성
   - TodoList 통합 테스트에서 동작 보존 확인

### 수정 파일
- `src/components/todo/TodoList.tsx` (수정)
- `src/components/todo/FilterSortBar.tsx` (신규)
- `src/components/todo/__tests__/FilterSortBar.test.tsx` (신규)

---

## Phase 2: Security - 보안 수정 (Secondary Goal)

### 목표
인증 에러 메시지 일반화, 비밀번호 복잡성 검증, 입력 길이 제한, 이메일 검증 통합을 수행한다.

### 작업 목록

1. **인증 에러 메시지 일반화** (REQ-03)
   - `src/store/authStore.ts`에 에러 코드 매핑 함수 추가
   - `auth/user-not-found`와 `auth/wrong-password`를 동일 메시지로 처리
   - Firebase 원본 에러는 console에만 로깅 (개발 환경)

2. **비밀번호 복잡성 검증** (REQ-04)
   - `src/utils/validation.ts` 신규 생성 (공용 검증 유틸)
   - 비밀번호 복잡성 검증 함수 구현
   - `SignupForm.tsx`에 검증 로직 적용

3. **Description maxLength 추가** (REQ-02)
   - `TodoInput.tsx` textarea에 `maxLength` 속성 추가
   - 글자 수 카운터 UI 추가 (선택)

4. **이메일 검증 통합** (REQ-04)
   - `src/utils/validation.ts`에 공용 이메일 검증 함수 추가
   - `InviteDialog`와 `invitationStore`에서 동일 함수 사용하도록 통합

### 수정 파일
- `src/store/authStore.ts` (수정)
- `src/components/auth/SignupForm.tsx` (수정)
- `src/components/todo/TodoInput.tsx` (수정)
- `src/components/invitation/InviteDialog.tsx` (수정)
- `src/store/invitationStore.ts` (수정)
- `src/utils/validation.ts` (신규)

---

## Phase 3: Medium - 품질 개선 (Tertiary Goal)

### 목표
보안 헤더 설정, deprecated API 교체, 타입 안전성 개선, 접근성 강화를 수행한다.

### 작업 목록

1. **보안 헤더 추가** (REQ-05)
   - `next.config.ts`에 CSP, HSTS, X-Content-Type-Options 등 설정

2. **Clipboard API 교체** (REQ-05)
   - `InviteDialog.tsx`의 `document.execCommand('copy')`를 `navigator.clipboard.writeText()`로 교체
   - fallback 처리 추가

3. **타입 안전성 개선** (REQ-05)
   - `invitationStore.ts`의 `as` 타입 단언을 타입 가드로 교체
   - `unknown` 기반 에러 핸들링 패턴 적용

4. **접근성 개선** (REQ-05)
   - 커스텀 버튼에 `role="button"`, `tabIndex`, `onKeyDown` 추가
   - `focus-visible` 스타일링 적용

### 수정 파일
- `next.config.ts` (수정)
- `src/components/invitation/InviteDialog.tsx` (수정)
- `src/store/invitationStore.ts` (수정)
- 접근성 관련 컴포넌트 (수정)

---

## 의존성 분석

```
Phase 1 (독립) ─── FilterSortBar 추출
Phase 2 (독립) ─── 보안 수정 (validation.ts 공유)
Phase 3 (독립) ─── 품질 개선
```

- Phase 1, 2, 3은 상호 독립적이며 병렬 진행 가능
- Phase 2 내부에서 `validation.ts` 생성이 선행되어야 이메일/비밀번호 검증 통합 가능

## 리스크 분석

| 리스크 | 영향도 | 대응 방안 |
|-------|-------|----------|
| FilterSortBar 추출 시 기존 상태 관리 깨짐 | HIGH | 기존 테스트로 동작 보존 검증 |
| CSP 헤더가 Firebase SDK 로딩 차단 | MEDIUM | Firebase 도메인을 CSP allowlist에 포함 |
| Clipboard API 미지원 브라우저 | LOW | try-catch fallback 구현 |
| 비밀번호 규칙 변경으로 기존 사용자 영향 | LOW | 신규 가입/변경 시에만 적용 |
