# Todo App - Technical Documentation

## Technology Stack Overview

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Language | TypeScript | 5.x | Type safety and developer productivity |
| Framework | Next.js | 16.1.2 | React framework with App Router |
| UI Library | React | 19.2.3 | User interface |
| State Management | Zustand | 5.0.10 | Client-side state management |
| Backend | Firebase | 12.8.0 | Authentication and database |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| UI Components | Radix UI | - | Accessible UI primitives |
| Testing | Vitest | 4.0.18 | Unit testing |
| Testing | Playwright | 1.57.0 | E2E testing |
| Testing | @testing-library/react | 16.3.2 | React component testing |
| PWA | Serwist | 9.5.0 | Service worker and offline support |
| Icons | Lucide React | 0.562.0 | Icon library |

## Framework and Library Selection Rationale

### Next.js 16 (App Router)

**Why Selected:**
- **App Router**: File-based routing and layout system for easy code organization
- **React Server Components**: Server-side rendering performance optimization
- **Built-in Optimizations**: Automatic image, font, and script optimization
- **No API Routes Needed**: Firebase as backend eliminates API layer

**Key Configuration:**
```typescript
// next.config.ts
import withSerwist from "@serwist/next";

const nextConfig = {};
export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig);
```

### React 19

**Why Selected:**
- **Concurrent Features**: Improved rendering performance
- **Automatic Batching**: Automatic state update batching
- **Transitions API**: Smooth UI transitions
- **Next.js 16 Compatibility**: Full compatibility with latest Next.js

### Zustand 5

**Why Selected:**
- **Concise API**: Minimal boilerplate compared to Redux
- **TypeScript Friendly**: Excellent type inference
- **Middleware Support**: persist middleware for local storage sync
- **Bundle Size**: Approximately 1KB (gzip)

**Implementation Pattern:**
```typescript
// Store creation pattern
export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      addTodo: async (params) => { /* ... */ },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ /* persist state */ }),
    }
  )
);
```

### Firebase (Authentication + Firestore)

**Why Selected:**
- **Serverless**: No backend infrastructure management
- **Real-time Sync**: Firestore real-time listeners for instant UI updates
- **Auth Integration**: Multiple auth providers (email, Google)
- **Scalability**: Auto-scaling with usage
- **Offline Support**: Firestore offline caching

**Data Structure:**
```
Firestore Database
├── users/
│   └── {userId}/
│       ├── todos/
│       │   └── {todoId}/
│       │       ├── title: string (max 200 chars)
│       │       ├── description: string?
│       │       ├── completed: boolean
│       │       ├── priority: 'high' | 'medium' | 'low'
│       │       ├── startDate: timestamp?
│       │       ├── endDate: timestamp?
│       │       ├── createdAt: timestamp
│       │       ├── updatedAt: timestamp
│       │       └── completedAt: timestamp?
│       ├── presets/
│       │   └── {presetId}/
│       │       ├── title: string
│       │       └── createdAt: timestamp
│       └── teamMemberships/
│           └── {teamId}/
│               ├── teamName: string
│               ├── role: TeamRole
│               └── joinedAt: timestamp
│
└── teams/
    └── {teamId}/
        ├── name: string
        ├── description: string?
        ├── ownerId: string
        ├── memberCount: number
        ├── settings: TeamSettings
        ├── createdAt: timestamp
        ├── members/
        │   └── {userId}/
        │       ├── role: TeamRole
        │       ├── displayName: string
        │       ├── email: string
        │       └── joinedAt: timestamp
        └── invitations/
            └── {inviteId}/
                ├── invitedBy: string
                ├── invitedEmail: string
                ├── role: TeamRole
                ├── status: 'pending' | 'accepted' | 'declined'
                └── createdAt: timestamp
```

### Tailwind CSS 4

**Why Selected:**
- **Utility First**: Rapid styling and consistent design system
- **JIT Compilation**: Generate only needed styles for minimal bundle
- **Dark Mode**: Easy dark mode implementation with `dark:` prefix
- **Responsive**: Simple responsive design with `sm:`, `md:`, `lg:` prefixes

### Radix UI

**Why Selected:**
- **Accessibility**: WCAG compliant UI components
- **Headless**: Full styling customization freedom
- **Components**: Dialog, Checkbox, Slot and other essential primitives

**Used Components:**
- `@radix-ui/react-checkbox`: Checkbox input
- `@radix-ui/react-dialog`: Modal/dialog
- `@radix-ui/react-slot`: Component composition

### Playwright

**Why Selected:**
- **Cross Browser**: Chromium, Firefox, WebKit support
- **Auto Waiting**: Automatic element loading waits
- **Parallel Execution**: Fast test feedback via parallel runs
- **Debugging Tools**: UI mode, trace viewer

### Serwist (PWA)

**Why Selected:**
- **Next.js Integration**: Simple PWA setup via `@serwist/next`
- **Service Worker**: Offline support and caching strategies
- **Auto Update**: Automatic new version detection and updates

## Development Environment Requirements

### Required Tools

| Tool | Minimum Version | Recommended Version |
|------|----------------|---------------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.x | Latest |

### Recommended IDE/Editor

- **Visual Studio Code** (recommended)
- Required extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Playwright Test for VSCode

### Environment Variables

Create `.env.local` file in project root with following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Build and Deployment

### Development Server

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Production build (Webpack)
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit -- --watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test

# Run tests in UI mode
npm run test:ui

# View test report
npm run test:report
```

### Firebase Emulators

```bash
# Start Firebase emulators
npm run emulators

# Export emulator data
npm run emulators:export

# Import emulator data
npm run emulators:import
```

### Deployment

**Vercel Deployment (Recommended):**
1. Connect GitHub repository
2. Framework preset: Next.js auto-detected
3. Environment variables: Enter Firebase keys
4. Build settings: Use defaults

**Firebase Hosting:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

## PWA Configuration

### Web App Manifest

`src/app/manifest.ts` generates PWA manifest dynamically:

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo App - Task Management',
    short_name: 'Todo',
    description: 'Manage your tasks efficiently',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
```

### Service Worker

`src/app/sw.ts` defines service worker, `@serwist/next` compiles to `public/sw.js`.

### App Installation

- **Mobile**: "Add to Home Screen" prompt
- **Desktop**: Install icon in address bar

## Code Quality

### ESLint Configuration

`eslint.config.mjs` uses Next.js recommended rules.

```bash
# Run linter
npm run lint
```

### TypeScript Configuration

`tsconfig.json` applies strict type checking:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### TRUST 5 Framework

Quality framework compliance:

- **Tested**: 85%+ coverage target, characterization tests for existing code
- **Readable**: Clear naming, English comments
- **Unified**: Consistent style, Tailwind CSS utility classes
- **Secured**: OWASP compliance, input validation (200 char limit)
- **Trackable**: Conventional commits, SPEC references

## Performance Optimization

### Applied Optimizations

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: `next/font` local fonts
4. **State Separation**: Independent subscriptions per Zustand store
5. **Caching**: Service worker caching strategy
6. **Real-time Sync**: Firestore onSnapshot for instant updates

### Bundle Size

- **Zustand**: ~1KB (gzip)
- **Firebase**: Selective imports to minimize
- **Radix UI**: Tree-shakeable, only used components bundled

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+ across all categories

## Data Validation

### Input Validation

- **Title Length**: Maximum 200 characters (client-side enforcement)
- **Email**: Firebase Auth validation
- **Dates**: HTML5 date input validation
- **Priority**: Enum validation (high, medium, low)

### Error Handling

- **Firestore Errors**: Graceful fallback to local state
- **Auth Errors**: User-friendly error messages
- **Network Errors**: Retry logic with exponential backoff

## Security Considerations

### Authentication

- **Firebase Auth**: Secure token-based authentication
- **Session Management**: Automatic token refresh
- **OAuth**: Secure Google OAuth flow

### Data Security

- **Firestore Rules**: Server-side security rules for access control
- **Input Sanitization**: Trim whitespace, limit string length
- **XSS Prevention**: React's built-in XSS protection

### Best Practices

- No hardcoded secrets (environment variables only)
- HTTPS-only in production
- Secure headers via Next.js
- CSP (Content Security Policy) configured

## Monitoring and Observability

### Logging

- **Development**: Detailed console logging via `logger.ts`
- **Production**: Conditional logging (disabled in production)
- **Error Tracking**: Firebase Crashlytics (optional)

### Analytics

- **Firebase Analytics**: User behavior tracking
- **Performance Monitoring**: Firebase Performance Monitoring (optional)

---

Last Updated: 2026-02-25
