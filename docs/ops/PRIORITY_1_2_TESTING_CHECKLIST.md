# Priority 1 & 2 Testing Checklist

**Date**: October 2, 2025  
**Branch**: `fix/codebase-cleanup`  
**Purpose**: Manual testing checklist for auth workflow improvements

## Testing Overview

This checklist covers all features implemented in Priority 1 and Priority 2 improvements:
- **Priority 1**: Return URLs, logout confirmation, logger system
- **Priority 2**: Constants, JSDoc comments, enhanced error messages

---

## Priority 1 Features

### ✅ Return URL Preservation System

**What to Test**: Navigation flow after login preserves intended destination

#### Test Cases:

- [ ] **Test 1.1**: Unauthenticated Access
  1. While logged out, navigate to `/dashboard`
  2. Should redirect to `/login` with return URL in query
  3. After login, should redirect back to `/dashboard`
  4. **Expected**: User lands on dashboard after successful login

- [ ] **Test 1.2**: Deep Link Navigation
  1. While logged out, navigate to `/playbooks/123`
  2. Should redirect to `/login` with return URL
  3. After login, should redirect back to `/playbooks/123`
  4. **Expected**: User lands on specific playbook page

- [ ] **Test 1.3**: Auth Route Exclusion
  1. While logged out, navigate to `/login`
  2. Manually add `?returnUrl=/login` to URL
  3. After login, should redirect to `/dashboard` (default)
  4. **Expected**: No redirect loop; lands on dashboard

- [ ] **Test 1.4**: Invalid Return URL
  1. While logged out, navigate to `/login?returnUrl=javascript:alert(1)`
  2. After login, should redirect to `/dashboard` (XSS protection)
  3. **Expected**: Malicious URL blocked; safe redirect to dashboard

- [ ] **Test 1.5**: External URL Rejection
  1. While logged out, navigate to `/login?returnUrl=https://evil.com`
  2. After login, should redirect to `/dashboard`
  3. **Expected**: External URL blocked; safe redirect to dashboard

- [ ] **Test 1.6**: Return URL Storage Cleanup
  1. Complete Test 1.1 successfully
  2. Open browser DevTools → Application → Local Storage
  3. Check for `boxcall_return_url` key
  4. **Expected**: Key should be deleted after successful login

---

### ✅ Logout Confirmation (Two-Click)

**What to Test**: Logout requires two clicks to prevent accidental logouts

#### Test Cases:

- [ ] **Test 2.1**: First Click Shows Confirmation
  1. While logged in, click user menu (top right)
  2. Click "Sign Out" button
  3. **Expected**: Button text changes to "Click again to confirm"
  4. **Expected**: User remains logged in

- [ ] **Test 2.2**: Second Click Logs Out
  1. Continue from Test 2.1
  2. Click "Click again to confirm" button
  3. **Expected**: User is logged out and redirected to `/login`

- [ ] **Test 2.3**: Confirmation Timeout Reset
  1. While logged in, click user menu
  2. Click "Sign Out" (first click)
  3. Close the user menu (click outside)
  4. Re-open user menu
  5. **Expected**: Button resets to "Sign Out" (confirmation cleared)

- [ ] **Test 2.4**: Visual Feedback
  1. While logged in, click user menu
  2. Click "Sign Out" (first click)
  3. **Expected**: Button styling changes (warning color, different text)

---

### ✅ Logger System with Levels

**What to Test**: Logging system works correctly in dev and production environments

#### Test Cases:

- [ ] **Test 3.1**: Development Mode Logging
  1. Ensure app is running in development mode (`npm run dev`)
  2. Open browser DevTools → Console
  3. Trigger auth actions (login, logout, navigation)
  4. **Expected**: See colored log messages with prefixes:
     - `[AUTH]` for auth events
     - `[NAV]` for navigation events
     - `[DEBUG]` for debug messages
     - `[INFO]`, `[WARN]`, `[ERROR]`, `[SUCCESS]` for other levels

- [ ] **Test 3.2**: Log Level Filtering
  1. In DevTools console, check for:
     - Debug messages (gray/dimmed)
     - Info messages (blue)
     - Warning messages (yellow/orange)
     - Error messages (red)
     - Success messages (green)
  2. **Expected**: Each level has distinct visual styling

- [ ] **Test 3.3**: Auth-Specific Logging
  1. Attempt to log in with invalid credentials
  2. Check console for `[AUTH]` prefixed error
  3. Log in successfully
  4. Check console for `[AUTH]` prefixed success
  5. **Expected**: Auth events clearly labeled

- [ ] **Test 3.4**: Navigation Logging
  1. Navigate between protected routes while logged in
  2. Check console for `[NAV]` prefixed messages
  3. Trigger a return URL save (logout, try to access protected route)
  4. **Expected**: Navigation events logged with details

- [ ] **Test 3.5**: Grouped Logs
  1. Perform a complex action (e.g., sign up)
  2. Check console for grouped log messages
  3. **Expected**: Related logs grouped together (collapsible)

- [ ] **Test 3.6**: Production Mode (Optional)
  1. Build for production: `npm run build`
  2. Serve production build: `npm run preview`
  3. Open DevTools → Console
  4. **Expected**: Minimal logging (only errors/warnings, no debug)

---

## Priority 2 Features

### ✅ Constants Extraction

**What to Test**: No functional changes; verify system works with centralized constants

#### Test Cases:

- [ ] **Test 4.1**: Session Refresh Timing
  1. Log in successfully
  2. Wait 10+ minutes (or modify SESSION_CHECK_INTERVAL for faster testing)
  3. **Expected**: Session refreshes automatically without user action

- [ ] **Test 4.2**: Network Retry Logic
  1. Log in successfully
  2. Open DevTools → Network tab
  3. Enable "Offline" mode
  4. Trigger an auth action (e.g., profile update)
  5. Disable "Offline" mode
  6. **Expected**: Request retries and succeeds after coming back online

- [ ] **Test 4.3**: Profile Cache TTL
  1. Log in successfully
  2. Open DevTools → Application → Cache Storage
  3. Check profile cache timestamp
  4. Wait 5+ minutes (PROFILE_CACHE_TTL)
  5. Trigger profile fetch
  6. **Expected**: Profile refetched from server (cache expired)

---

### ✅ JSDoc Comments

**What to Test**: Documentation improvements (IDE experience, not runtime)

#### Test Cases:

- [ ] **Test 5.1**: Function Hover Documentation
  1. Open `src/utils/navigationUtils.ts` in editor
  2. Import `saveReturnUrl` in another file
  3. Hover over the function name
  4. **Expected**: See JSDoc tooltip with:
     - Description
     - Parameter documentation
     - Return type
     - Usage example

- [ ] **Test 5.2**: Logger Method Documentation
  1. Open any file using the logger
  2. Type `logger.` and wait for autocomplete
  3. Hover over each method (debug, info, warn, error, etc.)
  4. **Expected**: See detailed JSDoc with parameter descriptions

- [ ] **Test 5.3**: Security Documentation
  1. Open `src/utils/navigationUtils.ts`
  2. Find `isValidReturnUrl` function
  3. Read JSDoc comment
  4. **Expected**: Security note about XSS prevention is clearly documented

---

### ✅ Enhanced Error Messages

**What to Test**: Error messages are clear, actionable, and user-friendly

#### Test Cases:

- [ ] **Test 6.1**: Invalid Login Credentials
  1. Navigate to `/login`
  2. Enter incorrect email/password
  3. Submit form
  4. **Expected**: Error message: "Invalid email or password. Please double-check your credentials and try again. Forgot your password? Use the reset link below."

- [ ] **Test 6.2**: Email Not Confirmed
  1. Create account but don't confirm email
  2. Try to log in
  3. **Expected**: Error message: "Email not verified yet. Please check your inbox for the confirmation email. Can't find it? Check your spam folder or request a new confirmation email."

- [ ] **Test 6.3**: Rate Limiting
  1. Attempt to log in with wrong password 5+ times
  2. **Expected**: Error message: "Too many login attempts detected. For security, please wait 5-10 minutes before trying again. This helps protect your account from unauthorized access."

- [ ] **Test 6.4**: Network Error
  1. Open DevTools → Network tab
  2. Enable "Offline" mode
  3. Try to log in
  4. **Expected**: Error message: "Network connection issue detected. Please check your internet connection and try again. If the problem persists, try refreshing the page."

- [ ] **Test 6.5**: Session Expired
  1. Log in successfully
  2. Manually expire session (or wait several hours)
  3. Try to access protected resource
  4. **Expected**: Error message: "Your session has expired for security reasons. Please sign in again to continue."

- [ ] **Test 6.6**: Password Reset Flow
  1. Navigate to password reset page
  2. Enter email address
  3. Submit form
  4. Check error message if email not found
  5. **Expected**: "If an account exists with this email, you will receive password reset instructions shortly." (Security: don't reveal if account exists)

- [ ] **Test 6.7**: Duplicate Account Registration
  1. Try to sign up with an existing email
  2. **Expected**: Error message: "An account with this email already exists. Try signing in instead, or use the password reset option if you forgot your password."

- [ ] **Test 6.8**: Weak Password
  1. Try to sign up with password "123"
  2. **Expected**: Error message: "Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols."

- [ ] **Test 6.9**: Sign Out Error Handling
  1. Log in successfully
  2. Open DevTools → Network tab
  3. Enable "Offline" mode
  4. Try to sign out
  5. **Expected**: Local state cleared even if API fails
  6. **Expected**: Error message: "Network error during sign out. Your session may still be cleared locally."

---

## Cross-Feature Integration Tests

### Combined Feature Testing

- [ ] **Test 7.1**: Return URL + Error Messages
  1. While logged out, navigate to `/playbooks/123`
  2. Redirected to `/login` with return URL
  3. Enter wrong password
  4. **Expected**: See enhanced error message
  5. Enter correct password
  6. **Expected**: Redirect to `/playbooks/123` with success logging

- [ ] **Test 7.2**: Logout Confirmation + Logger
  1. Open DevTools → Console
  2. Click user menu → Sign Out (first click)
  3. **Expected**: See `[NAV]` or `[AUTH]` log for confirmation state
  4. Click "Click again to confirm"
  5. **Expected**: See `[AUTH]` log for sign out success

- [ ] **Test 7.3**: Error Message + Logger
  1. Open DevTools → Console
  2. Trigger any auth error (wrong password, network error, etc.)
  3. **Expected**: See both:
     - User-friendly error message in UI
     - Detailed error log in console (dev mode)

---

## Browser Compatibility

Test in multiple browsers to ensure consistent behavior:

- [ ] **Chrome/Chromium** (primary)
- [ ] **Firefox**
- [ ] **Safari** (macOS)
- [ ] **Edge** (optional)

---

## Performance Checks

- [ ] **Test 8.1**: No Performance Regression
  1. Open DevTools → Performance tab
  2. Record login flow
  3. Stop recording
  4. **Expected**: No significant performance impact from logging/error handling

- [ ] **Test 8.2**: Console Log Volume
  1. Open DevTools → Console
  2. Perform typical user flow (login, navigate, logout)
  3. Count log messages
  4. **Expected**: Reasonable log volume (not spammy)

---

## Accessibility

- [ ] **Test 9.1**: Screen Reader Compatibility
  1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
  2. Navigate through login flow
  3. Trigger error messages
  4. **Expected**: Error messages announced clearly

- [ ] **Test 9.2**: Keyboard Navigation
  1. Use only keyboard (Tab, Enter, Escape)
  2. Navigate through logout confirmation
  3. **Expected**: All interactions accessible via keyboard

---

## Regression Testing

Ensure existing functionality still works:

- [ ] **Test 10.1**: Basic Login/Logout
  1. Log in with valid credentials
  2. Navigate to dashboard
  3. Log out
  4. **Expected**: Standard flow works without issues

- [ ] **Test 10.2**: Profile Loading
  1. Log in successfully
  2. Check that user profile loads
  3. **Expected**: Profile data displays correctly

- [ ] **Test 10.3**: Route Protection
  1. While logged out, try to access protected routes
  2. **Expected**: Redirected to login (existing behavior preserved)

---

## Test Results

### Summary

- **Total Test Cases**: 40+
- **Passed**: ___ / ___
- **Failed**: ___ / ___
- **Skipped**: ___ / ___

### Notes

_Document any issues, unexpected behavior, or follow-up items here._

---

## Sign-Off

- [ ] All Priority 1 features tested and working
- [ ] All Priority 2 features tested and working
- [ ] No critical bugs found
- [ ] No performance regressions
- [ ] Ready for merge to main

**Tester**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## Related Documentation

- [Auth Audit Summary](./AUTH_AUDIT_SUMMARY.md)
- [Complete Auth Workflow Audit](./COMPLETE_AUTH_WORKFLOW_AUDIT.md)
- [Future Proofing Implementation](./AUTH_FUTURE_PROOFING_IMPLEMENTATION.md)
- [Logger Integration Summary](./LOGGER_INTEGRATION_SUMMARY.md)
- [Future Proofing Commit Summary](./FUTURE_PROOFING_COMMIT_SUMMARY.md)
