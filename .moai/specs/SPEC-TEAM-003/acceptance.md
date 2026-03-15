---
id: SPEC-TEAM-003
version: "1.0.0"
status: draft
created: 2026-03-15
updated: 2026-03-15
author: nagu
priority: MEDIUM
---

# 인수 테스트: SPEC-TEAM-003 팀 관리 메뉴 UX 개선

## 1. 테스트 시나리오

### Scenario 1: 팀 관리 메뉴 접근

**Given**: 사용자가 로그인되어 있고 팀에 속해 있다
**When**: 팀 리스트에서 톱니바퀴 아이콘을 클릭한다
**Then**: 드롭다운 메뉴가 표시된다
**And**: "팀 관리" 옵션이 첫 번째로 표시된다

```
Given: 사용자가 로그인됨, 팀 멤버십 존재
When: 톱니바퀴 클릭
Then: 드롭다운 메뉴 표시
And: "팀 관리" 옵션 표시
```

---

### Scenario 2: 팀 관리 시트 열기

**Given**: 톱니바퀴 드롭다운 메뉴가 열려 있다
**When**: "팀 관리" 옵션을 클릭한다
**Then**: 드롭다운 메뉴가 닫힌다
**And**: IntegratedTeamManagementSheet가 열린다
**And**: 선택한 팀의 정보가 표시된다

```
Given: 드롭다운 메뉴 열림
When: "팀 관리" 클릭
Then: 드롭다운 닫힘
And: 팀 관리 시트 열림
And: 올바른 팀 정보 표시
```

---

### Scenario 3: 소유자 - 전체 메뉴 옵션

**Given**: 사용자가 팀의 소유자(owner)이다
**When**: 톱니바퀴 아이콘을 클릭한다
**Then**: 다음 옵션들이 표시된다:
  - "팀 관리"
  - "팀 삭제"

```
Given: 사용자 역할 = owner
When: 톱니바퀴 클릭
Then: "팀 관리" 표시
And: "팀 삭제" 표시
And: "팀 탈퇴" 미표시
```

---

### Scenario 4: 일반 멤버 - 제한된 메뉴 옵션

**Given**: 사용자가 팀의 일반 멤버(editor 또는 viewer)이다
**When**: 톱니바퀴 아이콘을 클릭한다
**Then**: 다음 옵션들이 표시된다:
  - "팀 관리"
  - "팀 탈퇴"

```
Given: 사용자 역할 = editor 또는 viewer
When: 톱니바퀴 클릭
Then: "팀 관리" 표시
And: "팀 탈퇴" 표시
And: "팀 삭제" 미표시
```

---

### Scenario 5: 팀 삭제 확인 다이얼로그

**Given**: 소유자가 톱니바퀴 메뉴를 열었다
**When**: "팀 삭제" 옵션을 클릭한다
**Then**: 팀이 즉시 삭제되지 않는다
**And**: 확인 다이얼로그가 표시된다

```
Given: 소유자, 드롭다운 열림
When: "팀 삭제" 클릭
Then: 팀 삭제 미실행
And: DeleteTeamDialog 표시
```

---

### Scenario 6: 팀 탈퇴 확인 다이얼로그

**Given**: 일반 멤버가 톱니바퀴 메뉴를 열었다
**When**: "팀 탈퇴" 옵션을 클릭한다
**Then**: 팀에서 즉시 탈퇴하지 않는다
**And**: 확인 다이얼로그가 표시된다

```
Given: 일반 멤버, 드롭다운 열림
When: "팀 탈퇴" 클릭
Then: 탈퇴 미실행
And: LeaveTeamDialog 표시
```

---

## 2. 엣지 케이스 테스트

### Edge Case 1: 팀이 없는 사용자

**Given**: 사용자가 어떤 팀에도 속해 있지 않다
**When**: TeamSwitcher를 확인한다
**Then**: "개인"만 표시된다
**And**: 톱니바퀴 아이콘이 없다

---

### Edge Case 2: 여러 팀 전환 후 팀 관리

**Given**: 사용자가 여러 팀에 속해 있다
**When**: 팀 A를 선택한 후 팀 B의 톱니바퀴 → "팀 관리"를 클릭한다
**Then**: 팀 B로 자동 전환된다
**And**: 팀 B의 관리 시트가 열린다

---

### Edge Case 3: 메뉴 외부 클릭

**Given**: 톱니바퀴 드롭다운 메뉴가 열려 있다
**When**: 메뉴 외부를 클릭한다
**Then**: 드롭다운 메뉴가 닫힌다
**And**: 아무 작업도 실행되지 않는다

---

### Edge Case 4: ESC 키로 메뉴 닫기

**Given**: 톱니바퀴 드롭다운 메뉴가 열려 있다
**When**: ESC 키를 누른다
**Then**: 드롭다운 메뉴가 닫힌다

---

## 3. 접근성 테스트

### A11y Test 1: 키보드 탐색

- Tab 키로 톱니바퀴 아이콘까지 이동 가능
- Enter/Space로 메뉴 열기
- 화살표 키로 메뉴 옵션 탐색
- ESC로 메뉴 닫기

### A11y Test 2: ARIA 속성

- `aria-expanded` 속성이 올바르게 토글됨
- `aria-haspopup="menu"` 속성 존재
- `role="menu"` 및 `role="menuitem"` 속성 존재

### A11y Test 3: 스크린 리더

- 톱니바퀴 버튼의 `aria-label`이 "팀 관리 메뉴"로 설정됨
- 각 메뉴 옵션이 스크린 리더로 읽힘

---

## 4. 성능 기준

| 항목 | 기준 |
|------|------|
| 드롭다운 메뉴 렌더링 | < 100ms |
| 시트 열기 애니메이션 | < 300ms |
| 메뉴 닫기 | 즉시 (< 50ms) |

---

## 5. 완료 체크리스트

### 기능 검증

- [ ] Scenario 1: 팀 관리 메뉴 접근 - PASS
- [ ] Scenario 2: 팀 관리 시트 열기 - PASS
- [ ] Scenario 3: 소유자 메뉴 옵션 - PASS
- [ ] Scenario 4: 일반 멤버 메뉴 옵션 - PASS
- [ ] Scenario 5: 팀 삭제 확인 다이얼로그 - PASS
- [ ] Scenario 6: 팀 탈퇴 확인 다이얼로그 - PASS

### 엣지 케이스

- [ ] Edge Case 1: 팀 없는 사용자 - PASS
- [ ] Edge Case 2: 여러 팀 전환 - PASS
- [ ] Edge Case 3: 외부 클릭 - PASS
- [ ] Edge Case 4: ESC 키 - PASS

### 접근성

- [ ] A11y Test 1: 키보드 탐색 - PASS
- [ ] A11y Test 2: ARIA 속성 - PASS
- [ ] A11y Test 3: 스크린 리더 - PASS

### 자동화 테스트

- [ ] TeamManagementMenu.test.tsx - 모든 테스트 통과
- [ ] TeamSwitcher.test.tsx - 모든 테스트 통과
- [ ] 커버리지 85% 이상

---

## 6. 승인 기준

모든 항목이 PASS되어야 인수 테스트 완료로 간주한다.

| 카테고리 | 필수 통과 항목 |
|---------|---------------|
| 기능 검증 | 6/6 |
| 엣지 케이스 | 4/4 |
| 접근성 | 3/3 |
| 자동화 테스트 | 3/3 |

---

*문서 끝*
