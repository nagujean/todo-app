# Todo App

Modern task management web application with real-time sync and team collaboration.

## Version 0.2.2 Highlights (v0.2.2)

### New Features

- **Rich Text Editor**: Notion-style rich text editing with slash commands, bullet lists, and formatting (SPEC-CHECKLIST-001)
- **Deployment Stability**: Automated health checks, alert notifications, and deployment verification (SPEC-DEPLOY-STABILITY-001)
- **Health Check System**: Automated monitoring with GitHub Secrets configuration for accurate deployment tracking
- **GitHub Actions CI/CD**: Automated quality gates with ESLint, TypeScript checks, and build verification
- **Team Management Menu UX**: Enhanced team management workflow with integrated team management sheet (SPEC-TEAM-003)
- **Improved Team Permissions**: Last owner can delete team, improved permission system
- **Enhanced Mobile Experience**: Mobile responsive design improvements
- **Code Quality Improvements**: ES Modules migration, React 19 best practices with useSyncExternalStore
- **Sentry Error Tracking**: Real-time error monitoring and tracking with Sentry integration (SPEC-OBSERVABILITY-001)
- **UI Bug Fixes**: Mobile UI layout improvements and completion status display fixes (SPEC-BUG-UI-001)

### Security & Stability

- PWA offline support with service worker caching
- Health check endpoints for deployment monitoring
- Alert notifications for deployment failures (Slack integration ready)
- **Enhanced CI/CD**: Vercel Deployment Protection 바이패스 토큰 지원
- **Deployment Optimization**: 배포 리전 icn1 제한 및 Edge Runtime 호환성
- **Infrastructure Health**: GitHub Actions alerts.yml Health Check 개선 및 모니터링 안정성 강화
- **Health Check URL Fix**: 자동화된 헬스 체크를 위한 GitHub Secrets 설정 완료

## Features

### Core Features

- **Todo Management**: Create, read, update, delete tasks with priority levels (high/medium/low)
- **Rich Text Editor**: Notion-style editor with slash commands (/), bullet lists, and formatting (v0.2.2)
- **Date Range**: Set start and end dates for scheduling
- **Sorting**: Sort by creation date, priority, start date, or end date
- **Filtering**: Filter by all, incomplete, or completed tasks
- **Batch Delete**: Clear all completed tasks at once
- **FilterSortBar Component**: Unified filter and sort controls (v0.2.0)

### Collaboration

- **Team Workspaces**: Create and manage team workspaces
- **Role-Based Access Control**: Owner, Admin, Editor, Viewer roles
- **Member Invitation**: Invite team members via email
- **Integrated Team Management**: Enhanced unified team management interface (v0.2.1)
  - Single entry point for all team operations
  - Member list with role management
  - Team settings (name, description)
  - Team deletion (Owner including last owner) / Team leave (Non-owner)
  - **New**: Team management menu in team switcher for quick access

### Views

- **List View**: Traditional task list display
- **Calendar View**: Date-based task visualization

### Additional Features

- **Presets**: Save frequently used tasks as templates
- **Dark Mode**: Toggle between light and dark themes
- **PWA Support**: Install as app, works offline with service worker caching
- **Real-time Sync**: Firebase-powered data synchronization
- **Mobile Optimized**: Responsive design for mobile devices (v0.2.0)
- **GitHub Automatic Deployment**: Automated CI/CD pipeline with Vercel integration (SPEC-DEPLOY-001)
- **Deployment Stability**: Health checks, alert notifications, and deployment verification (SPEC-DEPLOY-STABILITY-001)
- **Health Check System**: Automated monitoring with GitHub Secrets configuration for accurate deployment tracking
- **Health Check System**: Automated monitoring with GitHub Secrets configuration for accurate deployment tracking
- **Sentry Integration**: Real-time error tracking and monitoring with automated alerts (SPEC-OBSERVABILITY-001)

## Tech Stack

| Category         | Technology                  | Version |
| ---------------- | --------------------------- | ------- |
| Framework        | Next.js (App Router)        | 16.1.2  |
| UI Library       | React                       | 19.2.3  |
| State Management | Zustand                     | 5.0.10  |
| Backend          | Firebase (Auth + Firestore) | 12.8.0  |
| Styling          | Tailwind CSS                | 4.x     |
| UI Components    | Radix UI                    | -       |
| Unit Testing     | Vitest                      | 4.0.18  |
| Testing          | Playwright                  | 1.57.0  |
| PWA              | Serwist                     | 9.5.0   |
| Language         | TypeScript                  | 5.x     |

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase project with Authentication and Firestore enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/todo-app.git
cd todo-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create `.env.local` with the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm run test:unit

# Run unit tests with coverage report
npm run test:coverage
```

Unit test coverage (557 tests, 39 test files):

| Category         | Coverage                                                                    |
| ---------------- | --------------------------------------------------------------------------- |
| Store Tests      | authStore 93.42%, themeStore 100%, invitationStore 73.91%, teamStore 71.42% |
| UI Components    | button, input, checkbox, card, dialog, textarea (95%+)                      |
| Todo Components  | TodoItem, TodoList, TodoInput, TodoDetail (84%+)                            |
| Auth Components  | LoginForm, SignupForm, UserMenu, AuthProvider (88%+)                        |
| Team Components  | TeamSwitcher, CreateTeamDialog, InviteDialog, TeamMembers (67%+)            |
| Other Components | CalendarView, PresetList, ThemeToggle, ViewToggle, pages                    |

### E2E Tests

```bash
# Run E2E tests
npm run test

# Run tests with UI
npm run test:ui

# View test report
npm run test:report
```

Test coverage includes:

- Todo CRUD operations
- Filtering and sorting
- Data persistence
- Team collaboration
- Authentication flows
- Invitation management (email and link)
- Theme toggling and persistence

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting
```

## PWA Installation

### Mobile

1. Open the app in your mobile browser
2. Tap "Add to Home Screen" when prompted

### Desktop

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main todo page
│   ├── layout.tsx         # Root layout
│   ├── sw.ts              # Service worker
│   └── manifest.ts        # PWA manifest
├── components/
│   ├── auth/              # Authentication components
│   ├── team/              # Team collaboration components
│   ├── todo/              # Todo components
│   └── ui/                # Reusable UI components
├── store/
│   ├── todoStore.ts       # Todo state management
│   ├── authStore.ts       # Auth state management
│   ├── teamStore.ts       # Team state management
│   ├── invitationStore.ts # Invitation state management
│   ├── themeStore.ts      # Theme state management
│   └── presetStore.ts     # Preset state management
└── lib/
    ├── firebase.ts        # Firebase configuration
    └── utils.ts           # Utility functions
```

## License

MIT

---

Built with [Claude Code](https://claude.com/claude-code)
