# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-03-17

### 🚀 신규 기능 (New Features)

- **Rich Text Editor**: Notion 스타일의 리치 텍스트 에디터 슬래시 명령어, 불렛 목록, 서식 지원 (SPEC-CHECKLIST-001)
- **Deployment Stability**: 자동화된 헬스 체크, 알림 시스템, 배포 검증 (SPEC-DEPLOY-STABILITY-001)
- **Team Management Menu UX**: 통합 팀 관리 시트를 통한 개선된 팀 관리 워크플로우 (SPEC-TEAM-003)
- **Enhanced Mobile Experience**: 모바일 반응형 디자인 개선

### 🔧 개선 사항 (Improvements)

- **CI/CD Pipeline GitHub Actions**: ESLint, TypeScript 검증, 빌드 확인 자동화 품질 게이트
- **Code Quality**: ES Modules 마이그레이션, React 19 best practices with useSyncExternalStore
- **Improved Team Permissions**: 마지막 소유자 팀 삭제 권한 추가, 개선된 권한 시스템
- **Deployment Optimization**:
  - 배포 리전 icn1 제한 (Free Tier)
  - Edge Runtime 호환성 헬스 체크 엔드포인트 개선
- **Infrastructure Health**:
  - Vercel Deployment Protection 바이패스 토큰 지원 추가
  - GitHub Actions alerts.yml Health Check 실패 수정

### 🛡️ 보안 및 안정성 (Security & Stability)

- PWA 오프라인 지원 서비스 워커 캐싱
- 배포 모니터링을 위한 헬스 체크 엔드포인트
- 배포 실패 알림 시스템 (Slack 통합 준비)

### 🐛 버그 수정 (Bug Fixes)

- GitHub Actions alerts.yml YAML 문법 오류 수정
- TypeScript 타입 에러 수정
- Stage 1 Quality Gate 에러 해결 - ES Modules 및 린트 수정

### 📊 테스트 및 코드 커버리지 (Testing & Coverage)

- 유닛 테스트: 557개 테스트, 39개 테스트 파일
- 테스트 커버리지:
  - Store Tests: authStore 93.42%, themeStore 100%, invitationStore 73.91%, teamStore 71.42%
  - UI Components: button, input, checkbox, card, dialog, textarea (95%+)
  - Todo Components: TodoItem, TodoList, TodoInput, TodoDetail (84%+)
  - Auth Components: LoginForm, SignupForm, UserMenu, AuthProvider (88%+)
  - Team Components: TeamSwitcher, CreateTeamDialog, InviteDialog, TeamMembers (67%+)

### 📁 프로젝트 구조 변경 (Project Structure Changes)

- ES Modules 마이그레이션 완료
- 코드 품질 개선: 중복 함수 제거, ESLint 오류 수정, 콘솔 로그 정리

### 🔄 호환성 정보 (Compatibility)

- **Node.js**: 18.x 이상 필요
- **Firebase**: 12.8.0으로 업그레이드
- **React**: 19.2.3으로 업그레이드
- **Next.js**: 16.1.2로 업그레이드

## [Unreleased]

### Changed

- Improved ESLint configuration (0 errors, 2 warnings remaining)
- Enhanced logger with dynamic NODE_ENV checking

## [0.2.0] - 2026-02-25

### Added

- **Mobile Responsive Design** (SPEC-MOBILE-001)
  - Viewport accessibility compliance (WCAG 2.1 Level AA)
  - Responsive container widths for mobile devices (320px - 768px)
  - Vertical header layout on mobile devices
  - Optimized TodoItem spacing for touch interactions
  - Flexible button wrapping for filter/sort controls
  - Support for pinch-to-zoom up to 200%

### Changed

- Refactored header layout for responsive design
- Updated TodoItem padding and spacing for mobile
- Enhanced filter button container with flex-wrap

### Fixed

- Viewport accessibility issue (removed userScalable restriction)
- Horizontal overflow on small mobile devices
- Touch target sizes now meet WCAG 2.5.5 requirements (44x44px minimum)

### Technical Details

- **Breakpoints**: Mobile (< 768px), Desktop (>= 768px)
- **Touch Targets**: Minimum 44x44px per WCAG 2.5.5
- **Accessibility**: WCAG 2.1 Level AA compliant

### Test Coverage

- Unit tests: 67.6% overall (445 tests)
- E2E tests: Playwright 1.57.0
- Mobile UI compliance: 5/5 requirements met

## [0.1.0] - 2026-02-01

### Added

- Initial todo application release
- Firebase authentication and Firestore integration
- Team collaboration features
- Calendar and list view modes
- Dark mode support
- PWA support with Serwist
- Preset management
- Role-based access control

### Features

- Todo CRUD operations with priority levels
- Date range scheduling
- Sorting and filtering
- Batch delete operations
- Team workspaces and member management
- Email and link-based invitations

### Tech Stack

- Next.js 16.1.2 (App Router)
- React 19.2.3
- Zustand 5.0.10
- Firebase 12.8.0
- Tailwind CSS 4.x
- Vitest 4.0.18
- Playwright 1.57.0
- TypeScript 5.x

---

## Links

- [GitHub Repository](https://github.com/yourusername/todo-app)
- [Issue Tracker](https://github.com/yourusername/todo-app/issues)
- [Documentation](README.md)
