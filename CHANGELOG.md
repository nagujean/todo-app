# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
