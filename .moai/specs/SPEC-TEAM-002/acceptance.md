---
id: SPEC-TEAM-002
version: "1.0.0"
---

# 인수 테스트 시나리오

## 1. 팀 관리 메뉴 진입 테스트

### Scenario 1.1: Owner 권한으로 메뉴 접근
**Given**: 사용자가 Owner 권한으로 로그인됨
**When**: 사용자가 "팀 관리" 버튼을 클릭하면
**Then**: 다음 모든 메뉴 항목이 표시된다:
  - ✅ 팀원 초대
  - ✅ 팀원 리스트
  - ✅ 팀원 내보내기
  - ✅ 역할 변경
  - ✅ 팀 설정
  - ✅ 팀 삭제
  - ✅ 팀 탈퇴 (비활성화됨

```gherkin
  Feature: Team management menu
  As a Owner
  I want to access all team management features
  When I click "팀 관리" button
  Then I should see all menu items enabled
  And I should be able to delete team
  And the "팀 탈퇴 option should be disabled
```

### Scenario 1.2: Admin 권한으로 메뉴 접근
**Given**: 사용자가 Admin 권한으로 로그인됨
**When**: 사용자가 "팀 관리" 버튼을 클릭하면
**Then**: 다음 메뉴 항목이 표시된다:
  - ✅ 팀원 초대
  - ✅ 팀원 리스트
  - ✅ 팀원 내보내기
  - ✅ 역할 변경
  - ✅ 팀 설정
  - ❌ 팀 삭제 (비활성화)
  - ✅ 팀 탈퇴
```gherkin
  Feature: Team management menu
  as an Admin
  I want to access all team management features
  When I click "팀 관리" button
  Then I should see all menu items except "팀 삭제"
  And I should be able to leave team
```
### Scenario 1.3: Editor 권한으로 메뉴 접근
**Given**: 사용자가 Editor 권한으로 로그인됨
**When**: 사용자가 "팀 관리" 버튼을 클릭하면
**Then**: 다음 메뉴 항목이 표시된다:
  - ❌ 팀원 초대 (비활성화)
  - ✅ 팀원 리스트
  - ❌ 팀원 내보내기 (비활성화)
  - ❌ 역할 변경 (비활성화)
  - ❌ 팀 설정 (비활성화)
  - ❌ 팀 삭제 (비활성화)
  - ✅ 팀 탈퇴
```gherkin
  Feature: Team management menu
  as an Editor
  I want to access limited team management features
  When I click "팀 관리" button
  Then I should see only "팀원 리스트" and "팀 탈퇴" enabled
```
### Scenario 1.4: Viewer 권한으로 메뉴 접근
**Given**: 사용자가 Viewer 권한으로 로그인됨
**When**: 사용자가 "팀 관리" 버튼을 클릭하면
**Then**: 다음 메뉴 항목이 표시된다:
  - ❌ 팀원 초대 (비활성화)
  - ✅ 팀원 리스트
  - ❌ 팀원 내보내기 (비활성화)
  - ❌ 역할 변경 (비활성화)
  - ❌ 팀 설정 (비활성화)
  - ❌ 팀 삭제 (비활성화)
  - ✅ 팀 탈퇴
```gherkin
  Feature: Team management menu
  as a Viewer
  I want to access read-only team management features
  When I click "팀 관리" button
  Then I should see only "팀원 리스트" and "팀 탈퇴" enabled
```
---

## 2. 팀원 초대 기능 테스트

### Scenario 2.1: 이메일로 초대
**Given**: 사용자가 팀 관리 메뉴를 열고 Owner 또는 Admin 권한을 가짐
**When**: 사용자가 "팀원 초대"를 클릭하고 이메일 주소를 입력하여 초대를 보내면
**Then**:
  - ✅ InviteDialog 컴포넌트가 표시된다
  - ✅ 이메일 검증이 수행된다
  - ✅ 초대 이메일이 발송된다
  - ✅ 성공 메시지가 표시된다
  - ✅ 멤버 리스트에 초대 대기 상태가 표시된다
```gherkin
  Feature: Email invitation
  as an Owner or Admin
  I want to invite a new member
  When I click "팀원 초대"
  And enter email "test@example.com"
  And submit invitation
  Then I should see InviteDialog component
  And see email validation
  And receive success message
  And see "pending" status in member list
```
### Scenario 2.2: 링크로 초대
**Given**: 사용자가 팀 관리 메뉴를 열고 Owner 또는 Admin 권한을 가짐
**When**: 사용자가 "팀원 초대"를 클릭하고 "링크로 초대" 탭을 선택한 후 링크를 생성하면
**Then**:
  - ✅ 링크 생성 버튼이 표시된다
  - ✅ 링크가 생성된다
  - ✅ 링크 복사 버튼이 활성화된다
  - ✅ 링크가 클립보드에 복사된다
  - ✅ 성공 토스트 메시지가 표시된다
```gherkin
  Feature: Link invitation
  as an Owner or Admin
  I want to invite via link
  When I click "팀원 초대"
  And select "링크로 초대" tab
  And click "Generate Link"
  Then I should see link generated
  And be able to copy link to clipboard
  And see success toast message
```
### Scenario 2.3: 초대 실패 (권한 없음)
**Given**: 사용자가 Editor 또는 Viewer 권한을 가짤
**When**: 사용자가 "팀원 초대"를 클릭하려고 시도하면
**Then**:
  - ✅ "팀원 초대" 메뉴가 비활성화되어 있다
  - ✅ 클릭 시 아무런 반응이 발생하지 않는다
```gherkin
  Feature: Team member invitation
  as an Editor or Viewer
  I want to invite a team member
  When I click "팀원 초대"
  Then I should see the option disabled
  And clicking should have no effect
```
---

## 3. 팀원 내보내기 기능 테스트

### Scenario 3.1: Owner가 팀원 내보내기
**Given**: 사용자가 Owner 권한이고 팀에 3명 이상의 멤버가 존재함
**When**: Owner가 특정 멤버를 내보내기 위해 "제거" 버튼을 클릭하고 확인 다이얼로그에서 "제거"를 클릭하면
**Then**:
  - ✅ 확인 다이얼로그가 표시된다
  - ✅ 멤버가 제거된다
  - ✅ 멤버 리스트가 갱신된다
  - ✅ 성공 메시지가 표시된다
```gherkin
  Feature: Remove team member
  as an Owner
  I want to remove a member
  When I click remove button for member "John"
  And confirm removal
  Then I should see confirmation dialog
  And see member removed from list
  And see success message
```
### Scenario 3.2: Admin이 팀원 내보내기
**Given**: 사용자가 Admin 권한이고 팀에 3명 이상의 멤버가 존재함
**When**: Admin이 특정 멤버를 내보내기 위해 "제거" 버튼을 클릭하고 확인 다이얼로그에서 "제거"를 클릭하면
**Then**:
  - ✅ 확인 다이얼로그가 표시된다
  - ✅ 멤버가 제거된다
  - ✅ 멤버 리스트가 갱신된다
  - ✅ 성공 메시지가 표시된다
```gherkin
  Feature: Remove team member
  as an Admin
  I want to remove a member
  When I click remove button for member "Jane"
  And confirm removal
  Then I should see confirmation dialog
  And see member removed from list
  And see success message
```
### Scenario 3.3: Owner 자신을 제거 시도 (실패)
**Given**: 사용자가 Owner 권한이고 팀에 3명 이상의 멤버가 존재함
**When**: Owner가 자신의 계정을 "제거" 버튼을 클릭하려고 시도하면
**Then**:
  - ✅ "제거" 버튼이 비활성화되어 있다
  - ✅ 클릭 시 아무런 반응이 발생하지 않는다
```gherkin
  Feature: Owner self-removal prevention
  as an Owner
  I want to remove myself
  When I click remove button for my own account
  Then I should see the option disabled
  And clicking should have no effect
```
### Scenario 3.4: Editor/Viewer가 팀원 내보내기 시도 (실패)
**Given**: 사용자가 Editor 또는 Viewer 권한을 가짐
**When**: 사용자가 "팀원 내보내기"를 클릭하려고 시도하면
**Then**:
  - ✅ "팀원 내보내기" 메뉴가 비활성화되어 있다
  - ✅ 클릭 시 아무런 반응이 발생하지 않는다
```gherkin
  Feature: Remove team member permission check
  as an Editor or Viewer
  I want to remove a team member
  When I click "팀원 내보내기"
  Then I should see this option disabled
  And clicking should have no effect
```
---

## 4. 역할 변경 기능 테스트
### Scenario 4.1: Owner가 멤버 역할 변경
**Given**: 사용자가 Owner 권한이고 팀에 Editor 권한 멤버가 존재함
**When**: Owner가 해당 멤버의 역할을 Editor에서 Admin으로 변경하면
**Then**:
  - ✅ 역할 변경 드롭다운이 표시된다
  - ✅ 역할이 변경된다
  - ✅ 멤버 리스트의 역할 배지가 갱신된다
  - ✅ 성공 메시지가 표시된다
```gherkin
  Feature: Change member role
  as an Owner
  I want to change member role
  When I click role dropdown for member "Alice"
  And select "Admin"
  Then I should see role change dialog
  And see role updated in member list
  And see success message
```
### Scenario 4.2: Admin이 멤버 역할 변경
**Given**: 사용자가 Admin 권한이고 팀에 Editor 권한 멤버가 존재함
**When**: Admin이 해당 멤버의 역할을 Editor에서 Admin으로 변경하면
**Then**:
  - ✅ 역할 변경 드롭다운이 표시된다
  - ✅ 역할이 변경된다
  - ✅ 멤버 리스트의 역할 배지가 갱신된다
  - ✅ 성공 메시지가 표시된다
```gherkin
  Feature: Change member role
  as an Admin
  I want to change member role
  When I click role dropdown for member "Bob"
  And select "Admin"
  Then I should see role change dialog
  And see role updated in member list
  And see success message
```
### Scenario 4.3: Owner 역할 변경 (Owner → Admin)
**Given**: 사용자가 Owner 권한이고 다른 Owner가 존재함
**When**: 현재 Owner가 다른 멤버를 Owner로 변경하려고 시도하면
**Then**:
  - ✅ 경고 메시지가 표시된다: "팀은 항상 최소 1명의 Owner가 필요합니다"
  - ✅ 확인을 요청한다
  - ✅ Owner 역할 이전이 제안된다
```gherkin
  Feature: Owner role transfer
  as an Owner
  I want to transfer ownership
  When I click role dropdown for current owner
  And select "Admin"
  Then I should see warning message
  And see confirmation prompt
```
### Scenario 4.4: Editor/Viewer 역할 변경 시도 (실패)
**Given**: 사용자가 Editor 또는 Viewer 권한을 가짐
**When**: 사용자가 역할 변경 드롭다운을 클릭하려고 시도하면
**Then**:
  - ✅ 역할 변경 드롭다운이 비활성화되어 있다
  - ✅ 클릭 시 아무런 반응이 발생하지 않는다
```gherkin
  Feature: Role change permission check
  as an Editor or Viewer
  I want to change member role
  When I click role dropdown
  Then I should see this option disabled
  And clicking should have no effect
```
---

## 5. 팀 삭제 기능 테스트
### Scenario 5.1: Owner가 팀 삭제
**Given**: 사용자가 Owner 권한이고 팀이 존재함
**When**: Owner가 "팀 삭제"를 클릭하고 확인 다이얼로그에서 팀 이름을 입력하여 삭제를 확정하면
**Then**:
  - ✅ DeleteTeamDialog가 표시된다
  - ✅ 팀 이름 확인 필드가 표시된다
  - ✅ 팀이 삭제된다
  - ✅ 모든 관련 데이터가 삭제된다 (할 일, 멤버, 초대)
  - ✅ 사용자가 개인 모드로 전환된다
```gherkin
  Feature: Delete team
  as an Owner
  I want to delete my team
  When I click "팀 삭제"
  And enter team name "My Team"
  And confirm deletion
  Then I should see DeleteTeamDialog
  And see team name confirmation field
  And see team deleted
  And see all data removed
  And see switch to personal mode
```
### Scenario 5.2: Admin이 팀 삭제 시도 (실패)
**Given**: 사용자가 Admin 권한을 가짐
**When**: Admin이 "팀 삭제"를 클릭하려고 시도하면
**Then**:
  - ✅ "팀 삭제" 메뉴가 비활성화되어 있다
  - ✅ 클릭 시 아무런 반응이 발생하지 않는다
```gherkin
  Feature: Delete team permission check
  as an Admin
  I want to delete team
  When I click "팀 삭제"
  Then I should see this option disabled
  And clicking should have no effect
```
### Scenario 5.3: 팀 삭제 취소
**Given**: 사용자가 Owner 권한이고 DeleteTeamDialog가 열려 있음
**When**: 사용자가 "취소" 버튼을 클릭하면
**Then**:
  - ✅ 다이얼로그가 닫힌다
  - ✅ 팀이 삭제되지 않는다
  - ✅ 텍스트 필드가 초기화된다
```gherkin
  Feature: Cancel team deletion
  as an Owner
  I want to cancel deletion
  When I click "Cancel" button
  Then I should see dialog closed
  And team should not be deleted
  And text field should be cleared
```
### Scenario 5.4: 팀 이름 불일치 (삭제 방지)
**Given**: 사용자가 Owner 권한이고 DeleteTeamDialog가 열려 있음
**When**: 사용자가 잘못된 팀 이름을 입력하고 "삭제" 버튼을 클릭하려고 시도하면
**Then**:
  - ✅ "삭제" 버튼이 비활성화되어 있다
  - ✅ 삭제가 진행되지 않는다
  - ✅ 오류 메시지가 표시된다
```gherkin
  Feature: Team name validation
  as an Owner
  I want to delete team
  When I enter wrong team name "Wrong Name"
  And click "Delete" button
  Then I should see delete button disabled
  And see error message
```
---

## 6. 팀 탈퇴 기능 테스트
### Scenario 6.1: 멤버가 팀 탈퇴
**Given**: 사용자가 Editor 권한으로 팀에 참여 중임
**When**: 사용자가 "팀 탈퇴"를 클릭하고 확인 다이얼로그에서 "탈퇴"를 클릭하면
**Then**:
  - ✅ LeaveTeamDialog가 표시된다
  - ✅ 탈퇴 경고 메시지가 표시된다
  - ✅ 팀에서 제거된다
  - ✅ 개인 모드로 전환된다
```gherkin
  Feature: Leave team
  as an Editor
  I want to leave team
  When I click "팀 탈퇴"
  And confirm leave
  Then I should see LeaveTeamDialog
  And see warning message
  And be removed from team
  And see switch to personal mode
```
### Scenario 6.2: Owner가 팀 탈퇴 시도 (실패)
**Given**: 사용자가 Owner 권한을 가짐
**When**: 사용자가 "팀 탈퇴"를 클릭하려고 시도하면
**Then**:
  - ✅ "팀 탈퇴" 메뉴가 비활성화되어 있다
  - ✅ 대신 "팀 삭제" 옵션이 표시된다
```gherkin
  Feature: Owner cannot leave team
  as an Owner
  I want to leave team
  When I click "팀 탈퇴"
  Then I should see this option disabled
  And see "팀 삭제" option instead
```
### Scenario 6.3: 팀 탈퇴 취소
**Given**: 사용자가 Editor 권한이고 LeaveTeamDialog가 열려 있음
**When**: 사용자가 "취소" 버튼을 클릭하면
**Then**:
  - ✅ 다이얼로그가 닫힌다
  - ✅ 팀 탈퇴가 취소된다
  - ✅ 팀 상태가 유지된다
```gherkin
  Feature: Cancel team leave
  as an Editor
  I want to cancel leaving team
  When I click "Cancel" button
  Then I should see dialog closed
  And team leave should be cancelled
  And team membership should be preserved
```
### Scenario 6.4: 마지막 멤버 탈퇴
**Given**: 팀에 사용자 1명만 존재함 (Owner)
**When**: 사용자가 팀을 탈퇴하려고 시도하면
**Then**:
  - ✅ 팀 탈퇴 대신 팀 삭제가 권장된다
  - ✅ 적절한 안내 메시지가 표시된다
```gherkin
  Feature: Last member leave
  as an Owner
  I want to leave team when I am the only member
  When I click "팀 탈퇴"
  Then I should see team deletion recommended
  And see appropriate message
```
---

## 7. UI/UX 테스트
### Scenario 7.1: 반응형 디자인 (모바일)
**Given**: 사용자가 모바일 기기에서 앱에 접속함
**When**: 팀 관리 메뉴를 열면
**Then**:
  - ✅ 시트가 화면 하단에서 슬라이드 업된다
  - ✅ 모든 버튼이 터치 가능하다
  - ✅ 스크롤이 자연스럽다
  - ✅ 닫기 버튼이 명확하게 표시된다
```gherkin
  Feature: Responsive design
  as a Mobile user
  I want to use team management on mobile
  When I open team management menu
  Then I should see sheet slide up from bottom
  And all buttons should be touchable
  And scrolling should be smooth
  And close button should be visible
```
### Scenario 7.2: 키보드 네비게이션
**Given**: 팀 관리 메뉴가 열려 있음
**When**: 사용자가 Escape 키를 누르면
**Then**:
  - ✅ 메뉴가 닫힌다
  - ✅ 포커스가 이전 요소로 돌아간다
```gherkin
  Feature: Keyboard navigation
  as a User
  I want to close menu with keyboard
  When I press Escape key
  Then I should see menu closed
  And focus should return to previous element
```
### Scenario 7.3: 접근성 (스크린 리더)
**Given**: 스크린 리더를 사용하는 사용자가 앱에 접속함
**When**: 팀 관리 메뉴를 탐색하면
**Then**:
  - ✅ 모든 메뉴 항목이 읽힐 수 있다
  - ✅ 역할 정보가 명확하게 전달된다
  - ✅ 활성/비활성 상태가 구분된다
```gherkin
  Feature: Screen reader accessibility
  as a Screen reader user
  I want to understand team management menu
  When I navigate menu
  Then I should hear all menu items
  And role information should be clear
  And enabled/disabled states should be distinguished
```
---

## 8. 에지 케이스 테스트
### Scenario 8.1: 네트워크 오류 복구
**Given**: 사용자가 팀원을 내보내려 시도함
**When**: 네트워크 연결이 실패하면
**Then**:
  - ✅ 오류 메시지가 표시된다
  - ✅ 재시도 옵션이 제공된다
  - ✅ UI가 응답하지 않는 상태로 유지된다
```gherkin
  Feature: Network error recovery
  as a User
  I want to remove a team member
  When network connection fails
  Then I should see error message
  And retry option should be available
  And UI should remain responsive
```
### Scenario 8.2: 동시성 충돌
**Given**: 두 명의 Admin이 동시에 같은 멤버를 내보내려 시도함
**When**: 두 번째 Admin이 작업을 시도하면
**Then**:
  - ✅ 적절한 오류 메시지가 표시된다
  - ✅ 데이터가 일관되게 유지된다
  - ✅ 사용자에게 새로고침이 권장된다
```gherkin
  Feature: Concurrent modification
  as an Admin
  I want to remove a member
  When another admin tries to remove same member simultaneously
  Then I should see appropriate error message
  And data should remain consistent
  And refresh should be suggested
```
### Scenario 8.3: 권한 변경 감지
**Given**: Admin이 멤버를 내보내려 시도함
**When**: 작업 중 Admin 권한이 취소됨
**Then**:
  - ✅ 작업이 중단된다
  - ✅ 권한 오류 메시지가 표시된다
  - ✅ UI가 적절히 갱신된다
```gherkin
  Feature: Permission change detection
  as an Admin
  I want to remove a member
  When my admin permission is revoked during operation
  Then I should see operation cancelled
  And see permission error message
  And UI should be updated
```
---

## 9. 통합 테스트
### Scenario 9.1: 기존 컴포넌트 호환성
**Given**: 기존 InviteDialog, DeleteTeamDialog, LeaveTeamDialog가 존재함
**When**: 새로운 통합 메뉴를 통해 해당 기능에 접근하면
**Then**:
  - ✅ 기존 다이얼로그가 정상적으로 표시된다
  - ✅ 모든 기능이 정상적으로 작동한다
  - ✅ 스타일이 일관된다
```gherkin
  Feature: Component compatibility
  as a User
  I want to use existing team management features
  When I access them through new integrated menu
  Then I should see existing dialogs displayed correctly
  And all features should work as expected
  And styles should be consistent
```
### Scenario 9.2: 상태 관리 호환성
**Given**: 기존 teamStore가 존재함
**When**: 새로운 컴포넌트에서 상태를 사용하면
**Then**:
  - ✅ 상태가 정상적으로 로드된다
  - ✅ 업데이트가 올바르게 반영된다
  - ✅ 구독이 올바르게 관리된다
```gherkin
  Feature: State management compatibility
  as a Component
  I want to use team state
  When I access teamStore
  Then I should see state loaded correctly
  And updates should be reflected
  And subscriptions should be managed
```
### Scenario 9.3: 기존 UI 패턴 유지
**Given**: 기존 팀 관리 UI 패턴이 존재함
**When**: 새로운 통합 메뉴를 사용하면
**Then**:
  - ✅ UI 패턴이 일관성 있게 유지된다
  - ✅ 사용자 경험이 연속된다
  - ✅ 학습 곡선이 최소화된다
```gherkin
  Feature: UI pattern consistency
  as a User
  I want to use team management features
  When I use new integrated menu
  Then I should see consistent UI patterns
  And user experience should be continuous
  And learning curve should be minimal
```
---

## 성공 기준 요약

### 기능적 성공 (100%)
- ✅ 모든 권한 기반 접근 제어가 올바르게 작동
- ✅ 모든 기존 기능이 새 메뉴에서 정상 작동
- ✅ 확인 다이얼로그가 모든 파괴적 작업에 표시됨

- ✅ 사용자 피드백이 모든 작업 후 제공됨

### 비기능적 성공
- ✅ TypeScript 컴파일 에러 0개
- ✅ ESLint 경고 0개
- ✅ 테스트 커버리지 > 90%
- ✅ WCAG 2.1 AA 준수 100%

### 사용자 경험 성공
- ✅ 기능 발견 시간 < 5초
- ✅ 사용자 오류율 < 5%
- ✅ 모바일/데스크톱 호환성 100%
