# Team Collaboration Feature Design

## Overview

This document describes the design for adding team collaboration features to the Todo App, transforming it from a personal todo list to a shared collaboration platform for couples, families, and small teams (2-5 people).

## Requirements

### Functional Requirements

1. **Team Management**
   - Users can create teams
   - Users can invite members via email or shareable link
   - Users can leave teams
   - Team owners can delete teams

2. **Role-Based Access Control**
   - Owner: Full control (delete team, manage all members)
   - Admin: Can invite/remove members (except owner), manage todos
   - Editor: Can create/edit/delete own todos
   - Viewer: Read-only access

3. **Invitation System**
   - Email invitation: Send invite to specific email
   - Link invitation: Generate shareable link with expiration
   - Accept/decline invitations

4. **Personal + Team Todos**
   - Keep existing personal todo functionality
   - Add separate team todo workspace
   - Switch between personal and team contexts

### Non-Functional Requirements

- Real-time synchronization across team members
- Security: Users can only access teams they belong to
- Performance: Efficient queries for small teams (2-5 members)

## Data Model

### Firestore Collections

```
/teams/{teamId}
├── name: string
├── description?: string
├── ownerId: string
├── memberCount: number
├── createdAt: Timestamp
└── settings: {
      defaultRole: 'editor' | 'viewer'
      allowInviteLinks: boolean
    }

/teams/{teamId}/members/{userId}
├── role: 'owner' | 'admin' | 'editor' | 'viewer'
├── displayName: string
├── email: string
└── joinedAt: Timestamp

/teams/{teamId}/todos/{todoId}
├── title: string
├── description?: string
├── completed: boolean
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── completedAt: Timestamp | null
├── startDate?: string
├── endDate?: string
├── priority?: 'high' | 'medium' | 'low'
├── createdBy: string
├── assignedTo?: string[]
└── lastModifiedBy: string

/invitations/{invitationId}
├── teamId: string
├── teamName: string
├── type: 'email' | 'link'
├── email?: string
├── token?: string
├── role: 'admin' | 'editor' | 'viewer'
├── status: 'pending' | 'accepted' | 'expired' | 'cancelled'
├── expiresAt: Timestamp
├── createdAt: Timestamp
└── createdBy: string

/users/{userId}/teamMemberships/{teamId}
├── teamName: string
├── role: TeamRole
└── joinedAt: Timestamp
```

## Security Rules

### Permission Matrix

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| Delete team | Yes | No | No | No |
| Update team settings | Yes | Yes | No | No |
| Invite members | Yes | Yes | No | No |
| Change member roles | Yes | Yes* | No | No |
| Remove members | Yes | Yes* | No | No |
| Create todos | Yes | Yes | Yes | No |
| Edit todos | Yes | Yes | Yes | No |
| Delete todos | Yes | Yes | Own only | No |
| View todos | Yes | Yes | Yes | Yes |

*Admin can only manage Editor and Viewer roles

### Firestore Security Rules

The security rules implement:
- User isolation for personal data
- Team membership verification
- Role-based access control for team resources
- Invitation access control

## Architecture

### State Management (Zustand Stores)

1. **teamStore**: Team CRUD, member management, current team selection
2. **invitationStore**: Invitation creation, acceptance, rejection
3. **teamTodoStore**: Team todos CRUD (extends todoStore pattern)
4. **workspaceStore**: Personal/team context switching

### UI Components

1. **TeamSwitcher**: Dropdown for switching between personal and team workspaces
2. **CreateTeamDialog**: Modal for creating new teams
3. **TeamSettings**: Team configuration page
4. **TeamMembers**: Member list with role management
5. **InviteDialog**: Modal for email/link invitations
6. **InvitationList**: Pending invitations display

### Routes

- `/` - Main page (personal or team todos based on context)
- `/teams` - Team list
- `/teams/[teamId]/settings` - Team settings
- `/join/[token]` - Accept invitation via link

## Implementation Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Firestore schema and security rules | Completed |
| **Phase 2** | Zustand stores (teamStore, invitationStore) | Completed |
| **Phase 3** | UI components (TeamSwitcher, CreateTeamDialog, TeamMembers, InviteDialog) | Completed |
| **Phase 4** | Route integration (AuthProvider, UserMenu, page.tsx) | Completed |
| **Phase 5** | Testing and deployment | Pending |

## Implementation Summary

### Completed Components (MVP)

| Component | File | Description |
|-----------|------|-------------|
| `teamStore` | `src/store/teamStore.ts` | Team CRUD, member management, Firestore subscriptions |
| `invitationStore` | `src/store/invitationStore.ts` | Email/link invitations, accept/decline/revoke |
| `TeamSwitcher` | `src/components/team/TeamSwitcher.tsx` | Personal/team workspace switching |
| `CreateTeamDialog` | `src/components/team/CreateTeamDialog.tsx` | New team creation modal |
| `TeamMembers` | `src/components/team/TeamMembers.tsx` | Member list with role management |
| `InviteDialog` | `src/components/team/InviteDialog.tsx` | Email and link invitation tabs |
| `AuthProvider` | `src/components/auth/AuthProvider.tsx` | Team subscription integration |
| `UserMenu` | `src/components/auth/UserMenu.tsx` | Team management menu options |
| `firestore.rules` | `firestore.rules` | Security rules for team access control |

## Approved

- Date: 2026-01-22
- Approver: User
- Implementation Date: 2026-01-23
