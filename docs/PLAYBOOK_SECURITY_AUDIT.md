# Playbook Page Security & Bulletproofing Audit

**Date:** October 11, 2025  
**Scope:** Complete security audit of PlaybookPage, database access, RLS policies, and error handling

---

## 🔒 Executive Summary

**Status:** ⚠️ **NEEDS ATTENTION**

### Critical Issues Found:
1. ❌ **Missing RLS WITH CHECK clause** on plays INSERT policy (blocks all play creation)
2. ⚠️ **Duplicate RLS policies** on playbooks table (redundant SELECT policies)
3. ⚠️ **No error boundaries** around critical components (PlayGrid, modals)
4. ⚠️ **Missing input validation** in service layer (SQL injection potential)
5. ⚠️ **Insufficient error context** for debugging RLS failures
6. ⚠️ **No rate limiting** on play creation/updates
7. ⚠️ **Missing telemetry** for security events

### Security Score: **6.5/10**
- Database Security: 7/10 (RLS enabled but policies need fixes)
- Input Validation: 6/10 (partial validation)
- Error Handling: 6/10 (basic try/catch, needs boundaries)
- Authentication: 8/10 (Supabase auth is solid)
- Authorization: 6/10 (RLS policies need audit)

---

## 🔍 Detailed Findings

### 1. Database Row-Level Security (RLS)

#### ✅ What's Working:
- All critical tables have RLS enabled
- Team-based access control in place
- Proper auth.uid() checks
- Active team membership verification

#### ❌ Critical Issues:

**A. Broken Plays INSERT Policy**
```sql
-- CURRENT (BROKEN):
CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL USING (
    EXISTS (SELECT 1 FROM team_members tm JOIN playbooks pb ...)
  );
-- ❌ Missing WITH CHECK clause - blocks ALL inserts!

-- FIX:
DROP POLICY "Team coaches can manage plays" ON plays;

CREATE POLICY "Coaches can insert plays" ON plays
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can update plays" ON plays
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can delete plays" ON plays
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );
```

**B. Duplicate Playbooks SELECT Policy**
```sql
-- Remove this duplicate:
DROP POLICY "Users can view playbooks for their teams" ON playbooks;
-- Keep: "Team members can view playbooks" (same logic, better name)
```

**C. Missing Policies on New Tables**
- `user_preferences` table (for favorites/recent plays) - needs RLS!
- Need to add policies for preferences CRUD

---

### 2. Input Validation & SQL Injection

#### Current State:
```typescript
// playsService.ts - INSUFFICIENT VALIDATION
static async createPlay(playData: Partial<Play>): Promise<Play> {
  const { data, error } = await supabase
    .from("plays")
    .insert(playData) // ❌ Raw data insertion, no sanitization!
    .select()
    .single();
}
```

#### Issues:
1. No schema validation before database insert
2. No length limits enforced
3. No XSS protection on text fields
4. No type coercion/sanitization

#### Fix Required:
```typescript
import { z } from 'zod';

// Add Zod schema for play validation
const PlaySchema = z.object({
  play_name: z.string()
    .min(1, "Play name required")
    .max(100, "Play name too long")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Invalid characters in play name"),
  
  formation: z.string()
    .min(1)
    .max(50),
  
  p_type: z.enum(['run', 'pass', 'rpo', 'play-action', 'screen']),
  
  notes: z.string()
    .max(5000, "Notes too long")
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),
  
  playbook_id: z.string().uuid("Invalid playbook ID"),
  
  // ... other fields
});

static async createPlay(playData: Partial<Play>): Promise<Play> {
  // Validate input
  const validated = PlaySchema.parse(playData);
  
  // Additional business logic checks
  if (!validated.playbook_id) {
    throw new Error("Playbook ID required");
  }
  
  const { data, error } = await supabase
    .from("plays")
    .insert(validated)
    .select()
    .single();
    
  if (error) throw this.handleDatabaseError(error);
  return data;
}
```

---

### 3. Error Boundaries & Resilience

#### Missing Error Boundaries:

**PlaybookPage.tsx:**
```tsx
// CURRENT (NO BOUNDARIES):
return (
  <PageLayout>
    <PlayGrid plays={plays} /> {/* If crashes, whole page dies */}
    {showAddNewPlayModal && <AddNewPlayModal />}
  </PageLayout>
);

// FIX:
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

return (
  <PageLayout>
    <ErrorBoundary 
      fallback={<PlayGridErrorState />}
      onError={logError}
    >
      <PlayGrid plays={plays} />
    </ErrorBoundary>
    
    {showAddNewPlayModal && (
      <ErrorBoundary 
        fallback={<ModalErrorFallback />}
        onError={logError}
      >
        <AddNewPlayModal />
      </ErrorBoundary>
    )}
  </PageLayout>
);
```

**Required Boundaries:**
1. ✅ PlayGrid (exists)
2. ❌ AddNewPlayModal
3. ❌ PlaybookSettingsModal
4. ❌ DiagramEditor
5. ❌ PracticeScriptBuilder
6. ❌ RecentPlays component
7. ❌ CommandPalette

---

### 4. Authentication & Authorization Checks

#### Current Implementation:
```typescript
// PlaybookPage.tsx line 211-219
useEffect(() => {
  const loadActivities = async () => {
    try {
      // ✅ GOOD: Auth check before data load
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        debug("Skipping activities load - user not authenticated yet");
        return;
      }
      // ... load activities
    } catch (err) {
      logError("Failed to load recent activities:", err);
    }
  };
  void loadActivities();
}, [activeTeamId]);
```

#### Issues:
1. ⚠️ Auth check is good, but no redirect on failure
2. ⚠️ activeTeamId dependency might be null (needs guard)
3. ⚠️ No session expiry handling
4. ⚠️ No permission checks for specific actions

#### Improved Pattern:
```typescript
// Add auth wrapper hook
const useRequireAuth = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to access playbook");
        navigate('/login');
      }
    };
    void checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate, toast]);
};

// Use in PlaybookPage
useRequireAuth();
```

---

### 5. Rate Limiting & Abuse Prevention

#### Current State:
❌ **NO RATE LIMITING** - Users can spam:
- Play creation
- Play updates
- Search queries
- Filter changes

#### Required Implementation:
```typescript
// Add rate limiting service
class RateLimiter {
  private limits = new Map<string, { count: number; resetAt: number }>();
  
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);
    
    if (!limit || now > limit.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    
    if (limit.count >= maxRequests) {
      return false;
    }
    
    limit.count++;
    return true;
  }
}

// Usage in playsService
static async createPlay(playData: Partial<Play>): Promise<Play> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!rateLimiter.check(`play-create-${userId}`, 10, 60000)) {
    throw new Error("Rate limit exceeded. Please wait before creating more plays.");
  }
  
  // ... rest of create logic
}
```

---

### 6. Telemetry & Security Monitoring

#### Missing Security Events:
1. Failed authentication attempts
2. RLS policy violations
3. Invalid input attempts
4. Rate limit hits
5. Suspicious query patterns

#### Required Tracking:
```typescript
// Add to telemetry service
export const trackSecurityEvent = (event: {
  type: 'auth_failure' | 'rls_violation' | 'invalid_input' | 'rate_limit';
  severity: 'low' | 'medium' | 'high';
  details: Record<string, any>;
}) => {
  // Log to monitoring service
  console.warn('[SECURITY]', event);
  
  // Track in analytics
  telemetry.track('security_event', {
    ...event,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    teamId: getActiveTeamId(),
  });
};
```

---

### 7. Data Validation & Type Safety

#### Current Gaps:
1. No runtime validation of Play schema
2. Partial<Play> allows any subset (dangerous)
3. No validation of JSONB fields (diagram_data)
4. No file size limits on diagram uploads

#### Fix:
```typescript
// Add comprehensive validation
const DiagramDataSchema = z.object({
  version: z.number(),
  players: z.array(z.object({
    id: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    label: z.string().max(10),
  })).max(22, "Max 22 players"),
  routes: z.array(z.any()).max(100, "Max 100 routes"),
});

const PlayCreateSchema = PlaySchema.extend({
  diagram_data: DiagramDataSchema.optional(),
});

// Validate before insert
static async createPlay(playData: unknown): Promise<Play> {
  const validated = PlayCreateSchema.parse(playData);
  // ... rest of logic
}
```

---

## 🎯 Immediate Action Items

### Priority 1 (Critical - Do Now):
1. **Fix RLS Policies** (5 min)
   - Split "manage plays" ALL policy into INSERT/UPDATE/DELETE
   - Remove duplicate playbooks SELECT policy
   - Test play creation

2. **Add Error Boundaries** (30 min)
   - Wrap PlayGrid
   - Wrap all modals
   - Add fallback UI components

3. **Add Input Validation** (1 hour)
   - Install Zod: `npm install zod`
   - Create validation schemas
   - Add to playsService

### Priority 2 (High - Today):
4. **Add Rate Limiting** (1 hour)
   - Implement RateLimiter class
   - Add to all mutation methods
   - Show user-friendly error messages

5. **Add Security Telemetry** (30 min)
   - Track RLS violations
   - Track invalid inputs
   - Set up monitoring alerts

### Priority 3 (Medium - This Week):
6. **Add Auth Wrapper Hook** (30 min)
   - Handle session expiry
   - Auto-redirect on logout
   - Show auth state to user

7. **Audit All Database Queries** (2 hours)
   - Review all Supabase queries
   - Add proper error handling
   - Add query timeouts

8. **Add RLS Policies for Preferences** (30 min)
   - Create policies for user_preferences
   - Test favorites/recent plays

---

## 📋 Security Checklist

### Database Security:
- [x] RLS enabled on all tables
- [ ] All policies tested and working
- [ ] No broken INSERT policies
- [ ] No duplicate policies
- [ ] Preferences table has RLS
- [ ] Query timeouts configured

### Input Validation:
- [ ] Zod schemas for all inputs
- [ ] XSS protection on text fields
- [ ] File upload size limits
- [ ] JSON schema validation
- [ ] Length limits enforced

### Error Handling:
- [ ] Error boundaries on all major components
- [ ] Graceful degradation
- [ ] User-friendly error messages
- [ ] Proper error logging
- [ ] No sensitive data in error messages

### Authentication:
- [x] Supabase auth integration
- [ ] Session expiry handling
- [ ] Auto-redirect on logout
- [ ] Multi-tab auth sync
- [ ] Permission checks before actions

### Monitoring:
- [ ] Security event tracking
- [ ] RLS violation alerts
- [ ] Failed auth logging
- [ ] Rate limit monitoring
- [ ] Database error dashboard

---

## 🚀 Future Enhancements

1. **Advanced RLS Testing:**
   - Automated RLS policy test suite
   - Verify policies across all user roles
   - Test team isolation guarantees

2. **Content Security Policy:**
   - Add CSP headers
   - Restrict inline scripts
   - Whitelist trusted domains

3. **Audit Logging:**
   - Log all play modifications
   - Track who changed what/when
   - Implement change history

4. **Backup & Recovery:**
   - Automated database backups
   - Point-in-time recovery
   - Disaster recovery plan

---

## 📊 Metrics to Track

1. **Security Events/Week:**
   - RLS violations
   - Invalid input attempts
   - Rate limit hits

2. **Error Rates:**
   - Database errors
   - Authentication failures
   - Component crashes

3. **Performance:**
   - Average query time
   - Error recovery time
   - User-perceived latency

---

## ✅ Success Criteria

- [ ] All plays CRUD operations work without errors
- [ ] RLS policies tested for all roles
- [ ] Zero SQL injection vulnerabilities
- [ ] Error boundaries prevent full page crashes
- [ ] Rate limiting prevents abuse
- [ ] Security events tracked and alerted
- [ ] Input validation prevents bad data
- [ ] Type safety enforced throughout

**Target Completion:** End of day October 11, 2025
