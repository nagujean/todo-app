# Todo App - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   React Components                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │   Auth   │  │   Todo   │  │   Team   │  │   UI    │  │  │
│  │  │ Components│  │Components│  │Components│  │Components│  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Zustand Stores                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │  authStore  │  │  todoStore  │  │  teamStore  │  ...   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PWA Layer                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Service Worker (Serwist)                      │  │
│  │  • Cache First: Static assets (JS, CSS, Images)           │  │
│  │  • Network First: API requests (Firestore)                │  │
│  │  • Stale While Revalidate: HTML pages                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Firebase BaaS Layer                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Firebase Auth                             │  │
│  │  • Email/Password Authentication                           │  │
│  │  • Google OAuth                                            │  │
│  │  • Session Management                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Firestore Database                        │  │
│  │  • Real-time Data Synchronization                         │  │
│  │  • Collection: /users/{userId}/todos/{todoId}             │  │
│  │  • Collection: /teams/{teamId}/members/{userId}           │  │
│  │  • Collection: /teams/{teamId}/invitations/{inviteId}     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Relationships

### Authentication Flow

```
User Action
    ↓
LoginForm / SignupForm
    ↓
Firebase Auth (signInWithEmailAndPassword / createUserWithEmailAndPassword)
    ↓
onAuthStateChanged Listener
    ↓
authStore.setUser(user)
    ↓
UI Re-render (Authenticated State)
```

### Todo CRUD Flow

```
User Action (Add/Edit/Delete Todo)
    ↓
TodoInput / TodoItem / TodoDetail
    ↓
todoStore Action (addTodo / updateTodo / deleteTodo)
    ↓
Firestore Operation (addDoc / updateDoc / deleteDoc)
    ↓
onSnapshot Listener (Real-time Sync)
    ↓
todoStore.setTodos()
    ↓
TodoList Re-render
```

### Team Collaboration Flow

```
User Action (Create Team / Invite Member)
    ↓
TeamSwitcher / CreateTeamDialog / InviteDialog
    ↓
teamStore Action (addTeam / inviteMember)
    ↓
Firestore Operation (teams collection)
    ↓
onSnapshot Listener (Real-time Sync)
    ↓
teamStore.setTeams()
    ↓
UI Update (Team Switcher)
```

## Data Models

### Todo Model

```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  startDate: string; // ISO date format
  endDate: string; // ISO date format
  createdAt: Date;
  userId: string;
  teamId?: string;
}
```

### Team Model

```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  ownerId: string;
}

interface TeamMember {
  teamId: string;
  userId: string;
  role: "owner" | "admin" | "editor" | "viewer";
  createdAt: Date;
}

interface Invitation {
  id: string;
  teamId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "rejected";
  invitedBy: string;
  createdAt: Date;
}
```

### User Model

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}
```

## State Management Architecture

### Zustand Store Pattern

```typescript
// Store Structure
interface Store {
  // State
  data: any[];
  loading: boolean;
  error: string | null;

  // Actions
  fetch: () => Promise<void>;
  add: (item: any) => Promise<void>;
  update: (id: string, updates: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// Firestore Integration Pattern
const store = create<Store>((set, get) => ({
  data: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true });
    const q = query(collection(db, "collection"), where("userId", "==", user.uid));
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      set({ data, loading: false });
    });
  },
}));
```

## Security Architecture

### Authentication & Authorization

```
Unauthenticated User
    ↓
Login Page (/login)
    ↓
Firebase Auth (Email/Password or Google OAuth)
    ↓
Auth Token (JWT)
    ↓
Firestore Security Rules
    ↓
Authorized Access
```

### Role-Based Access Control (RBAC)

```
Team Member
    ↓
Role Check (Owner/Admin/Editor/Viewer)
    ↓
Permission Matrix
    ↓
Action Allowed/Denied

Permission Matrix:
┌───────────┬───────┬───────┬───────┬────────┐
│ Action    │ Owner │ Admin │ Editor│ Viewer │
├───────────┼───────┼───────┼───────┼────────┤
│ View Todos│   ✓   │   ✓   │   ✓   │   ✓    │
│ Add Todo  │   ✓   │   ✓   │   ✓   │   ✗    │
│ Edit Todo │   ✓   │   ✓   │   ✓   │   ✗    │
│ Delete Todo│   ✓  │   ✓   │   ✓   │   ✗    │
│ Manage Members│ ✓ │   ✓   │   ✗   │   ✗    │
│ Delete Team│   ✓  │   ✗   │   ✗   │   ✗    │
└───────────┴───────┴───────┴───────┴────────┘
```

### Firestore Security Rules

```javascript
// Example Security Rules
match /users/{userId}/todos/{todoId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}

match /teams/{teamId} {
  allow read: if isMember(teamId);
  allow create: if request.auth != null;
  allow update, delete: if isOwner(teamId);

  function isMember(teamId) {
    return exists(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid));
  }

  function isOwner(teamId) {
    return get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId == request.auth.uid;
  }
}
```

## PWA Architecture

### Service Worker Strategy

```
Request
    ↓
Service Worker (sw.js)
    ↓
Cache Strategy Check
    ├── Static Assets (JS, CSS, Images) → Cache First
    ├── API Requests (Firestore) → Network First
    └── HTML Pages → Stale While Revalidate
    ↓
Response
```

### Offline Capability

```
Online Mode
    ↓
Cache Static Assets
    ↓
Store Todos in Firestore
    ↓
Go Offline
    ↓
Service Worker Serves Cached Assets
    ↓
IndexedDB for Offline Storage (Future)
    ↓
Go Online
    ↓
Sync with Firestore
```

## Performance Optimization

### Code Splitting

```
Main Bundle (app/page.tsx)
    ↓
Lazy Load Components
    ├── Auth Components (lazy loaded)
    ├── Team Components (lazy loaded)
    └── Calendar View (lazy loaded)
```

### Image Optimization

```
User Avatar
    ↓
next/image Component
    ↓
Automatic Optimization (WebP/AVIF)
    ↓
Responsive Sizing
    ↓
Lazy Loading
```

### Bundle Optimization

```
Source Code
    ↓
Webpack (Next.js)
    ↓
Tree Shaking (Remove unused code)
    ↓
Minification (Terser)
    ↓
Code Splitting (Route-based)
    ↓
Production Bundle (500KB gzip)
```

## Testing Architecture

### Unit Testing (Vitest)

```
Component/Store
    ↓
Test File (*.test.tsx)
    ↓
Testing Library Render
    ↓
User Event Simulation
    ↓
Assertion
    ↓
Pass/Fail
```

### E2E Testing (Playwright)

```
User Journey
    ↓
Test File (*.spec.ts)
    ↓
Browser Launch (Chromium/Firefox/WebKit)
    ↓
Page Navigation
    ↓
User Interaction (Click, Type)
    ↓
Assertion (Element Visible, Text Match)
    ↓
Screenshot/Trace (on failure)
    ↓
Pass/Fail
```

## Deployment Architecture

### CI/CD Pipeline

```
GitHub Push (main branch)
    ↓
GitHub Actions Workflow
    ↓
Install Dependencies
    ↓
Run Tests (Vitest + Playwright)
    ↓
Build Production Bundle
    ↓
Deploy to Vercel
    ↓
Edge Network Distribution
    ↓
Live URL
```

### Production Environment

```
User Request
    ↓
Vercel Edge Network
    ↓
Nearest Server
    ↓
Next.js App (Server-Side)
    ↓
Static Assets (CDN)
    ↓
Firebase (Backend)
    ↓
Response
```

---

Last Updated: 2026-03-16
