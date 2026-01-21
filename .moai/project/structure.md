# Todo App - Project Structure

## Overview

This document describes the directory structure and file organization of the Todo App project. The application follows a modern Next.js App Router architecture with clear separation of concerns.

---

## Directory Tree

```
todo-app/
├── .claude/                    # Claude Code configuration
│   └── skills/                 # MoAI-ADK skills
├── .moai/                      # MoAI-ADK project configuration
│   ├── config/                 # Configuration files
│   │   └── sections/           # User and language settings
│   └── project/                # Project documentation
├── e2e/                        # End-to-end tests (Playwright)
│   ├── story-1-1-add-todo.spec.ts
│   ├── story-1-2-complete-todo.spec.ts
│   ├── story-1-3-delete-todo.spec.ts
│   ├── story-1-4-filter-todo.spec.ts
│   ├── story-1-5-persistence.spec.ts
│   └── todo.spec.ts
├── src/                        # Application source code
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication route group
│   │   │   ├── login/          # Login page
│   │   │   ├── signup/         # Signup page
│   │   │   └── layout.tsx      # Auth layout wrapper
│   │   ├── favicon.ico         # Application favicon
│   │   ├── globals.css         # Global styles (Tailwind)
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (Todo list)
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── calendar/           # Calendar view components
│   │   │   └── CalendarView.tsx
│   │   ├── preset/             # Preset system components
│   │   │   └── PresetList.tsx
│   │   ├── todo/               # Todo-specific components
│   │   │   ├── index.ts        # Component exports
│   │   │   ├── TodoDetail.tsx  # Task detail modal
│   │   │   ├── TodoInput.tsx   # Task input form
│   │   │   ├── TodoItem.tsx    # Individual task item
│   │   │   └── TodoList.tsx    # Task list container
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── textarea.tsx
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── ViewToggle.tsx      # List/calendar view toggle
│   ├── lib/                    # Utility functions
│   │   ├── firebase.ts         # Firebase configuration
│   │   └── utils.ts            # General utilities (cn helper)
│   └── store/                  # Zustand state stores
│       ├── authStore.ts        # Authentication state
│       ├── presetStore.ts      # Preset management state
│       ├── themeStore.ts       # Theme preference state
│       └── todoStore.ts        # Todo data and operations
├── .gitignore                  # Git ignore patterns
├── CLAUDE.md                   # Claude Code instructions
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── playwright.config.ts        # Playwright E2E config
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Directory Descriptions

### `/src/app/` - Next.js App Router

The main application routing directory using Next.js 16 App Router conventions.

| Path | Purpose |
|------|---------|
| `layout.tsx` | Root layout with HTML structure, providers, and global styles |
| `page.tsx` | Home page rendering the main Todo list interface |
| `globals.css` | Tailwind CSS imports and global style definitions |
| `(auth)/` | Route group for authentication pages (no URL segment) |
| `(auth)/login/page.tsx` | Login page with email/password and Google OAuth |
| `(auth)/signup/page.tsx` | User registration page |
| `(auth)/layout.tsx` | Shared layout for auth pages (centered card design) |

### `/src/components/` - React Components

Organized by feature domain with a dedicated `ui/` directory for primitives.

| Directory | Purpose |
|-----------|---------|
| `auth/` | Authentication-related components (forms, user menu, provider) |
| `calendar/` | Calendar view rendering and date-based task display |
| `preset/` | Preset template system components |
| `todo/` | Core todo functionality (input, list, item, detail modal) |
| `ui/` | Reusable UI primitives built on Radix UI |
| Root components | Feature toggles (theme, view mode) |

### `/src/store/` - Zustand State Management

Centralized state management using Zustand with persistence middleware.

| Store | Responsibility |
|-------|----------------|
| `authStore.ts` | User authentication state, login/logout actions, Firebase auth integration |
| `todoStore.ts` | Todo CRUD operations, sorting, filtering, Firestore sync |
| `presetStore.ts` | Preset template management and selection |
| `themeStore.ts` | Dark/light theme preference with system detection |

### `/src/lib/` - Utility Functions

Shared utilities and third-party service configurations.

| File | Purpose |
|------|---------|
| `firebase.ts` | Firebase app initialization, auth and Firestore exports |
| `utils.ts` | General utilities including the `cn()` class name merger |

### `/e2e/` - End-to-End Tests

Playwright test specifications organized by user story.

| Test File | Coverage |
|-----------|----------|
| `story-1-1-add-todo.spec.ts` | Task creation functionality |
| `story-1-2-complete-todo.spec.ts` | Task completion toggle |
| `story-1-3-delete-todo.spec.ts` | Task deletion |
| `story-1-4-filter-todo.spec.ts` | Filtering and sorting |
| `story-1-5-persistence.spec.ts` | Data persistence across sessions |
| `todo.spec.ts` | Comprehensive todo operations |

---

## Key File Locations

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| TypeScript Config | `/tsconfig.json` | TypeScript compiler options with path aliases |
| Next.js Config | `/next.config.ts` | Next.js build and runtime configuration |
| Tailwind Config | `/tailwind.config.ts` | Tailwind CSS customization |
| Playwright Config | `/playwright.config.ts` | E2E test runner configuration |
| Package Manifest | `/package.json` | Dependencies and npm scripts |

### Entry Points

| Entry | Location | Purpose |
|-------|----------|---------|
| Application Root | `/src/app/layout.tsx` | Root layout wrapping all pages |
| Home Page | `/src/app/page.tsx` | Main todo list interface |
| Firebase Init | `/src/lib/firebase.ts` | Firebase service initialization |

### State Management

| Store | Location | Persistence |
|-------|----------|-------------|
| Todos | `/src/store/todoStore.ts` | LocalStorage + Firestore |
| Auth | `/src/store/authStore.ts` | Firebase Auth session |
| Theme | `/src/store/themeStore.ts` | LocalStorage |
| Presets | `/src/store/presetStore.ts` | LocalStorage |

---

## Module Organization Patterns

### Component Composition

```
components/
├── [feature]/           # Feature-specific components
│   ├── index.ts         # Public exports
│   └── [Component].tsx  # Implementation
└── ui/                  # Shared primitives
    └── [primitive].tsx  # Radix UI wrappers
```

### Store Pattern

Each store follows a consistent pattern:
1. Type definitions (interfaces)
2. Store creation with Zustand
3. Persistence middleware configuration
4. External subscription functions (for Firebase listeners)

### Path Aliases

The project uses TypeScript path aliases defined in `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@/*` | `./src/*` |

Example usage: `import { useTodoStore } from '@/store/todoStore'`

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TodoItem.tsx` |
| Stores | camelCase + Store suffix | `todoStore.ts` |
| Utilities | camelCase | `utils.ts` |
| Pages | `page.tsx` (App Router convention) | `app/login/page.tsx` |
| Layouts | `layout.tsx` | `app/(auth)/layout.tsx` |
| Tests | kebab-case + `.spec.ts` | `story-1-1-add-todo.spec.ts` |

---

*Document generated for Todo App project documentation.*
