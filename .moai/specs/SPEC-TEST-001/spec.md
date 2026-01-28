# SPEC-TEST-001: 테스트 커버리지 개선

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-TEST-001 |
| **제목** | Todo App 핵심 Store 테스트 커버리지 개선 |
| **생성일** | 2026-01-29 |
| **상태** | Planned |
| **우선순위** | High |
| **담당 에이전트** | manager-ddd, expert-testing |
| **예상 스토리 포인트** | 13 SP |
| **라이프사이클** | spec-anchored |
| **선행 SPEC** | SPEC-REFACTOR-001 (Completed - 85%) |

## 추적성 태그

```
TAG: SPEC-TEST-001
PARENT: SPEC-REFACTOR-001
CHILDREN: None
RELATED: None
```

---

## 1. 환경 (Environment)

### 1.1 현재 시스템 상태

- **프로젝트**: Todo App (할 일 관리 PWA)
- **기술 스택**: Next.js 16.1.2, React 19.2.3, TypeScript 5.x, Firebase 12.8.0, Zustand 5.0.10
- **테스트 프레임워크**: Vitest 4.0.18, @testing-library/react 16.3.2
- **현재 테스트 커버리지**: 25.26% (전체)
- **목표 테스트 커버리지**: 60%+ (핵심 스토어 중점)

### 1.2 커버리지 현황 분석

| 파일 | 라인 수 | 현재 커버리지 | 목표 커버리지 | 우선순위 |
|------|---------|---------------|---------------|----------|
| `invitationStore.ts` | 526 lines | 0% | 70%+ | **CRITICAL** |
| `teamStore.ts` | 463 lines | 13.22% | 60%+ | **CRITICAL** |
| `themeStore.ts` | 20 lines | 0% | 90%+ | Medium |
| `authStore.ts` | ~200 lines | 31.57% | 60%+ | High |

### 1.3 테스트 대상 기능 분석

#### invitationStore.ts (526 lines, 0% coverage)

**핵심 액션 함수:**
- `createEmailInvitation()`: 이메일 초대 생성 (이메일 유효성 검사, E2E 모드 분기)
- `createLinkInvitation()`: 링크 초대 생성 (maxUses 설정, E2E 모드 분기)
- `acceptInvitation()`: 초대 수락 (만료 검증, 이메일 매칭, 배치 연산)
- `declineInvitation()`: 초대 거절
- `revokeInvitation()`: 초대 취소

**헬퍼 함수:**
- `generateInvitationLink()`: 초대 링크 URL 생성
- `isInvitationExpired()`: 초대 만료 여부 확인
- `createExpirationDate()`: 만료일 생성 (6일 23시간)

**구독 관리:**
- `subscribeToUserInvitations()`: 사용자 초대 구독
- `subscribeToTeamInvitations()`: 팀 초대 구독
- `unsubscribeFromInvitations()`: 구독 해제

#### teamStore.ts (463 lines, 13.22% coverage)

**핵심 액션 함수:**
- `createTeam()`: 팀 생성 (배치 연산, E2E 모드 분기)
- `updateTeam()`: 팀 정보 수정
- `deleteTeam()`: 팀 삭제
- `leaveTeam()`: 팀 탈퇴
- `updateMemberRole()`: 멤버 역할 변경
- `removeMember()`: 멤버 제거

**구독 관리:**
- `subscribeToTeams()`: 팀 목록 구독
- `subscribeToTeamMembers()`: 팀 멤버 구독
- `unsubscribeFromTeams()`: 구독 해제

#### themeStore.ts (20 lines, 0% coverage)

**액션 함수:**
- `toggleTheme()`: 다크/라이트 모드 토글

**상태:**
- `isDark`: 현재 테마 상태
- `persist`: localStorage 영속화

### 1.4 제약 조건

- 기존 유닛 테스트 (25.26%) 통과 상태 유지
- 기존 E2E 테스트 (Playwright) 100% 통과 유지
- Firebase 모킹을 통한 독립적 테스트 환경 구성
- 테스트 실행 시간 60초 이내 유지

---

## 2. 가정 (Assumptions)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 오류 시 위험 | 검증 방법 |
|----|------|--------|------|--------------|-----------|
| A1 | Firebase 모킹으로 store 함수 독립 테스트 가능 | High | 기존 authStore.test.ts 패턴 존재 | 테스트 격리 실패 | 샘플 테스트 작성 |
| A2 | E2E 모드 분기 코드 테스트 가능 | High | isE2ETestMode() 모킹 가능 | 분기 커버리지 부족 | 모킹 테스트 |
| A3 | Zustand store 상태 초기화 가능 | High | beforeEach에서 상태 리셋 가능 | 테스트 간 간섭 | 기존 패턴 검증 |
| A4 | localStorage 모킹으로 persist 테스트 가능 | High | Vitest 환경에서 지원 | 영속화 테스트 불가 | 샘플 테스트 |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | 60% 커버리지 달성 시 품질 기준 충족 | High | TRUST 5 프레임워크 기준 |
| B2 | 핵심 스토어 우선 테스트로 ROI 최대화 | High | 복잡도와 사용 빈도 기반 |

---

## 3. 요구사항 (Requirements)

### 3.1 P1 - Critical: invitationStore 테스트 (5 SP)

#### REQ-001: 이메일 초대 생성 테스트

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** `createEmailInvitation()` 함수가 유효한 이메일과 팀 정보로 호출되면 **THEN** 시스템은 초대 ID를 반환하고 `teamInvitations` 상태를 업데이트해야 한다.

**테스트 시나리오:**
- 정상 케이스: 유효한 이메일, 팀 ID, 역할로 초대 생성
- E2E 모드: 모킹된 초대 ID 반환 및 로컬 상태 업데이트
- 오류 케이스: 빈 이메일, 유효하지 않은 이메일 형식
- 오류 케이스: Firebase 미초기화 상태
- 오류 케이스: 권한 없는 사용자 (owner/admin/editor 아님)

#### REQ-002: 링크 초대 생성 테스트

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** `createLinkInvitation()` 함수가 팀 정보와 maxUses 옵션으로 호출되면 **THEN** 시스템은 초대 ID를 반환하고 사용 횟수 제한이 설정된 초대를 생성해야 한다.

**테스트 시나리오:**
- 정상 케이스: 기본 maxUses(10)로 링크 초대 생성
- 정상 케이스: 사용자 지정 maxUses 설정
- E2E 모드: 모킹된 초대 생성
- 오류 케이스: Firebase 미초기화

#### REQ-003: 초대 수락 테스트

**EARS 패턴**: 상태 기반 (State-Driven)

> **IF** 초대가 pending 상태이고 만료되지 않았으면 **THEN** `acceptInvitation()` 함수는 사용자를 팀에 추가하고 true를 반환해야 한다.

**테스트 시나리오:**
- 정상 케이스: 유효한 초대 수락
- 오류 케이스: 만료된 초대
- 오류 케이스: 이미 처리된 초대 (pending 아님)
- 오류 케이스: 링크 초대의 최대 사용 횟수 초과
- 오류 케이스: 이메일 초대의 이메일 불일치

#### REQ-004: 헬퍼 함수 테스트

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** 초대 관련 헬퍼 함수들이 예상대로 동작해야 한다.

**테스트 대상:**
- `generateInvitationLink()`: URL 형식 검증
- `isInvitationExpired()`: 만료 여부 검증 (경계값 테스트)
- `createExpirationDate()`: 6일 23시간 후 날짜 검증

---

### 3.2 P1 - Critical: teamStore 테스트 (4 SP)

#### REQ-005: 팀 생성 테스트

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** `createTeam()` 함수가 유효한 팀 이름으로 호출되면 **THEN** 시스템은 팀 ID를 반환하고 `teams` 상태를 업데이트해야 한다.

**테스트 시나리오:**
- 정상 케이스: 이름만으로 팀 생성
- 정상 케이스: 이름과 설명으로 팀 생성
- E2E 모드: 모킹된 팀 생성
- 오류 케이스: 빈 이름
- 오류 케이스: 이름 100자 초과 (truncation 검증)

#### REQ-006: 팀 CRUD 테스트

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** 팀 소유자가 `updateTeam()`, `deleteTeam()` 함수를 호출하면 **THEN** 시스템은 해당 작업을 수행하고 상태를 업데이트해야 한다.

**테스트 시나리오:**
- `updateTeam()`: 이름 수정, 설명 수정, 설정 수정
- `deleteTeam()`: 팀 삭제 및 currentTeam 상태 초기화
- `leaveTeam()`: 팀 탈퇴 및 memberCount 감소

#### REQ-007: 멤버 관리 테스트

**EARS 패턴**: 상태 기반 (State-Driven)

> **IF** 사용자가 팀의 owner 또는 admin 역할이면 **THEN** `updateMemberRole()`, `removeMember()` 함수를 사용하여 멤버를 관리할 수 있어야 한다.

**테스트 시나리오:**
- `updateMemberRole()`: 역할 변경 (owner 역할로 변경 시도 방지 검증)
- `removeMember()`: 멤버 제거 (owner 제거 시도 방지 검증)

---

### 3.3 P2 - High: themeStore 테스트 (1 SP)

#### REQ-008: 테마 토글 테스트

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** `toggleTheme()` 함수가 호출되면 **THEN** 시스템은 `isDark` 상태를 반전시켜야 한다.

**테스트 시나리오:**
- 초기 상태: isDark = false
- 토글 후: isDark = true
- 재토글 후: isDark = false
- localStorage 영속화 검증

#### REQ-009: 테마 초기 상태 테스트

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** 기본 테마 상태(isDark: false)로 초기화되어야 한다.

---

### 3.4 P2 - High: authStore 커버리지 확장 (3 SP)

#### REQ-010: E2E 모드 인증 테스트

**EARS 패턴**: 상태 기반 (State-Driven)

> **IF** E2E 테스트 모드가 활성화되면 **THEN** 인증 함수들은 모킹된 사용자 데이터를 반환해야 한다.

**테스트 시나리오:**
- E2E 모드에서 signIn: mockUser 반환
- E2E 모드에서 signUp: mockUser 반환
- E2E 모드에서 logout: user null 설정

#### REQ-011: 에러 핸들링 테스트

**EARS 패턴**: 금지 (Unwanted)

> 시스템은 인증 오류 메시지를 사용자에게 노출**하지 않아야 하며**, 일반화된 오류 메시지를 표시해야 한다.

**테스트 시나리오:**
- 잘못된 이메일/비밀번호: 적절한 오류 메시지
- 네트워크 오류: 일반화된 오류 메시지
- 중복 이메일 가입 시도: 적절한 오류 메시지

---

## 4. 명세 (Specifications)

### 4.1 테스트 파일 구조

```
src/store/
├── authStore.ts
├── authStore.test.ts        # 기존 (확장)
├── invitationStore.ts
├── invitationStore.test.ts  # 신규 (0% → 70%+)
├── teamStore.ts
├── teamStore.test.ts        # 기존 (확장, 13% → 60%+)
├── themeStore.ts
├── themeStore.test.ts       # 신규 (0% → 90%+)
├── presetStore.ts
├── presetStore.test.ts      # 기존 (유지)
├── todoStore.ts
└── todoStore.test.ts        # 기존 (유지)
```

### 4.2 공통 테스트 유틸리티

**파일**: `src/test/setup.ts`

```typescript
// Zustand store 상태 초기화 유틸리티
export function resetStoreState<T>(store: { getState: () => T; setState: (state: Partial<T>) => void }, initialState: Partial<T>) {
  store.setState(initialState);
}

// Firebase 모킹 유틸리티
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
  onSnapshot: vi.fn(),
};
```

### 4.3 invitationStore 테스트 명세

**파일**: `src/store/invitationStore.test.ts`

```typescript
// 테스트 구조
describe('invitationStore', () => {
  describe('Initial State', () => { /* ... */ });
  describe('createEmailInvitation', () => { /* ... */ });
  describe('createLinkInvitation', () => { /* ... */ });
  describe('acceptInvitation', () => { /* ... */ });
  describe('declineInvitation', () => { /* ... */ });
  describe('revokeInvitation', () => { /* ... */ });
  describe('Helper Functions', () => {
    describe('generateInvitationLink', () => { /* ... */ });
    describe('isInvitationExpired', () => { /* ... */ });
  });
  describe('E2E Mode', () => { /* ... */ });
});
```

### 4.4 teamStore 테스트 명세

**파일**: `src/store/teamStore.test.ts` (확장)

```typescript
// 기존 테스트 유지 + 추가 테스트
describe('teamStore', () => {
  describe('Initial State', () => { /* 기존 */ });
  describe('createTeam', () => { /* 확장 */ });
  describe('updateTeam', () => { /* 신규 */ });
  describe('deleteTeam', () => { /* 신규 */ });
  describe('leaveTeam', () => { /* 신규 */ });
  describe('updateMemberRole', () => { /* 신규 */ });
  describe('removeMember', () => { /* 신규 */ });
  describe('E2E Mode', () => { /* 확장 */ });
});
```

### 4.5 themeStore 테스트 명세

**파일**: `src/store/themeStore.test.ts`

```typescript
describe('themeStore', () => {
  describe('Initial State', () => {
    it('should have isDark as false by default');
    it('should have toggleTheme function');
  });

  describe('toggleTheme', () => {
    it('should toggle isDark from false to true');
    it('should toggle isDark from true to false');
    it('should persist state to localStorage');
  });
});
```

### 4.6 구현 우선순위

| 우선순위 | 요구사항 | 스토리 포인트 | 의존성 |
|----------|----------|---------------|--------|
| 1 | REQ-008, REQ-009 (themeStore) | 1 SP | 없음 |
| 2 | REQ-001, REQ-004 (invitation 헬퍼/이메일) | 2 SP | 없음 |
| 3 | REQ-002, REQ-003 (invitation 링크/수락) | 3 SP | REQ-001 |
| 4 | REQ-005 (team 생성) | 2 SP | 없음 |
| 5 | REQ-006, REQ-007 (team CRUD/멤버) | 2 SP | REQ-005 |
| 6 | REQ-010, REQ-011 (authStore 확장) | 3 SP | 없음 |

---

## 5. 위험 평가

### 5.1 기술적 위험

| 위험 | 발생 확률 | 영향도 | 완화 전략 |
|------|----------|--------|-----------|
| Firebase 모킹 복잡성 | Medium | High | 기존 authStore.test.ts 패턴 참조, vi.mock 활용 |
| 비동기 테스트 안정성 | Medium | Medium | async/await 패턴 일관 적용, waitFor 활용 |
| 상태 격리 실패 | Low | High | beforeEach에서 store 상태 완전 초기화 |
| 구독 함수 테스트 어려움 | High | Medium | onSnapshot 모킹, 콜백 검증으로 대체 |
| localStorage 모킹 | Low | Low | Vitest jsdom 환경에서 기본 지원 |

### 5.2 일정 위험

| 위험 | 발생 확률 | 영향도 | 완화 전략 |
|------|----------|--------|-----------|
| Firebase 배치 연산 모킹 복잡 | Medium | Medium | 핵심 로직 우선 테스트, 통합 테스트 분리 |
| 예상보다 많은 엣지 케이스 | Medium | Low | 핵심 경로 우선, 점진적 확장 |

---

## 6. 품질 기준 (TRUST 5)

### 6.1 Tested (테스트됨)

- [ ] invitationStore 커버리지 70%+ 달성
- [ ] teamStore 커버리지 60%+ 달성
- [ ] themeStore 커버리지 90%+ 달성
- [ ] authStore 커버리지 60%+ 달성
- [ ] 전체 커버리지 60%+ 달성
- [ ] 모든 유닛 테스트 통과
- [ ] 기존 E2E 테스트 100% 통과

### 6.2 Readable (읽기 쉬움)

- [ ] 테스트 케이스명이 동작을 명확히 설명
- [ ] describe 블록으로 논리적 그룹화
- [ ] AAA (Arrange-Act-Assert) 패턴 적용
- [ ] 공통 설정은 beforeEach로 추출

### 6.3 Unified (통일됨)

- [ ] 기존 authStore.test.ts 패턴 일관 적용
- [ ] 모킹 패턴 통일 (vi.mock, vi.fn)
- [ ] 에러 핸들링 테스트 패턴 통일

### 6.4 Secured (보안됨)

- [ ] 테스트에 실제 Firebase 자격 증명 미포함
- [ ] 모킹된 환경에서만 테스트 실행
- [ ] 민감 정보 로깅 테스트 미포함

### 6.5 Trackable (추적 가능)

- [ ] 각 REQ에 대응하는 테스트 케이스 존재
- [ ] 커버리지 리포트로 진행 상황 추적
- [ ] 커밋 메시지에 SPEC-TEST-001 태그 포함

---

## 7. 관련 문서

- `.moai/specs/SPEC-REFACTOR-001/`: 이전 리팩토링 SPEC (완료 85%)
- `.moai/project/tech.md`: 기술 스택 문서
- `vitest.config.ts`: Vitest 구성 파일
- `src/store/authStore.test.ts`: 기존 테스트 패턴 참조

---

## 8. 완료 정의 (Definition of Done)

- [ ] 모든 요구사항(REQ-001 ~ REQ-011)에 대한 테스트 작성 완료
- [ ] 목표 커버리지 달성 (전체 60%+)
- [ ] 모든 테스트 통과 (`npm run test:unit`)
- [ ] 기존 E2E 테스트 통과 (`npm run test`)
- [ ] 커버리지 리포트 생성 (`npm run test:coverage`)
- [ ] 코드 리뷰 완료
- [ ] SPEC-TEST-001 태그로 커밋

---

마지막 업데이트: 2026-01-29
