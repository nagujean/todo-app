# SPEC-TEST-001: 인수 기준

## 추적성 태그

```
TAG: SPEC-TEST-001
TYPE: Acceptance Criteria
VERSION: 1.0.0
```

---

## 1. 기능 인수 기준

### AC-001: invitationStore - 이메일 초대 생성

#### 시나리오 1: 정상 이메일 초대 생성 (E2E 모드)

```gherkin
Given E2E 테스트 모드가 활성화되어 있고
  And 유효한 팀 정보가 있을 때
When createEmailInvitation("team-123", "Test Team", "user@example.com", "editor", "owner-123")를 호출하면
Then 초대 ID가 "mock-invitation-"으로 시작해야 하고
  And teamInvitations 배열에 새 초대가 추가되어야 하고
  And 초대 타입이 "email"이어야 한다
```

#### 시나리오 2: 빈 이메일로 초대 생성 실패

```gherkin
Given 이메일이 빈 문자열일 때
When createEmailInvitation을 호출하면
Then null을 반환해야 하고
  And teamInvitations 배열이 변경되지 않아야 한다
```

#### 시나리오 3: 유효하지 않은 이메일 형식

```gherkin
Given 이메일 형식이 유효하지 않을 때 (예: "invalid-email")
When createEmailInvitation을 호출하면
Then null을 반환해야 한다
```

---

### AC-002: invitationStore - 링크 초대 생성

#### 시나리오 1: 기본 링크 초대 생성 (E2E 모드)

```gherkin
Given E2E 테스트 모드가 활성화되어 있고
  And 유효한 팀 정보가 있을 때
When createLinkInvitation("team-123", "Test Team", "viewer", "owner-123")를 호출하면
Then 초대 ID가 "mock-link-invitation-"으로 시작해야 하고
  And maxUses가 기본값 10이어야 하고
  And uses가 0이어야 한다
```

#### 시나리오 2: 사용자 지정 maxUses로 링크 초대 생성

```gherkin
Given maxUses가 5로 지정되었을 때
When createLinkInvitation을 호출하면
Then 생성된 초대의 maxUses가 5여야 한다
```

---

### AC-003: invitationStore - 초대 수락

#### 시나리오 1: 만료된 초대 수락 거부

```gherkin
Given 초대의 expiresAt이 현재 시간보다 이전일 때
When acceptInvitation을 호출하면
Then false를 반환해야 한다
```

#### 시나리오 2: 이미 처리된 초대 수락 거부

```gherkin
Given 초대의 status가 "accepted"일 때
When acceptInvitation을 호출하면
Then false를 반환해야 한다
```

#### 시나리오 3: 이메일 불일치 시 수락 거부

```gherkin
Given 초대 타입이 "email"이고
  And 초대 이메일이 "invited@example.com"일 때
When 다른 이메일 "other@example.com"으로 acceptInvitation을 호출하면
Then false를 반환해야 한다
```

---

### AC-004: invitationStore - 헬퍼 함수

#### 시나리오 1: 초대 링크 URL 생성

```gherkin
Given window.location.origin이 "https://example.com"일 때
When generateInvitationLink("inv-123")를 호출하면
Then "https://example.com/join/inv-123"을 반환해야 한다
```

#### 시나리오 2: 만료 여부 확인 - 만료됨

```gherkin
Given 과거 날짜 문자열이 주어졌을 때
When isInvitationExpired를 호출하면
Then true를 반환해야 한다
```

#### 시나리오 3: 만료 여부 확인 - 유효함

```gherkin
Given 미래 날짜 문자열이 주어졌을 때
When isInvitationExpired를 호출하면
Then false를 반환해야 한다
```

---

### AC-005: teamStore - 팀 생성

#### 시나리오 1: E2E 모드에서 팀 생성

```gherkin
Given E2E 테스트 모드가 활성화되어 있을 때
When createTeam("My Team", "Description")을 호출하면
Then 팀 ID가 "mock-team-"으로 시작해야 하고
  And teams 배열에 새 팀이 추가되어야 하고
  And memberCount가 1이어야 한다
```

#### 시나리오 2: 빈 이름으로 팀 생성 실패

```gherkin
Given 팀 이름이 빈 문자열일 때
When createTeam("")을 호출하면
Then null을 반환해야 한다
```

#### 시나리오 3: 100자 초과 이름 자르기

```gherkin
Given 팀 이름이 120자일 때
When createTeam을 호출하면
Then 생성된 팀 이름이 100자로 잘려야 한다
```

---

### AC-006: teamStore - 팀 CRUD

#### 시나리오 1: 팀 삭제 후 currentTeam 초기화

```gherkin
Given currentTeamId가 삭제할 팀 ID와 같을 때
When deleteTeam을 호출하면
Then currentTeamId가 null이어야 하고
  And currentTeam이 null이어야 하고
  And members 배열이 비어야 한다
```

#### 시나리오 2: 팀 탈퇴

```gherkin
Given 사용자가 팀의 멤버일 때
When leaveTeam을 호출하면
Then 성공적으로 완료되어야 한다
```

---

### AC-007: teamStore - 멤버 관리

#### 시나리오 1: owner 역할로 변경 시도 방지

```gherkin
Given newRole이 "owner"일 때
When updateMemberRole을 호출하면
Then 아무 작업도 수행하지 않아야 한다 (조기 반환)
```

#### 시나리오 2: owner 멤버 제거 시도 방지

```gherkin
Given 제거 대상 멤버의 role이 "owner"일 때
When removeMember를 호출하면
Then 아무 작업도 수행하지 않아야 한다 (조기 반환)
```

---

### AC-008: themeStore - 테마 토글

#### 시나리오 1: 다크 모드로 전환

```gherkin
Given isDark가 false일 때
When toggleTheme()을 호출하면
Then isDark가 true여야 한다
```

#### 시나리오 2: 라이트 모드로 전환

```gherkin
Given isDark가 true일 때
When toggleTheme()을 호출하면
Then isDark가 false여야 한다
```

#### 시나리오 3: localStorage 영속화

```gherkin
Given toggleTheme을 호출했을 때
When localStorage를 확인하면
Then "theme-storage" 키에 상태가 저장되어 있어야 한다
```

---

### AC-009: themeStore - 초기 상태

#### 시나리오 1: 기본 초기 상태

```gherkin
Given 스토어가 초기화되었을 때
Then isDark가 false여야 하고
  And toggleTheme 함수가 존재해야 한다
```

---

### AC-010: authStore - E2E 모드 인증

#### 시나리오 1: E2E 모드에서 로그인

```gherkin
Given E2E 테스트 모드가 활성화되어 있을 때
When signIn을 호출하면
Then mockUser가 user 상태에 설정되어야 하고
  And loading이 false여야 한다
```

#### 시나리오 2: E2E 모드에서 로그아웃

```gherkin
Given E2E 테스트 모드가 활성화되어 있고
  And 사용자가 로그인되어 있을 때
When logout을 호출하면
Then user가 null이어야 한다
```

---

### AC-011: authStore - 에러 핸들링

#### 시나리오 1: Firebase 미설정 시 오류

```gherkin
Given Firebase가 설정되지 않았을 때 (auth가 null)
When signIn을 호출하면
Then error가 "Firebase가 설정되지 않았습니다."여야 한다
```

---

## 2. 품질 인수 기준

### QC-001: 커버리지 목표

```gherkin
Given 모든 테스트가 작성되었을 때
When npm run test:coverage를 실행하면
Then invitationStore 커버리지가 70% 이상이어야 하고
  And teamStore 커버리지가 60% 이상이어야 하고
  And themeStore 커버리지가 90% 이상이어야 하고
  And authStore 커버리지가 60% 이상이어야 하고
  And 전체 커버리지가 60% 이상이어야 한다
```

### QC-002: 테스트 실행 시간

```gherkin
Given 모든 유닛 테스트가 존재할 때
When npm run test:unit을 실행하면
Then 총 실행 시간이 60초 이내여야 한다
```

### QC-003: 테스트 통과율

```gherkin
Given 모든 테스트가 작성되었을 때
When npm run test:unit을 실행하면
Then 모든 테스트가 통과해야 한다 (0 failures)
```

### QC-004: E2E 테스트 회귀

```gherkin
Given 유닛 테스트가 모두 통과했을 때
When npm run test (E2E)를 실행하면
Then 기존 E2E 테스트가 모두 통과해야 한다
```

---

## 3. 검증 체크리스트

### 기능 검증

- [ ] AC-001: invitationStore 이메일 초대 생성 테스트 통과
- [ ] AC-002: invitationStore 링크 초대 생성 테스트 통과
- [ ] AC-003: invitationStore 초대 수락 테스트 통과
- [ ] AC-004: invitationStore 헬퍼 함수 테스트 통과
- [ ] AC-005: teamStore 팀 생성 테스트 통과
- [ ] AC-006: teamStore 팀 CRUD 테스트 통과
- [ ] AC-007: teamStore 멤버 관리 테스트 통과
- [ ] AC-008: themeStore 테마 토글 테스트 통과
- [ ] AC-009: themeStore 초기 상태 테스트 통과
- [ ] AC-010: authStore E2E 모드 테스트 통과
- [ ] AC-011: authStore 에러 핸들링 테스트 통과

### 품질 검증

- [ ] QC-001: 목표 커버리지 달성
- [ ] QC-002: 테스트 실행 시간 60초 이내
- [ ] QC-003: 모든 유닛 테스트 통과
- [ ] QC-004: 기존 E2E 테스트 회귀 없음

### TRUST 5 검증

- [ ] Tested: 목표 커버리지 달성
- [ ] Readable: AAA 패턴 및 명확한 테스트명
- [ ] Unified: 일관된 모킹 패턴 적용
- [ ] Secured: 실제 자격 증명 미포함
- [ ] Trackable: SPEC 태그 커밋

---

## 4. 테스트 실행 명령어

```bash
# 전체 유닛 테스트
npm run test:unit

# 커버리지 리포트 생성
npm run test:coverage

# 특정 파일 테스트
npx vitest src/store/invitationStore.test.ts

# Watch 모드
npm run test:unit -- --watch

# E2E 회귀 테스트
npm run test
```

---

마지막 업데이트: 2026-01-29
