# SPEC-TEST-001: 구현 계획

## 추적성 태그

```
TAG: SPEC-TEST-001
TYPE: Implementation Plan
VERSION: 1.0.0
```

---

## 1. 마일스톤

### Milestone 1: 기초 설정 및 themeStore 테스트 (1 SP)

**우선순위**: Primary Goal

**범위:**
- themeStore 테스트 파일 생성
- 초기 상태 테스트
- toggleTheme 테스트
- localStorage 영속화 테스트

**대상 파일:**
- `src/store/themeStore.test.ts` (신규)

**예상 커버리지 증가:**
- themeStore: 0% -> 90%+
- 전체: +0.5%

---

### Milestone 2: invitationStore 헬퍼 함수 테스트 (2 SP)

**우선순위**: Primary Goal

**범위:**
- invitationStore 테스트 파일 생성
- 헬퍼 함수 테스트 (generateInvitationLink, isInvitationExpired)
- createEmailInvitation 테스트
- Firebase 모킹 패턴 확립

**대상 파일:**
- `src/store/invitationStore.test.ts` (신규)

**예상 커버리지 증가:**
- invitationStore: 0% -> 30%
- 전체: +3%

---

### Milestone 3: invitationStore 핵심 액션 테스트 (3 SP)

**우선순위**: Secondary Goal

**범위:**
- createLinkInvitation 테스트
- acceptInvitation 테스트
- declineInvitation/revokeInvitation 테스트
- E2E 모드 분기 테스트

**대상 파일:**
- `src/store/invitationStore.test.ts` (확장)

**예상 커버리지 증가:**
- invitationStore: 30% -> 70%+
- 전체: +7%

---

### Milestone 4: teamStore CRUD 테스트 (2 SP)

**우선순위**: Secondary Goal

**범위:**
- createTeam 테스트 확장
- updateTeam 테스트
- deleteTeam 테스트
- leaveTeam 테스트

**대상 파일:**
- `src/store/teamStore.test.ts` (확장)

**예상 커버리지 증가:**
- teamStore: 13% -> 40%
- 전체: +4%

---

### Milestone 5: teamStore 멤버 관리 테스트 (2 SP)

**우선순위**: Final Goal

**범위:**
- updateMemberRole 테스트
- removeMember 테스트
- E2E 모드 분기 테스트

**대상 파일:**
- `src/store/teamStore.test.ts` (확장)

**예상 커버리지 증가:**
- teamStore: 40% -> 60%+
- 전체: +3%

---

### Milestone 6: authStore 커버리지 확장 (3 SP)

**우선순위**: Final Goal

**범위:**
- E2E 모드 인증 테스트
- 추가 에러 핸들링 테스트
- 엣지 케이스 테스트

**대상 파일:**
- `src/store/authStore.test.ts` (확장)

**예상 커버리지 증가:**
- authStore: 31% -> 60%+
- 전체: +4%

---

## 2. 기술적 접근 방식

### 2.1 테스트 환경 구성

**Vitest 설정 활용:**
```typescript
// 기존 vitest.config.ts 설정 활용
// - environment: 'jsdom'
// - globals: true
// - setupFiles: ['./vitest.setup.ts']
```

**모킹 전략:**
```typescript
// Firebase 모킹 패턴
vi.mock('@/lib/firebase', () => ({
  db: null,
  auth: null,
}));

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: vi.fn(() => false),
  convertTimestamp: vi.fn((ts) => ts ? new Date().toISOString() : null),
}));
```

### 2.2 테스트 작성 패턴

**AAA 패턴 (Arrange-Act-Assert):**
```typescript
it('should create email invitation in E2E mode', async () => {
  // Arrange
  vi.mocked(isE2ETestMode).mockReturnValue(true);
  const store = useInvitationStore.getState();

  // Act
  const result = await store.createEmailInvitation(
    'team-123',
    'Test Team',
    'test@example.com',
    'editor',
    'user-123'
  );

  // Assert
  expect(result).toMatch(/^mock-invitation-/);
  expect(store.teamInvitations).toHaveLength(1);
});
```

**상태 초기화 패턴:**
```typescript
beforeEach(() => {
  // Store 상태 초기화
  useInvitationStore.setState({
    pendingInvitations: [],
    teamInvitations: [],
    isLoading: false,
  });

  // 모킹 초기화
  vi.clearAllMocks();
});
```

### 2.3 Firebase 배치 연산 모킹

```typescript
const mockBatch = {
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

vi.mock('firebase/firestore', () => ({
  writeBatch: vi.fn(() => mockBatch),
  doc: vi.fn(),
  collection: vi.fn(),
  // ... 기타 함수
}));
```

---

## 3. 아키텍처 설계 방향

### 3.1 테스트 파일 구조

```
src/
├── store/
│   ├── invitationStore.ts
│   ├── invitationStore.test.ts    # 신규: ~200 lines
│   ├── teamStore.ts
│   ├── teamStore.test.ts          # 확장: +150 lines
│   ├── themeStore.ts
│   ├── themeStore.test.ts         # 신규: ~50 lines
│   ├── authStore.ts
│   └── authStore.test.ts          # 확장: +100 lines
└── test/
    └── utils/
        └── mockFirebase.ts        # 선택적: 공통 모킹 유틸
```

### 3.2 테스트 그룹화 전략

```typescript
// 기능별 그룹화
describe('invitationStore', () => {
  describe('Initial State', () => { /* 초기 상태 검증 */ });
  describe('Actions', () => {
    describe('createEmailInvitation', () => { /* ... */ });
    describe('createLinkInvitation', () => { /* ... */ });
    // ...
  });
  describe('Helpers', () => {
    describe('generateInvitationLink', () => { /* ... */ });
    describe('isInvitationExpired', () => { /* ... */ });
  });
  describe('E2E Mode', () => { /* E2E 모드 특화 테스트 */ });
});
```

---

## 4. 위험 및 대응 계획

### 4.1 기술적 위험 대응

| 위험 | 대응 전략 |
|------|-----------|
| Firebase onSnapshot 모킹 어려움 | 구독 함수 테스트 제외, 액션 함수에 집중 |
| 비동기 테스트 불안정 | waitFor, flushPromises 활용 |
| Zustand persist 테스트 | localStorage 직접 검증 |

### 4.2 롤백 계획

각 마일스톤은 독립적으로 커밋되어 필요시 개별 롤백 가능:
- `feat(test): add themeStore tests`
- `feat(test): add invitationStore helper tests`
- `feat(test): add invitationStore action tests`
- `feat(test): extend teamStore tests`
- `feat(test): extend authStore tests`

---

## 5. 검증 방법

### 5.1 커버리지 검증

```bash
# 단위 테스트 실행
npm run test:unit

# 커버리지 리포트 생성
npm run test:coverage

# 특정 파일 커버리지 확인
npx vitest --coverage --reporter=verbose src/store/invitationStore.test.ts
```

### 5.2 회귀 테스트

```bash
# 전체 테스트 실행 (유닛 + E2E)
npm run test:unit && npm run test

# CI 환경 테스트
npm run test:ci
```

---

## 6. 담당 에이전트

| 마일스톤 | 담당 에이전트 |
|----------|---------------|
| M1: themeStore | expert-testing |
| M2: invitation 헬퍼 | expert-testing |
| M3: invitation 액션 | expert-testing |
| M4: team CRUD | expert-testing |
| M5: team 멤버 | expert-testing |
| M6: auth 확장 | expert-testing |
| 품질 검증 | manager-quality |

---

마지막 업데이트: 2026-01-29
