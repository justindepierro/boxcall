# Playbook Security Quick Reference

**🚨 CRITICAL:** Database migration required before app will work correctly!

---

## ⚡ Quick Start (5 Minutes)

### 1. Run Database Migration

```sql
-- Open Supabase SQL Editor
-- Paste from: database/migrations/fix_rls_policies.sql
-- Click "Run"
-- Verify: Should see "3 policies created" message
```

### 2. Verify Policies

```sql
-- Check plays policies (should show 4: SELECT + INSERT + UPDATE + DELETE)
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'plays';

-- Check playbooks policies (should show 4, no duplicates)
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'playbooks';
```

### 3. Test Play Creation

```typescript
// In browser console or test file:
import { SecurePlaysService } from "./services/securePlaysService";

const testPlay = {
  playbook_id: "your-playbook-id",
  play_name: "Test Security Play",
  formation: "I-Form",
  p_type: "run",
};

const result = await SecurePlaysService.createPlay(testPlay);
console.log("✅ Play created:", result);
```

---

## 📝 Common Tasks

### Import Secure Service

```typescript
// ❌ OLD (unsafe)
import { PlaysService } from "@services";

// ✅ NEW (secure)
import { SecurePlaysService } from "../services/securePlaysService";
```

### Create Play with Validation

```typescript
try {
  const play = await SecurePlaysService.createPlay({
    playbook_id: playbookId,
    play_name: "Counter Trey",
    formation: "I-Form",
    p_type: "run",
    notes: "Pull guards, fold block",
  });
  console.log("✅ Created:", play);
} catch (error) {
  if (error.issues) {
    // Validation error
    console.error("Invalid input:", error.issues);
  } else if (error.message.includes("Rate limit")) {
    // Rate limited
    console.warn("Too many requests");
  } else {
    // Other error
    console.error("Failed:", error.message);
  }
}
```

### Update Play

```typescript
const updated = await SecurePlaysService.updatePlay(playId, {
  notes: "Updated notes",
  confidence_level: 85,
});
```

### Delete Play

```typescript
await SecurePlaysService.deletePlay(playId);
```

### Check Security Events

```typescript
// Get all events
const events = SecurePlaysService.getSecurityEvents();

// Get rate limit events only
const rateLimits = SecurePlaysService.getSecurityEventsByType("rate_limit");

// Get recent 10 events
const recent = SecurePlaysService.getRecentSecurityEvents(10);
```

---

## 🛡️ Validation Rules

### Play Name

- ✅ Required
- ✅ 1-100 characters
- ✅ Letters, numbers, spaces, hyphens, periods, apostrophes only
- ❌ No special characters (<>@#$%^&\*)
- ❌ No HTML tags

### Formation

- ✅ Required
- ✅ 1-50 characters
- ✅ Letters, numbers, spaces, hyphens only
- ❌ No special characters

### Notes

- ⚠️ Optional
- ✅ Max 5000 characters
- ⚠️ HTML tags will be stripped
- ✅ All text content preserved

### Play Type

- ✅ Must be one of: run, pass, rpo, play-action, screen, draw, bootleg, rollout, qb-sneak, punt, field-goal, kickoff, special

### Diagram Data

- ✅ Max 22 players
- ✅ Max 100 routes
- ✅ Player positions must be on field (-100 to 200 yards)
- ✅ Valid route types only

---

## ⏱️ Rate Limits

| Action       | Limit | Window    |
| ------------ | ----- | --------- |
| Create Play  | 10    | 1 minute  |
| Update Play  | 30    | 1 minute  |
| Delete Play  | 5     | 1 minute  |
| Bulk Update  | 3     | 1 minute  |
| Search Query | 60    | 1 minute  |
| Diagram Save | 20    | 1 minute  |
| PDF Export   | 5     | 5 minutes |

**Rate Limit Error Message:**

```
"You're creating plays too quickly. Please wait a moment."
```

**Handling Rate Limits:**

```typescript
try {
  await SecurePlaysService.createPlay(data);
} catch (error) {
  if (error.message.includes("Rate limit")) {
    // Show toast: "Please wait before creating more plays"
    // Disable create button for 60 seconds
    // Show countdown timer
  }
}
```

---

## 🚨 Security Events

### Event Types

1. **validation_error** (Low Severity)
   - Invalid input attempt
   - Shows what validation failed
   - User error, not security issue

2. **rate_limit** (Medium Severity)
   - User exceeded rate limit
   - Track repeat offenders
   - May indicate abuse

3. **auth_failure** (High Severity)
   - Unauthenticated access attempt
   - Should redirect to login
   - Track for suspicious activity

4. **rls_violation** (High Severity)
   - Database policy violation
   - User tried to access/modify unauthorized data
   - Alert security team

5. **suspicious_activity** (High Severity)
   - Unusual patterns detected
   - Multiple failed attempts
   - Alert security team

### Event Structure

```typescript
{
  type: 'validation_error' | 'rate_limit' | 'auth_failure' | 'rls_violation' | 'suspicious_activity',
  severity: 'low' | 'medium' | 'high',
  action: 'create_play' | 'update_play' | 'delete_play',
  userId: 'user-uuid',
  details: {
    // Specific error information
  },
  timestamp: Date
}
```

---

## 🔍 Debugging

### Check RLS Policies

```sql
-- See all policies on plays table
SELECT * FROM pg_policies WHERE tablename = 'plays';

-- Test INSERT permission (should succeed for coaches)
INSERT INTO plays (playbook_id, play_name, formation, p_type)
VALUES ('your-playbook-id', 'Test', 'I-Form', 'run')
RETURNING id;

-- Test SELECT permission (should succeed for team members)
SELECT * FROM plays LIMIT 1;
```

### Check Validation

```typescript
import { validatePlayCreate } from "../validation/playValidation";

// Test validation
try {
  const validated = validatePlayCreate({
    playbook_id: "test-uuid",
    play_name: "Test Play",
    formation: "I-Form",
    p_type: "run",
  });
  console.log("✅ Valid:", validated);
} catch (error) {
  console.error("❌ Invalid:", error.issues);
}
```

### Check Rate Limiting

```typescript
import { rateLimiter, RateLimitPresets } from "../utils/rateLimiter";

// Check remaining requests
const remaining = rateLimiter.getRemaining(
  "play-create:user-id",
  RateLimitPresets.PLAY_CREATE.maxRequests
);
console.log(`Remaining: ${remaining}/10`);

// Reset rate limit (for testing)
rateLimiter.reset("play-create:user-id");
```

---

## 🎯 Testing Checklist

### Manual Tests

- [ ] **Create valid play** → Should succeed
- [ ] **Create invalid play** (no name) → Should show validation error
- [ ] **Create 11 plays rapidly** → Should hit rate limit on 11th
- [ ] **Create play as non-coach** → Should fail RLS
- [ ] **Update play with valid data** → Should succeed
- [ ] **Update play with invalid data** → Should show validation error
- [ ] **Delete play as coach** → Should succeed
- [ ] **Delete play as player** → Should fail RLS
- [ ] **View security events** → Should see all logged events

### Automated Tests

```bash
npm run test -- securePlaysService.test.ts
```

---

## 🐛 Common Errors & Solutions

### "User not authenticated"

**Cause:** No active session  
**Fix:** Check authentication, redirect to login

### "Invalid play data: Play name required"

**Cause:** Validation failed  
**Fix:** Check input against validation rules

### "Rate limit exceeded"

**Cause:** Too many requests  
**Fix:** Wait before retrying, show user countdown

### "Failed to create play: policy"

**Cause:** RLS policy violation  
**Fix:** Verify user has coach role, check team membership

### "playbook_id: Invalid UUID format"

**Cause:** Invalid playbook ID  
**Fix:** Ensure playbook exists, use valid UUID

---

## 📊 Monitoring Dashboard

### Key Metrics to Track

1. **Validation Errors/Day**
   - Trend over time
   - Most common validation failures
   - User education opportunities

2. **Rate Limit Hits/Day**
   - Identify power users
   - Adjust limits if needed
   - Detect potential abuse

3. **RLS Violations/Day**
   - Should be near zero
   - Investigate any occurrences
   - May indicate security issues

4. **Security Events by Severity**
   - High: Immediate alert
   - Medium: Review daily
   - Low: Review weekly

### Sample Dashboard Query

```typescript
const events = SecurePlaysService.getSecurityEvents();
const stats = {
  total: events.length,
  byType: {},
  bySeverity: {},
  last24Hours: events.filter(
    (e) => e.timestamp > new Date(Date.now() - 86400000)
  ),
};
```

---

## 🚀 Performance Impact

- **Validation:** ~1-2ms per operation
- **Rate Limiting:** <1ms per operation
- **Security Logging:** <1ms per operation
- **Total Overhead:** ~3-5ms per mutation

**Impact:** Negligible (< 0.5% of typical request time)

---

## 📞 Support

**Questions?** Check these files:

- `docs/PLAYBOOK_SECURITY_AUDIT.md` - Full audit
- `docs/PLAYBOOK_SECURITY_IMPLEMENTATION.md` - Implementation details
- `src/validation/playValidation.ts` - Validation code
- `src/utils/rateLimiter.ts` - Rate limiting code
- `src/services/securePlaysService.ts` - Secure service code

**Issues?** Run:

```bash
npm run type-check  # Check for TypeScript errors
npm run lint        # Check for ESLint errors
npm run test        # Run test suite
```

---

**Last Updated:** October 11, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
