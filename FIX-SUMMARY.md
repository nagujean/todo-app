# Fix Summary: userId Assignment Issue

## Problem Description

When users logged in via email/password, the Todo creation would fail with:
```
FirebaseError: Missing or insufficient permissions.
```

The root cause was that `userId` was `null` in the `todoStore` even after successful Firebase authentication.

## Root Cause Analysis

### The Issue

**Race Condition**: In `LoginForm.tsx` and `SignupForm.tsx`, the code was calling `router.push('/')` immediately after `signIn()` / `signUp()` returned:

```typescript
// BEFORE (BROKEN):
await signIn(email, password)
router.push('/')  // Redirects immediately!
```

The flow that was happening:
1. `signInWithEmailAndPassword()` authenticates with Firebase (succeeds)
2. **Immediately** `router.push('/')` is called
3. User navigates to home page
4. User tries to create a todo
5. `userId` is still `null` because Firebase's `onAuthStateChanged` listener hasn't fired yet
6. Firestore operation fails with permissions error

### Why This Happened

Firebase's `onAuthStateChanged` listener is **asynchronous**. When `signInWithEmailAndPassword` returns, the authentication is complete, but the auth state observer hasn't fired yet. The observer needs time to:
1. Detect the auth state change
2. Call the callback with the user object
3. Update the Zustand store via `setUser(user)`
4. Trigger `subscribeToTodos` in AuthProvider

## Solution

Remove the immediate `router.push('/')` from the login/signup forms. The `AuthProvider` component already handles automatic routing based on auth state changes.

### Changes Made

#### 1. `src/components/auth/LoginForm.tsx`
- Removed `router.push('/')` after `signIn()`
- Removed `router.push('/')` after `signInWithGoogle()`
- Removed unused `useRouter` import

**After Fix:**
```typescript
try {
  await signIn(email, password)
  // AuthProvider will handle redirect when user state is updated
} catch {
  // Error is handled in the store
}
```

#### 2. `src/components/auth/SignupForm.tsx`
- Removed `router.push('/')` after `signUp()`
- Removed `router.push('/')` after `signInWithGoogle()`
- Removed unused `useRouter` import

#### 3. `firestore.rules`
- Restored original production Security Rules from backup
- The complex rules were correct all along - the issue was with userId being null

## How It Works Now

1. User enters credentials and clicks "로그인"
2. `signInWithEmailAndPassword()` authenticates with Firebase
3. **No immediate redirect** - form waits
4. Firebase's `onAuthStateChanged` listener fires
5. `setUser(user)` updates the authStore
6. AuthProvider detects user state change
7. `subscribeToTodos(user.uid)` is called
8. `setUserId(user.uid)` updates todoStore
9. AuthProvider's routing logic automatically redirects to `/`
10. User can now create todos with valid userId

## Testing

To verify the fix works:
1. Start the dev server: `npm run dev`
2. Run: `node verify-fix.js`
3. Check that userId is properly set after login
4. Verify that todos can be created successfully

## Files Modified

- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `firestore.rules` (restored from backup)

## Verification Script

A `verify-fix.js` script has been created to test the fix:
- Logs in with test account
- Waits for automatic redirect
- Checks userId in todoStore
- Attempts to create a todo
- Reports success/failure

## Related Issues

This fix also ensures that:
- User experience is smoother (no premature navigation)
- Loading states are properly maintained during auth
- Error handling works correctly
- Google Sign-In works the same way

---
Date: 2026-02-25
Fixed by: Claude Code (MoAI orchestrator)
