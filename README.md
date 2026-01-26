# Todo App

Modern task management web application with real-time sync and team collaboration.

## Features

### Core Features

- **Todo Management**: Create, read, update, delete tasks with priority levels (high/medium/low)
- **Date Range**: Set start and end dates for scheduling
- **Sorting**: Sort by creation date, priority, start date, or end date
- **Filtering**: Filter by all, incomplete, or completed tasks
- **Batch Delete**: Clear all completed tasks at once

### Collaboration

- **Team Workspaces**: Create and manage team workspaces
- **Role-Based Access Control**: Owner, Admin, Editor, Viewer roles
- **Member Invitation**: Invite team members via email

### Views

- **List View**: Traditional task list display
- **Calendar View**: Date-based task visualization

### Additional Features

- **Presets**: Save frequently used tasks as templates
- **Dark Mode**: Toggle between light and dark themes
- **PWA Support**: Install as app, works offline
- **Real-time Sync**: Firebase-powered data synchronization

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.2 |
| UI Library | React | 19.2.3 |
| State Management | Zustand | 5.0.10 |
| Backend | Firebase (Auth + Firestore) | 12.8.0 |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI | - |
| Testing | Playwright | 1.57.0 |
| PWA | Serwist | 9.5.0 |
| Language | TypeScript | 5.x |

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
│   └── presetStore.ts     # Preset state management
└── lib/
    ├── firebase.ts        # Firebase configuration
    └── utils.ts           # Utility functions
```

## License

MIT

---

Built with [Claude Code](https://claude.com/claude-code)
