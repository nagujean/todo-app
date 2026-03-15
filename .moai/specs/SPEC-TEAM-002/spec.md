---
id: SPEC-TEAM-002
version: "1.0.0"
status: draft
created: 2026-03-15
updated: 2026-03-15
author: MoAI
priority: MEDIUM
---

# SPEC-TEAM-002: 통합 팀 관리 메뉴

## HISTORY

| 날짜 | 버전 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 2026-03-15 | 1.0.0 | MoAI | 초기 SPEC 생성 |

---

## 개요

### 배경

현재 Todo 앱에서 팀 관리 기능이 여러 UI 진입점에 분산되어 있습니다:
- **UserMenu 드롭다운**: 팀원 관리, 초대 기능
- **TeamSwitcher 드롭다운**: 팀 삭제/탈퇴 기능

사용자가 모든 팀 관리 옵션을 한 곳에서 찾기 어려워 사용자 경험이 저하되고 있습니다.

### 목표

모든 팀 관리 기능을 **단일 통합 인터페이스**로 제공하여 다음을 달성합니다:
1. **통합 진입점**: 모든 팀 관리 기능에 대한 단일 접근 경로
2. **역할 기반 접근 제어**: 사용자 권한에 따른 적절한 메뉴 표시
3. **재사용 가능한 컴포넌트**: 기존 컴포넌트 활용으로 일관성 유지
4. **직관적 네비게이션**: 명확한 계층 구조와 사용자 흐름

### 범위

**포함 (In-Scope):**
- 통합 팀 관리 메뉴 UI 컴포넌트
- 팀원 초대 (이메일 및 링크)
- 팀원 리스트 확인 및 관리
- 팀원 내보내기 (Admin/Owner)
- 역할 변경 (Owner/Admin)
- 팀 설정 (Owner/Admin) - 이름, 설명 수정
- 팀 삭제 (Owner only)
- 팀 탈퇴 (Non-owner members)
- 권한 기반 UI 렌더링

**제외 (Out-of-Scope):**
- 팀 이관 (소유권 이전)
- 고급 팀 통계 및 분석
- 팀 활동 로그
- 타사 통합 (Slack, Discord 등)

---

## 요구사항 (EARS 형식)

### 1. Ubiquitous Requirements (보편적 요구사항)

**REQ-TEAM-002-001**: 시스템은 모든 팀 관리 메뉴 항목에 대해 현재 사용자의 권한을 확인하여 접근을 제어해야 한다.

**REQ-TEAM-002-002**: 시스템은 모든 파괴적 작업(팀 삭제, 팀원 내보내기)에 대해 확인 다이얼로그를 표시해야 한다.

**REQ-TEAM-002-003**: 시스템은 팀 관리 작업 완료 시 사용자에게 명확한 피드백을 제공해야 한다.

**REQ-TEAM-002-004**: 시스템은 팀 관리 메뉴가 열려 있는 동안 키보드 네비게이션(Escape 키로 닫기)을 지원해야 한다.

### 2. Event-Driven Requirements (이벤트 기반 요구사항)

**REQ-TEAM-002-005**: WHEN 사용자가 "팀 관리" 버튼을 클릭하면 THEN 통합 팀 관리 시트가 표시된다.

**REQ-TEAM-002-006**: WHEN 사용자가 "팀원 초대"를 클릭하면 THEN 기존 InviteDialog 컴포넌트가 표시된다.

**REQ-TEAM-002-007**: WHEN Admin 또는 Owner가 "팀원 내보내기"를 클릭하면 THEN 해당 팀원이 제거되고 멤버 리스트가 갱신된다.

**REQ-TEAM-002-008**: WHEN Owner 또는 Admin이 "역할 변경"을 선택하면 THEN 선택한 멤버의 역할이 변경되고 UI가 즉시 반영된다.

**REQ-TEAM-002-009**: WHEN Owner가 "팀 삭제"를 클릭하면 THEN DeleteTeamDialog가 표시되고 팀 이름 확인을 요구한다.

**REQ-TEAM-002-010**: WHEN Non-owner 멤버가 "팀 탈퇴"를 클릭하면 THEN LeaveTeamDialog가 표시된다.

**REQ-TEAM-002-011**: WHEN 팀 삭제 또는 탈퇴가 완료되면 THEN 사용자는 자동으로 개인 모드로 전환되고 팀 목록이 갱신된다.

### 3. State-Driven Requirements (상태 기반 요구사항)

**REQ-TEAM-002-012**: IF 사용자가 Owner 역할이면 모든 팀 관리 기능에 접근할 수 있다.

**REQ-TEAM-002-013**: IF 사용자가 Admin 역할이면 팀원 관리, 초대, 역할 변경, 팀 탈퇴가 가능하다.

**REQ-TEAM-002-014**: IF 사용자가 Editor 또는 Viewer 역할이면 팀원 리스트 확인과 팀 탈퇴만 가능하다.

**REQ-TEAM-002-015**: IF 현재 선택된 팀이 null이면 팀 관리 메뉴가 비활성화된다.

**REQ-TEAM-002-016**: IF 팀에 멤버가 없으면 멤버 리스트에 "팀 멤버가 없습니다" 메시지가 표시된다.

### 4. Optional Requirements (선택적 요구사항)

**REQ-TEAM-002-017**: WHERE POSSIBLE 팀 관리 메뉴에서 팀 이름과 설명을 직접 수정할 수 있는 기능을 제공한다 (Phase 2).

**REQ-TEAM-002-018**: WHERE POSSIBLE 팀 관리 메뉴에서 마지막 활동 시간을 표시한다.

**REQ-TEAM-002-019**: WHERE POSSIBLE 팀 관리 메뉴에서 멤버별 할 일 통계를 표시한다.

### 5. Unwanted Behavior (바람직하지 않은 동작)

**REQ-TEAM-002-020**: 시스템은 소유자가 아닌 사용자에게 팀 삭제 옵션을 표시해서는 안 된다.

**REQ-TEAM-002-021**: 시스템은 권한이 없는 사용자가 팀원을 내보내거나 역할을 변경하는 것을 허용해서는 안 된다.

**REQ-TEAM-002-022**: 시스템은 마지막 소유자가 팀에서 탈퇴하는 것을 허용해서는 안 된다.

**REQ-TEAM-002-023**: 시스템은 팀 관리 메뉴가 열려 있는 동안 백그라운드 클릭이 메뉴 외부 요소에 영향을 주어서는 안 된다.

**REQ-TEAM-002-024**: 시스템은 확인되지 않은 팀 삭제를 실행해서는 안 된다 (팀 이름 확인 필수).

---

## 기술 사양

### 프론트엔드 아키텍처

```
src/components/team/
├── TeamManagementSheet.tsx       # 신규: 통합 팀 관리 시트 컨테이너
├── TeamManagementMenu.tsx       # 기존: 팀별 관리 메뉴 (수정)
├── InviteDialog.tsx             # 기존: 팀원 초대 다이얼로그 (재사용)
├── TeamMembers.tsx              # 기존: 팀원 리스트 컴포넌트 (재사용)
├── DeleteTeamDialog.tsx         # 기존: 팀 삭제 다이얼로그 (재사용)
└── LeaveTeamDialog.tsx          # 기존: 팀 탈퇴 다이얼로그 (재사용)

src/components/layout/
└── Header.tsx                   # 수정: 통합 팀 관리 버튼 추가
```

### 컴포넌트 구조

#### 1. TeamManagementSheet.tsx (신규)

**목적**: 통합 팀 관리 인터페이스의 최상위 컨테이너

**Props**:
- `open: boolean` - 시트 열림 상태
- `onOpenChange: (open: boolean) => void` - 상태 변경 핸들러
- `teamId?: string` - 현재 선택된 팀 ID

**하위 컴포넌트**:
- 헤더 섹션 (팀 이름, 설명)
- 팀원 섹션 (TeamMembers 컴포넌트)
- 관리 기능 섹션 (권한 기반)
- 하단 액션 섹션 (팀 삭제/탈퇴)

#### 2. Header.tsx (수정)

**변경 사항**:
- "팀 관리" 버튼 추가 (설정 아이콘)
- TeamManagementSheet 상태 관리
- 기존 UserMenu에서 팀 관련 메뉴 제거

### 상태 관리

기존 `teamStore.ts` 활용:
- `currentTeam` - 현재 선택된 팀
- `members` - 팀 멤버 목록
- `getUserRole(teamId)` - 사용자 권한 확인
- `deleteTeam(teamId)` - 팀 삭제
- `leaveTeam(teamId)` - 팀 탈퇴
- `updateMemberRole(teamId, memberId, role)` - 역할 변경
- `removeMember(teamId, memberId)` - 멤버 제거

### 권한 체계

| 권한 | 팀원 보기 | 초대 | 내보내기 | 역할 변경 | 팀 설정 | 팀 삭제 | 팀 탈퇴 |
|------|----------|------|----------|----------|---------|---------|---------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Editor | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Firestore 보안 규칙

기존 규칙 활용, 추가 검증 없음:
```javascript
// teams/{teamId}
allow delete: if request.auth.uid == resource.data.ownerId;

// teams/{teamId}/members/{userId}
allow delete: if request.auth.uid == userId
              || request.auth.uid == resource.data.ownerId;
allow update: if request.auth.uid == resource.data.ownerId
              || get(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid)).data.role in ['owner', 'admin'];
```

---

## UI/UX 가이드라인

### 1. 통합 팀 관리 시트 디자인

**진입점**:
- 헤더 우측 "팀 관리" 버튼 (설정 아이콘)
- 위치: 사용자 프로필 아바타 왼쪽
- 툴팁: "팀 관리"

**시트 레이아웃**:
```
┌─────────────────────────────────────┐
│ [팀 이름]                      [X] │
│ [팀 설명]                           │
├─────────────────────────────────────┤
│ 팀원 (3)            [+ 초대]       │
│ ┌─────────────────────────────────┐ │
│ │ 👤 나 (Owner)                   │ │
│ │ 👤 user1@example.com (Editor)   │ │
│ │ 👤 user2@example.com (Viewer)   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 관리 기능                           │
│ • 팀원 관리                         │
│ • 팀 설정 (Owner/Admin)             │
├─────────────────────────────────────┤
│ 위험 구역                           │
│ • 팀 탈퇴 (Non-owner)              │
│ • 팀 삭제 (Owner only)             │
└─────────────────────────────────────┘
```

### 2. 권한 기반 UI 렌더링

**Owner 사용자**:
- 모든 섹션 표시
- 팀 삭제 버튼: 빨간색, 파괴적 스타일
- 팀 탈퇴 버튼: 표시 안 함

**Admin 사용자**:
- 팀원 관리, 팀 설정, 팀 탈퇴 섹션 표시
- 팀 삭제 섹션: 표시 안 함

**Editor/Viewer 사용자**:
- 팀원 보기, 팀 탈퇴만 표시
- 관리 기능 섹션: 회색으로 비활성화 표시

### 3. 다이얼로그 디자인

**팀 삭제 다이얼로그** (기존 DeleteTeamDialog 재사용):
- 제목: "팀 삭제"
- 내용: "정말로 이 팀을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
- 확인 입력: 팀 이름 입력 필드
- 경고: "삭제 시 모든 할 일과 멤버 정보가 함께 삭제됩니다."
- 버튼: [취소] [삭제]

**팀 탈퇴 다이얼로그** (기존 LeaveTeamDialog 재사용):
- 제목: "팀 탈퇴"
- 내용: "{팀이름}" 팀에서 탈퇴하시겠습니까?
- 안내: "탈퇴 후에도 팀의 다른 멤버들은 계속 이 팀을 사용할 수 있습니다."
- 버튼: [취소] [탈퇴]

---

## 제약사항

### 기술적 제약
1. **컴포넌트 재사용**: 기존 컴포넌트를 수정하지 않고 재사용
2. **상태 관리**: 기존 teamStore 패턴 준수
3. **타입 안전성**: TypeScript strict mode 준수
4. **반응형 디자인**: 모바일/데스크톱 호환

### UX 제약
1. **일관성**: 기존 UI 패턴과 디자인 시스템 준수
2. **접근성**: WCAG 2.1 AA 준수
3. **국제화**: 한국어 UI (ko)
4. **성능**: 60fps 애니메이션, < 100ms 응답 시간

### 보안 제약
1. **권한 검증**: 프론트엔드와 백엔드 모두 권한 검증
2. **데이터 무결성**: 팀 삭제 시 연관 데이터 일괄 삭제
3. **사용자 승인**: 파괴적 작업에 대한 명시적 확인

---

## 성공 기준

### 기능적 성공 기준
1. ✅ 사용자가 단일 진입점에서 모든 팀 관리 기능에 접근할 수 있다
2. ✅ Owner가 모든 팀 관리 기능을 사용할 수 있다
3. ✅ Admin이 팀원 관리 기능을 사용할 수 있다
4. ✅ Editor/Viewer가 팀원 보기와 팀 탈퇴를 할 수 있다
5. ✅ 모든 파괴적 작업에 확인 다이얼로그가 표시된다
6. ✅ 작업 완료 후 적절한 피드백이 사용자에게 전달된다

### 비기능적 성공 기준
1. ✅ 기존 컴포넌트 100% 재사용 (새 다이얼로그 작성 없음)
2. ✅ TypeScript 컴파일 에러 0개
3. ✅ ESLint 경고 0개
4. ✅ 테스트 커버리지 85% 이상
5. ✅ WCAG 2.1 AA 준수
6. ✅ 모바일 반응형 지원

### 사용자 경험 성공 기준
1. ✅ 팀 관리 기능 탐색 시간 50% 단축
2. ✅ 사용자 오류율 20% 감소
3. ✅ 기능 발견성 100% (모든 기능이 한 곳에)

---

## 참조

### 관련 파일
- 컴포넌트: `src/components/team/*.tsx`
- 상태 관리: `src/store/teamStore.ts`
- 제품 문서: `.moai/project/product.md`
- 기술 문서: `.moai/project/tech.md`

### 관련 SPEC
- SPEC-TEAM-001: 팀 관리 기능 (초기 구현)

### 외부 참조
- [Shadcn/ui Sheet 컴포넌트](https://ui.shadcn.com/docs/components/sheet)
- [Zustand 상태 관리](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
