# Firebase Cloud Functions

This folder contains Firebase Cloud Functions for the Todo App, including team invitation email functionality.

## Functions

### 1. `sendInvitationEmail`
- **Trigger**: Firestore `onCreate` on `invitations` collection
- **Purpose**: Sends invitation emails when a new email-type invitation is created
- **Region**: asia-northeast3 (Seoul)

### 2. `testEmailConfig`
- **Trigger**: HTTP request (development only)
- **Purpose**: Tests SMTP configuration
- **URL**: `http://localhost:5001/{project-id}/asia-northeast3/testEmailConfig`

### 3. `cleanupExpiredInvitations`
- **Trigger**: Scheduled (daily at midnight KST)
- **Purpose**: Marks expired pending invitations as "expired"

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

#### For Local Development (Emulator)

Create a `.env` file in the `functions` folder:

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials.

#### For Production (Firebase)

Set environment variables using Firebase CLI:

```bash
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
firebase functions:secrets:set SMTP_FROM
firebase functions:secrets:set APP_URL
```

Or use Firebase Functions Config (legacy):

```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.pass="your-app-password"
firebase functions:config:set smtp.from="Todo App <noreply@your-domain.com>"
firebase functions:config:set app.url="https://your-app-url.vercel.app"
```

### 3. Gmail App Password Setup

If using Gmail:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Use this password as `SMTP_PASS`

### 4. Build and Run

#### Local Development with Emulator

```bash
# Build TypeScript
npm run build

# Start emulators (from project root)
firebase emulators:start

# Or start only functions emulator
npm run serve
```

#### Deploy to Production

```bash
npm run deploy
```

## Email Template

The invitation email includes:
- Team name
- Assigned role (Editor/Viewer)
- Accept invitation button/link
- Expiration date
- Professional HTML design with plain text fallback

## Document Fields Added

When an invitation email is processed, the following fields are added to the invitation document:

| Field | Type | Description |
|-------|------|-------------|
| `emailStatus` | string | `sent`, `failed`, or `not_configured` |
| `emailSentAt` | timestamp | When the email was sent (if successful) |
| `emailMessageId` | string | SMTP message ID (if successful) |
| `emailError` | string | Error message (if failed) |

## Testing

### Test Email Configuration

With emulator running:

```bash
curl http://localhost:5001/{project-id}/asia-northeast3/testEmailConfig
```

### Trigger Email Manually

Create a test invitation in Firestore Emulator UI or via code:

```javascript
await addDoc(collection(db, 'invitations'), {
  teamId: 'test-team-id',
  teamName: 'Test Team',
  type: 'email',
  email: 'test@example.com',
  role: 'editor',
  createdBy: 'user-id',
  createdAt: serverTimestamp(),
  expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  status: 'pending',
});
```

## Troubleshooting

### Email not sending
1. Check SMTP credentials in `.env`
2. Verify Gmail App Password (not regular password)
3. Check Firebase Functions logs: `firebase functions:log`

### "SMTP not configured" error
- Ensure all required environment variables are set
- Check `.env` file exists in `functions` folder

### Connection timeout
- Verify SMTP host and port
- Check firewall settings
- Try port 587 (TLS) instead of 465 (SSL)
