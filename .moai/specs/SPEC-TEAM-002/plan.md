---
id: SPEC-TEAM-002
phase: implementation
priority: MEDIUM
estimated_effort: 8-12 hours
---

# 구현 계획

## 마일스톤

### Milestone 1: 기반 구조 및 타입 정의 (Priority: HIGH)
- [ ] 통합 팀 관리 시트 컴포넌트 생성 (`IntegratedTeamManagementSheet.tsx`)
- [ ] 시트 내부 섹션 컴포넌트 정의 (HeaderSection, MembersSection, SettingsSection, DangerZoneSection)
- [ ] 역할 기반 권한 확인 훅 구현
- [ ] TypeScript 인터페이스 정의

- [ ] 기존 컴포넌트 타입 호환성 확인

**예상 결과**: 재사용 가능한 기반 구조로 일관된 사용자 경험 제공

**의존성**: teamStore, authStore, UI 컴포넌트

---

### Milestone 2: 컴포넌트 통합 및 렌더링 (Priority: HIGH)
- [ ] HeaderSection 구현 (팀 정보 표시)
- [ ] MembersSection 구현
  - [ ] TeamMembers 컴포넌트 통합
  - [ ] 역할 변경 기능 연결
  - [ ] 팀원 내보내기 기능 연결
- [ ] SettingsSection 구현 (Owner/Admin only)
  - [ ] 팀 이름/설명 수정 폼
  - [ ] 저장 기능
- [ ] DangerZoneSection 구현
  - [ ] DeleteTeamDialog 통합 (Owner only)
  - [ ] LeaveTeamDialog 통합 (Non-owner)

**예상 결과**: 기존 컴포넌트들이 새 구조에 맞춰 조정
**의존성**: Milestone 1 완료

---

### Milestone 3: 진입점 수정 (Priority: MEDIUM)
- [ ] UserMenu에서 "팀 관리" 메뉴 항목 추가
- [ ] TeamSwitcher에서 기존 TeamManagementMenu 제거
- [ ] 새로운 진입점에서 IntegratedTeamManagementSheet 연결
- [ ] 레거시 UI 제거 및 정리

**예상 결과**: 단일 진입점으로 모든 팀 관리 기능 통합
**의존성**: Milestone 2 완료
---

### Milestone 4: 테스트 및 검증 (Priority: HIGH)
- [ ] 단위 테스트 작성
  - [ ] 권한 기반 렌더링 테스트
  - [ ] 이벤트 핸들러 테스트
  - [ ] 상태 관리 테스트
- [ ] 통합 테스트 작성
  - [ ] 전체 사용자 흐름 테스트
  - [ ] 권한 시나리오 테스트
- [ ] E2E 테스트 (선택적)
  - [ ] 크로스 브라우저 테스트
  - [ ] 모바일 반응형 테스트
- [ ] 접근성 테스트 (WCAG 2.1)

  - [ ] 키보드 네비게이션 테스트
  - [ ] 스크린 리더기 테스트

- [ ] 코드 품질 검증
  - [ ] TypeScript 타입 검사
  - [ ] ESLint 실행
  - [ ] 85% 테스트 커버리 달성

  - [ ] 빌드 성공 확인

**예상 결과**: 85%+ 테스트 커버리, 모든 테스트 통과
**의존성**: Milestone 1, 2, 3 완료
---

## 파일 구조

### 신규 파일
```
src/components/team/
├── IntegratedTeamManagementSheet.tsx  # 통합 시트 컴포넌트 (신규)
```

### 수정 파일
```
src/components/auth/
└── UserMenu.tsx               # "팀 관리" 메뉴 항목 추가

src/components/team/
└── TeamSwitcher.tsx            # 기존 TeamManagementMenu 제거
```

### 재사용 파일 (수정 없음)
```
src/components/team/
├── InviteDialog.tsx            # 초대 다이얼로그 (재사용)
├── TeamMembers.tsx             # 멤버 리스트 (재사용)
├── DeleteTeamDialog.tsx        # 팀 삭제 다이얼로그 (재사용)
└── LeaveTeamDialog.tsx         # 팀 탈퇴 다이얼로그 (재사용)
```

---

## 기술 접근법

### UI 아키텍처: Sheet 컴포넌트 패턴
- **Shadcn/ui Sheet** 컴포넌트를 기반으로 채택
- **세로 레이아웃**: 섹션별로 구분된 단일 페이지 디자인
- **반응형**: 모바일에서는 전체 화면, 데스크톱에서는 사이드 시트
- **접근성**: 포커 트랩, 키보드 네비게이션 지원

### 상태 관리
- **Zustand**: 기존 teamStore 활용
- **로컬 상태**: useState for UI-specific state (다이얼로그 열림/닫힘)
- **실시간 업데이트**: Firestore listeners for member list

### 권한 관리
```typescript
// 권한 확인 유틸리티 함수
function canPerformAction(action: TeamAction, userRole: TeamRole): boolean {
  const permissionMatrix = {
    invite: ['owner', 'admin'],
    removeMember: ['owner', 'admin'],
    changeRole: ['owner', 'admin'],
    updateSettings: ['owner', 'admin'],
    deleteTeam: ['owner'],
    leaveTeam: ['admin', 'editor', 'viewer']
  }
  return permissionMatrix[action].includes(userRole)
}
```

### 컴포넌트 재사용 전략
1. **InviteDialog**: 100% 재사용, props 전달만 수정
2. **TeamMembers**: 90% 재사용, wrapper 컴포넌트로 감싸기
3. **DeleteTeamDialog**: 100% 재사용
4. **LeaveTeamDialog**: 100% 재사용
5. **새 코드**: IntegratedTeamManagementSheet 컴포넌트 (약 200-300 lines)

---

## 의존성 분석

### 내부 의존성
- **teamStore**: 팀 데이터, 멤버 관리, 권한 확인
- **authStore**: 현재 사용자 정보
- **invitationStore**: 초대 링크 생성
- **UI 컴포넌트**: Button, Input, Dialog, Sheet (from shadcn/ui)

### 외부 의존성
- **Firebase Firestore**: 팀/멤버 데이터 저장소
- **Firebase Auth**: 사용자 인증
- **Lucide React**: 아이콘 라이브러리
- **Tailwind CSS**: 스타일링

---

## 위험 분석

### 기술적 위험
| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|-----------|
| 기존 컴포넌트 props 호환성 문제 | MEDIUM | HIGH | 타입 검사, 인터페이스 호환성 테스트 |
| 상태 동기화 이슈트 | MEDIUM | MEDIUM | 실시간 리스너, 낙관적 업데이트 |
| 권한 검증 누락 | HIGH | HIGH | 프론트엔드+백엔드 이중 검증 |
| 메모리 누수 (리스너 해제 누락) | LOW | MEDIUM | useEffect cleanup 함수 |

### 사용자 경험 위험
| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|-----------|
| 기존 사용자 혼란 (UI 변경) | MEDIUM | MEDIUM | 명확한 마이그레이션 가이드/툴팁 |
| 기능 발견 어려움 | LOW | HIGH | 명확한 메뉴 라벨링/아이콘 |
| 모바일 사용성 저하 | LOW | HIGH | 반응형 디자인/터치 최적화 |

### 데이터 무결성 위험
| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|-----------|
| 팀 삭제 시 데이터 손실 | LOW | HIGH | 확인 다이얼로그/팀 이름 입력 |
| 권한 없는 팀 삭제 시도 | LOW | CRITICAL | 백엔드 권한 검증/Firestore 규칙 |
| 멤버 제거 오류 | MEDIUM | MEDIUM | 확인 다이얼로그/트랜잭션 롤백 |

---

## 롤백 전략

### Phase 1: 문제 발견 시
- **자동 롤백**: Git revert to previous commit
- **수동 롤백**: 기존 UserMenu, TeamSwitcher 코드로 복원
- **데이터 백업**: Firestore snapshot (필요시)

### Phase 2: 심각한 버그 발견 시
- **기능 비활성화**: IntegratedTeamManagementSheet 숍
- **기존 기능 복원**: UserMenu  TeamSwitcher 드롭다운 복원
- **사용자 공지**: "일시적으로 팀 관리 기능이 제한됩니다" 메시지
### Phase 3: 치명적 오류 시
- **전체 롤백**: release branch rollback
- **핫픽스 대응**: 고객 지원 팀 알림
- **데이터 복구**: Firestore backup restore (삭제된 팀 데이터)
---

## 성공 지표 (KPIs)
1. **개발 효율성**:
   - 컴포넌트 재사용률: > 80%
   - 새로 작성된 코드: < 300 lines
   - 개발 시간: 8-12 hours

2. **코드 품질**:
   - TypeScript 에러: 0
   - 테스트 커버리지: > 85%
   - ESLint 경고: 0

3. **사용자 경험**:
   - 기능 발견 시간: < 5 seconds
   - 작업 완료 시간: < 30 seconds
   - 오류율: < 5%

4. **접근성**:
   - WCAG 2.1 준수율: 100%
   - 키보드 네비게이션: 100%
   - 스크린 리더기 호환: 100%
