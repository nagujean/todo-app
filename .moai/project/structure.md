# Todo App - Project Structure

## Directory Tree

```
todo-app/
├── .moai/                          # MoAI project configuration
│   ├── config/                     # Configuration files
│   │   ├── config.yaml             # Main configuration
│   │   ├── multilingual-triggers.yaml  # i18n triggers
│   │   ├── sections/               # Configuration sections
│   │   │   ├── git-strategy.yaml   # Git workflow settings
│   │   │   ├── language.yaml       # Language settings (ko)
│   │   │   ├── llm.yaml            # LLM configuration
│   │   │   ├── pricing.yaml        # Pricing information
│   │   │   ├── project.yaml        # Project metadata
│   │   │   ├── quality.yaml        # Quality gates (TRUST 5)
│   │   │   ├── system.yaml         # System settings
│   │   │   └── user.yaml           # User settings
│   │   └── statusline-config.yaml  # Statusline configuration
│   ├── docs/                       # Documentation reports
│   ├── announcements/              # Multilingual announcements
│   ├── llm-configs/                # LLM configurations
│   ├── memory/                     # Session state storage
│   ├── project/                    # Project documentation
│   │   ├── product.md              # Product overview
│   │   ├── structure.md            # Project structure (this file)
│   │   └── tech.md                 # Technical documentation
│   └── specs/                      # SPEC documents
│       ├── SPEC-REFACTOR-001/      # Refactoring specifications
│       ├── SPEC-TEST-001/          # Unit test specifications
│       ├── SPEC-TEST-002/          # Component test specifications
│       ├── SPEC-FIX-001/           # Bug fix specifications
│       └── SPEC-MOBILE-001/        # Mobile responsiveness specifications
│
├── .claude/                        # Claude Code configuration
│   ├── agents/moai/                # MoAI agents
│   ├── commands/moai/              # MoAI commands
│   ├── hooks/moai/                 # MoAI hooks
│   ├── output-styles/moai/         # Output styles
│   ├── rules/moai/                 # MoAI rules
│   ├── skills/moai-*/              # MoAI skills
│   ├── settings.json               # Claude settings
│   └── CLAUDE.md                   # Project instructions
│
├── e2e/                            # E2E tests (Playwright)
│   ├── story-1-1-add-todo.spec.ts
│   ├── story-1-2-complete-todo.spec.ts
│   ├── story-1-3-delete-todo.spec.ts
│   ├── story-1-4-filter-todo.spec.ts
│   ├── story-1-5-persistence.spec.ts
│   ├── team-collaboration.spec.ts
│   └── todo.spec.ts
│
├── public/                         # Static resources
│   ├── icon.svg                    # App icon (SVG)
│   ├── icon-192.png                # App icon (192x192)
│   ├── icon-512.png                # App icon (512x512)
│   ├── icon-maskable-512.png       # Maskable icon
│   └── sw.js                       # Service worker
│
├── src/                            # Source code
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/              # Login page
│   │   │   │   └── page.tsx
│   │   │   ├── signup/             # Signup page
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx          # Auth layout
│   │   ├── favicon.ico             # Favicon
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   ├── manifest.ts             # PWA manifest
│   │   ├── page.tsx                # Main page
│   │   └── sw.ts                   # Service worker registration
│   │
│   ├── components/                 # React components
│   │   ├── auth/                   # Authentication components
│   │   │   ├── AuthProvider.tsx    # Auth context provider
│   │   │   ├── LoginForm.tsx       # Login form component
│   │   │   ├── SignupForm.tsx      # Signup form component
│   │   │   └── UserMenu.tsx        # User menu component
│   │   │
│   │   ├── calendar/               # Calendar components
│   │   │   └── CalendarView.tsx    # Calendar view component
│   │   │
│   │   ├── preset/                 # Preset components
│   │   │   └── PresetList.tsx      # Preset list component
│   │   │
│   │   ├── team/                   # Team collaboration components
│   │   │   ├── CreateTeamDialog.tsx    # Team creation dialog
│   │   │   ├── InviteDialog.tsx        # Team invitation dialog
│   │   │   ├── TeamMembers.tsx         # Team members list
│   │   │   ├── TeamSwitcher.tsx        # Team switcher component
│   │   │   └── index.ts                 # Component barrel
│   │   │
│   │   ├── todo/                   # Todo management components
│   │   │   ├── index.ts             # Component barrel
│   │   │   ├── TodoDetail.tsx       # Todo detail component
│   │   │   ├── TodoInput.tsx        # Todo input component (with 200 char limit)
│   │   │   ├── TodoItem.tsx         # Todo item component
│   │   │   └── TodoList.tsx         # Todo list component
│   │   │
│   │   ├── ui/                     # UI components (Radix-based)
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── checkbox.tsx         # Checkbox component
│   │   │   ├── dialog.tsx           # Dialog component
│   │   │   ├── input.tsx            # Input component
│   │   │   └── textarea.tsx         # Textarea component
│   │   │
│   │   ├── ThemeToggle.tsx          # Theme toggle component
│   │   └── ViewToggle.tsx           # View mode toggle component
│   │
│   ├── lib/                         # Utilities
│   │   ├── firebase.ts              # Firebase configuration
│   │   ├── logger.ts                # Conditional logging utility
│   │   ├── utils.ts                 # Common utilities
│   │   └── utils.test.ts            # Utilities tests
│   │
│   └── store/                       # Zustand stores
│       ├── authStore.ts             # Authentication state
│       ├── authStore.test.ts        # Auth store tests
│       ├── invitationStore.ts       # Invitation state
│       ├── invitationStore.test.ts  # Invitation store tests
│       ├── presetStore.ts           # Preset state
│       ├── presetStore.test.ts      # Preset store tests
│       ├── teamStore.ts             # Team state
│       ├── teamStore.test.ts        # Team store tests
│       ├── themeStore.ts            # Theme state
│       ├── themeStore.test.ts       # Theme store tests
│       ├── todoStore.ts             # Todo state (with Firestore sync)
│       └── todoStore.test.ts        # Todo store tests
│
├── .gitignore                       # Git exclusions
├── CLAUDE.md                        # AI assistant instructions
├── next.config.ts                   # Next.js configuration
├── package.json                     # Project metadata and scripts
├── playwright.config.ts              # Playwright configuration
├── postcss.config.mjs               # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── vitest.config.ts                 # Vitest configuration
└── .env.glm                         # GLM model configuration
```

## Key Directory Descriptions

### src/app/ - Next.js App Router

Page directory using Next.js 16 App Router.

| Route | Description |
|-------|-------------|
| `(auth)/` | Route group for authentication pages |
| `(auth)/login/` | Login page (`/login`) |
| `(auth)/signup/` | Signup page (`/signup`) |
| `layout.tsx` | Root layout (HTML, fonts, providers) |
| `page.tsx` | Main page (`/`) |
| `manifest.ts` | Dynamic PWA manifest generation |
| `sw.ts` | Service worker registration |

### src/components/ - React Components

Feature-organized React component directory.

| Directory | Description | Key Files |
|-----------|-------------|-----------|
| `auth/` | Authentication UI | LoginForm, SignupForm, AuthProvider, UserMenu |
| `calendar/` | Calendar view | CalendarView |
| `preset/` | Preset functionality | PresetList |
| `team/` | Team collaboration | TeamSwitcher, InviteDialog, TeamMembers, CreateTeamDialog |
| `todo/` | Todo management | TodoList, TodoItem, TodoInput, TodoDetail |
| `ui/` | Reusable UI | button, input, dialog, checkbox, card, textarea |

### src/store/ - Zustand State Management

Zustand-based global state management stores with Firestore synchronization.

| Store | Purpose | Key State |
|-------|---------|-----------|
| `todoStore.ts` | Todo management | todos, sortType, sortOrder, viewMode, filterMode, Firestore sync |
| `authStore.ts` | Authentication state | user, isLoading |
| `teamStore.ts` | Team management | teams, currentTeam, members |
| `themeStore.ts` | Theme settings | theme (dark/light) |
| `presetStore.ts` | Preset management | presets |
| `invitationStore.ts` | Invitation management | invitations |

### src/lib/ - Utilities

Shared utilities and configuration files.

| File | Description |
|------|-------------|
| `firebase.ts` | Firebase app initialization and Firestore/Auth instances |
| `logger.ts` | Conditional logging utility (dev/prod branching) |
| `utils.ts` | Common utilities (cn, isE2ETestMode, convertTimestamp) |
| `utils.test.ts` | Utilities function tests |

### e2e/ - E2E Tests

Playwright-based End-to-End tests covering user stories.

| Test File | Test Scope |
|-----------|------------|
| `story-1-1-add-todo.spec.ts` | Add todo functionality |
| `story-1-2-complete-todo.spec.ts` | Complete todo functionality |
| `story-1-3-delete-todo.spec.ts` | Delete todo functionality |
| `story-1-4-filter-todo.spec.ts` | Filtering functionality |
| `story-1-5-persistence.spec.ts` | Data persistence |
| `team-collaboration.spec.ts` | Team collaboration features |

## Module Architecture

### Component Dependency Tree

```
App (layout.tsx)
├── AuthProvider
│   └── Firebase authentication state
├── ThemeProvider
│   └── Theme context (dark/light)
└── Page (page.tsx)
    ├── ThemeToggle
    ├── UserMenu
    ├── TeamSwitcher
    ├── ViewToggle
    ├── TodoInput
    │   ├── Title input (200 char limit with counter)
    │   ├── Description textarea
    │   ├── Priority selector
    │   └── Date range picker
    ├── PresetList
    ├── TodoList (list view)
    │   └── TodoItem[]
    │       └── TodoDetail
    └── CalendarView (calendar view)
```

### State Flow

```
Firebase Firestore (Real-time)
    ↓
onSnapshot() Listener
    ↓
Zustand Store (Client State)
    ↓
React Components (State Consumers)
    ↓
User Actions
    ↓
Store Actions (with Firestore write)
    ↓
Firebase Firestore (Update)
```

### Routing Structure

| URL Path | Component | Description |
|----------|-----------|-------------|
| `/` | `app/page.tsx` | Main todo management page |
| `/login` | `app/(auth)/login/page.tsx` | Login page |
| `/signup` | `app/(auth)/signup/page.tsx` | Signup page |

## Data Flow Patterns

### Todo CRUD Flow

1. **Create**: User input → TodoInput → addTodo() → Firestore addDoc → onSnapshot → Store update → UI re-render
2. **Read**: onSnapshot subscription → Firestore query → Store setTodos → Component render
3. **Update**: User edit → updateTodo() → Firestore updateDoc → onSnapshot → Store update → UI re-render
4. **Delete**: User delete → deleteTodo() → Firestore deleteDoc → onSnapshot → Store update → UI re-render

### Authentication Flow

1. User login → Firebase Auth → onAuthStateChanged → AuthStore setUser
2. AuthStore user change → subscribeToTodos() → Firestore subscription
3. User logout → Firebase signOut → AuthStore setUser(null) → unsubscribeFromTodos()

### Team Collaboration Flow

1. Create team → TeamStore addTeam → Firestore teams collection
2. Invite member → InvitationStore createInvite → Firestore invites collection
3. Accept invite → TeamStore addMember → Firestore teams/{id}/members

## Testing Strategy

### Unit Tests (Vitest)

- **Store Tests**: All Zustand stores have corresponding `.test.ts` files
- **Component Tests**: All React components have corresponding `.test.tsx` files
- **Utility Tests**: Helper functions tested with `utils.test.ts`

### E2E Tests (Playwright)

- **User Stories**: Organized by feature story (story-1-1, story-1-2, etc.)
- **Team Collaboration**: Dedicated team collaboration test suite
- **Coverage**: Critical user paths from signup to task completion

### Test Coverage Goals

- **Target**: 85% code coverage (per TRUST 5 framework)
- **Unit Tests**: Cover all business logic in stores and utilities
- **Component Tests**: Cover all user interactions
- **E2E Tests**: Cover critical user journeys

## Integration Points

### Firebase Integration

- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Database**: Firestore with real-time listeners
- **Data Structure**:
  ```
  users/{userId}/todos/{todoId}
  users/{userId}/presets/{presetId}
  users/{userId}/teamMemberships/{teamId}
  teams/{teamId}/members/{userId}
  teams/{teamId}/invitations/{inviteId}
  ```

### PWA Integration

- **Manifest**: Dynamic generation via `src/app/manifest.ts`
- **Service Worker**: Compiled from `src/app/sw.ts` to `public/sw.js` via Serwist
- **Installation**: Native install prompts on supported platforms

---

Last Updated: 2026-02-25
