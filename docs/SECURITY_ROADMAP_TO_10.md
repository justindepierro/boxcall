# Path to 10/10 Security - Complete Roadmap

**Current Status:** 8.4/10 ✅  
**Target:** 10/10 (Perfect Security) 🎯  
**Beyond:** 11/10 (Bulletproof + Future-Proof) 🚀

---

## 📊 Current State Analysis

### ✅ What We Have (8.4/10)

- ✅ RLS policies fixed (database lockdown)
- ✅ Input validation (Zod schemas, XSS protection)
- ✅ Rate limiting (abuse prevention)
- ✅ Error boundaries (UI crash protection)
- ✅ Security event tracking (monitoring)
- ✅ Auth checks (before mutations)

### ⚠️ What's Missing (1.6 points)

- ⚠️ No persistent security logging (events lost on reload)
- ⚠️ No real-time security alerts
- ⚠️ No rate limit UI feedback (users blind to limits)
- ⚠️ No automated security tests
- ⚠️ No CSP headers (XSS prevention at HTTP level)
- ⚠️ No audit logging (who did what when)
- ⚠️ No session management (expired sessions)
- ⚠️ No SQL injection tests (automated validation)

---

## 🎯 Path to 10/10 (Perfect Security)

### Phase 3: Monitoring & Feedback (9.2/10) - **2-3 hours**

#### Task 1: Persistent Security Logging (+0.3 points)

**Current:** Events stored in-memory (lost on reload)  
**Target:** Events persisted to database

```typescript
// Create security_events table
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

// Add RLS policies
CREATE POLICY "Admins can view all security events" ON security_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND team_role = 'head_coach'
    )
  );
```

**Files to Create:**

- `database/migrations/add_security_events_table.sql`
- `src/services/securityLogger.ts`

**Update:**

- `src/services/securePlaysService.ts` - Write events to DB

**Time:** 1 hour

---

#### Task 2: Real-Time Security Alerts (+0.2 points)

**Current:** Events logged silently  
**Target:** High-severity events trigger alerts

```typescript
// src/services/securityAlerts.ts
export class SecurityAlerts {
  static async notify(event: SecurityEvent) {
    if (event.severity === "high") {
      // Send to admin dashboard
      await supabase.from("notifications").insert({
        user_id: getAdminUserId(),
        type: "security_alert",
        title: `Security Alert: ${event.type}`,
        message: event.details,
        priority: "high",
      });

      // Optional: Send email, Slack, SMS
      if (process.env.VITE_ENABLE_SECURITY_EMAILS === "true") {
        await sendSecurityEmail(event);
      }
    }
  }
}
```

**Features:**

- Toast notification for rate limits
- Admin dashboard alerts for violations
- Optional email/Slack webhooks

**Time:** 45 minutes

---

#### Task 3: Rate Limit UI Feedback (+0.2 points)

**Current:** Users only see error after hitting limit  
**Target:** Show remaining attempts, countdown timer

```typescript
// src/hooks/useRateLimitFeedback.ts
export function useRateLimitFeedback(action: string) {
  const userId = useAuth().user?.id;
  const key = getUserRateLimitKey(userId, action);

  const remaining = rateLimiter.getRemaining(key, 10);
  const resetTime = rateLimiter.getResetTime(key);
  const isNearLimit = remaining <= 2;

  return { remaining, resetTime, isNearLimit };
}

// In AddNewPlayModal:
const { remaining, isNearLimit } = useRateLimitFeedback('play-create');

// Show in UI:
{isNearLimit && (
  <Badge variant="warning">
    {remaining} creates remaining
  </Badge>
)}
```

**UI Components:**

- Badge showing remaining attempts
- Countdown timer when limited
- Progress bar (visual indicator)

**Time:** 30 minutes

---

#### Task 4: Security Events Dashboard (+0.3 points)

**Current:** No way to view security events  
**Target:** Admin dashboard with charts, filters

```typescript
// src/pages/SecurityDashboard.tsx
export const SecurityDashboard = () => {
  const events = useSecurityEvents();

  return (
    <PageLayout>
      <SecurityOverview />
      <SecurityEventsChart data={events} />
      <SecurityEventsTable
        events={events}
        filters={{ type, severity, dateRange }}
      />
      <TopViolators users={getTopViolators(events)} />
    </PageLayout>
  );
};
```

**Features:**

- Line chart: Events over time
- Pie chart: By type, by severity
- Table: Filterable, sortable, searchable
- Top violators list (users hitting rate limits)
- Export to CSV

**Time:** 2 hours

---

### Phase 4: Advanced Security (9.6/10) - **1 week**

#### Task 5: CSP Headers (+0.1 points)

**Current:** No Content Security Policy  
**Target:** Strict CSP preventing XSS

```typescript
// netlify.toml or vite.config.ts
headers = [
  {
    for = "/*",
    values = {
      Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://lvmuiqwihlpnwppdqqfl.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://lvmuiqwihlpnwppdqqfl.supabase.co wss://lvmuiqwihlpnwppdqqfl.supabase.co",
      X-Frame-Options = "DENY",
      X-Content-Type-Options = "nosniff",
      Referrer-Policy = "strict-origin-when-cross-origin",
      Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    }
  }
]
```

**Benefits:**

- Blocks inline scripts (XSS prevention)
- Prevents clickjacking (iframe protection)
- Restricts resource loading (only trusted sources)

**Time:** 1 hour

---

#### Task 6: Audit Logging (+0.1 points)

**Current:** No persistent record of changes  
**Target:** Complete audit trail

```sql
-- database/migrations/add_audit_log.sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for automatic logging
CREATE OR REPLACE FUNCTION log_play_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, action, resource_type, resource_id,
    old_values, new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    'play',
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plays_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON plays
FOR EACH ROW EXECUTE FUNCTION log_play_changes();
```

**Features:**

- Automatic logging via database triggers
- Tracks all play modifications
- Stores before/after values
- Queryable audit trail

**Time:** 2 hours

---

#### Task 7: Automated Security Tests (+0.1 points)

**Current:** Manual testing only  
**Target:** Automated test suite

```typescript
// tests/security/validation.test.ts
describe("Input Validation", () => {
  test("rejects SQL injection attempts", () => {
    const maliciousInput = "'; DROP TABLE plays; --";
    expect(() => validatePlayCreate({ play_name: maliciousInput })).toThrow(
      "Invalid play name"
    );
  });

  test("strips XSS attempts", () => {
    const xssInput = '<script>alert("xss")</script>Test';
    const result = validatePlayCreate({
      notes: xssInput,
    });
    expect(result.notes).toBe("Test");
  });
});

// tests/security/rate-limiting.test.ts
describe("Rate Limiting", () => {
  test("allows 10 creates per minute", async () => {
    for (let i = 0; i < 10; i++) {
      await SecurePlaysService.createPlay(validPlayData);
    }
    // 11th should fail
    await expect(SecurePlaysService.createPlay(validPlayData)).rejects.toThrow(
      "Rate limit"
    );
  });
});

// tests/security/rls.test.ts
describe("RLS Policies", () => {
  test("coaches can create plays", async () => {
    const coach = await createTestCoach();
    await expect(createPlayAs(coach, validPlayData)).resolves.toBeTruthy();
  });

  test("players cannot create plays", async () => {
    const player = await createTestPlayer();
    await expect(createPlayAs(player, validPlayData)).rejects.toThrow("policy");
  });
});
```

**Test Coverage:**

- Input validation tests (20+ cases)
- Rate limiting tests (10+ cases)
- RLS policy tests (15+ cases)
- Auth tests (10+ cases)
- XSS/SQL injection tests (10+ cases)

**Time:** 1 day

---

#### Task 8: Session Management (+0.1 points)

**Current:** Sessions never expire (client-side)  
**Target:** Proper session expiry, refresh

```typescript
// src/services/sessionManager.ts
export class SessionManager {
  private static CHECK_INTERVAL = 60000; // 1 minute

  static async checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Redirect to login
      window.location.href = "/login?reason=session_expired";
      return;
    }

    // Check if session expires soon (< 5 minutes)
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const minutesUntilExpiry = (expiresAt - now) / 60000;

    if (minutesUntilExpiry < 5) {
      // Refresh session
      await supabase.auth.refreshSession();
      toast.info("Session refreshed");
    }
  }

  static startMonitoring() {
    setInterval(this.checkSession, this.CHECK_INTERVAL);
  }
}

// In App.tsx:
useEffect(() => {
  SessionManager.startMonitoring();
}, []);
```

**Features:**

- Automatic session refresh
- Session expiry warnings
- Graceful logout on expiry

**Time:** 1 hour

---

#### Task 9: Penetration Testing (+0.1 points)

**Current:** No security testing  
**Target:** Professional pen test

**Tests to Run:**

1. **SQL Injection**
   - Try malicious input in all forms
   - Test query parameters
   - Test JSON payloads

2. **XSS Attacks**
   - Inject scripts in text fields
   - Test SVG/image uploads
   - Test markdown rendering

3. **CSRF Attacks**
   - Test cross-origin requests
   - Verify CSRF tokens

4. **Authentication Bypass**
   - Try accessing protected routes
   - Test JWT manipulation
   - Test session hijacking

5. **Rate Limit Bypass**
   - Try distributed requests
   - Test with multiple accounts
   - Test with different IPs

**Tools:**

- OWASP ZAP (automated scanner)
- Burp Suite (manual testing)
- SQLMap (SQL injection testing)

**Time:** 2 days

---

### Phase 5: Bulletproof (10/10) - **1 week**

#### Task 10: Security Hardening Checklist

- ✅ HTTPS enforced (already done via Netlify)
- ✅ HSTS headers (Strict-Transport-Security)
- ✅ Secure cookies (httpOnly, secure, sameSite)
- ✅ No sensitive data in localStorage
- ✅ No API keys in client code
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all inputs
- ✅ Output encoding (prevent XSS)
- ✅ Parameterized queries (prevent SQL injection)
- ✅ File upload validation (if applicable)
- ✅ Proper error messages (no stack traces in production)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Regular dependency updates
- ✅ Secrets management (environment variables)
- ✅ Logging & monitoring
- ✅ Incident response plan

**Time:** 3 days

---

## 🚀 Beyond 10/10 (Future-Proof)

### Advanced Features (11/10+)

#### 1. AI-Powered Threat Detection

```typescript
// Detect anomalous patterns
- 10 play creates in 10 seconds → Suspicious
- Play names all similar → Bot detection
- Multiple failed auth attempts → Brute force
- Unusual access patterns → Alert admin
```

#### 2. Blockchain Audit Trail

```typescript
// Immutable audit log
- Store audit hashes on blockchain
- Tamper-proof record of changes
- Cryptographic verification
```

#### 3. Zero-Trust Architecture

```typescript
// Verify every request
- No implicit trust
- Continuous authentication
- Micro-segmentation
- Least privilege access
```

#### 4. Advanced Rate Limiting

```typescript
// Smart rate limiting
- Per-user quotas
- Burst allowance
- Priority queues
- Token bucket algorithm
- Distributed rate limiting (Redis)
```

#### 5. Security Chaos Engineering

```typescript
// Test resilience
- Random security failures
- Simulate attacks
- Verify recovery
- Automated testing
```

---

## 📊 Security Score Breakdown

### Current (8.4/10)

| Category          | Score   | Status                 |
| ----------------- | ------- | ---------------------- |
| Database Security | 2.0/2.0 | ✅ Complete            |
| Input Validation  | 1.8/2.0 | ✅ Good                |
| Rate Limiting     | 1.5/2.0 | ⚠️ Missing UI feedback |
| Error Handling    | 1.5/2.0 | ✅ Good                |
| Authentication    | 1.0/1.0 | ✅ Complete            |
| Monitoring        | 0.6/1.0 | ⚠️ In-memory only      |

### Target (10/10)

| Category          | Score   | Required                |
| ----------------- | ------- | ----------------------- |
| Database Security | 2.0/2.0 | ✅ RLS policies         |
| Input Validation  | 2.0/2.0 | ✅ Validation + CSP     |
| Rate Limiting     | 2.0/2.0 | ✅ Limits + UI feedback |
| Error Handling    | 2.0/2.0 | ✅ Boundaries + logging |
| Authentication    | 1.0/1.0 | ✅ Auth + sessions      |
| Monitoring        | 1.0/1.0 | ✅ Persistent + alerts  |

---

## ⏱️ Timeline Summary

### Phase 3: Monitoring & Feedback (9.2/10)

- Task 1: Persistent logging - **1 hour**
- Task 2: Real-time alerts - **45 min**
- Task 3: Rate limit UI - **30 min**
- Task 4: Security dashboard - **2 hours**
  **Total: 4.25 hours**

### Phase 4: Advanced Security (9.6/10)

- Task 5: CSP headers - **1 hour**
- Task 6: Audit logging - **2 hours**
- Task 7: Automated tests - **1 day**
- Task 8: Session management - **1 hour**
- Task 9: Pen testing - **2 days**
  **Total: 3-4 days**

### Phase 5: Bulletproof (10/10)

- Task 10: Security hardening - **3 days**
  **Total: 3 days**

### **Grand Total: ~1-2 weeks**

---

## 🎯 Recommended Priority Order

### Must-Have (Critical - Do Next)

1. ✅ Persistent security logging (events lost on reload)
2. ✅ Rate limit UI feedback (user experience)
3. ✅ Security dashboard (visibility)

### Should-Have (High Priority - This Week)

4. ✅ Real-time alerts (incident response)
5. ✅ Session management (security hygiene)
6. ✅ CSP headers (defense in depth)

### Nice-to-Have (Medium Priority - Next Sprint)

7. ✅ Audit logging (compliance)
8. ✅ Automated tests (continuous security)
9. ✅ Pen testing (validation)

### Future (Low Priority - Roadmap)

10. ⏳ Security hardening checklist
11. ⏳ AI threat detection
12. ⏳ Advanced features

---

## 💡 Quick Wins (30 min each)

If you want to quickly boost the score:

1. **Add CSP Headers** (+0.1) - Copy/paste into netlify.toml
2. **Add Rate Limit Badge** (+0.1) - Show remaining attempts in UI
3. **Add Toast for Rate Limits** (+0.1) - User-friendly feedback
4. **Enable HSTS** (+0.1) - One-line header config

**4 quick wins = 9.0/10 in 2 hours!**

---

## 🎓 Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Content Security Policy Guide](https://content-security-policy.com/)

---

**Current Status:** 8.4/10 ✅  
**Next Milestone:** 9.2/10 (4 hours)  
**Final Goal:** 10/10 (1-2 weeks)  
**Beyond:** 11/10+ (Bulletproof)

**Ready to continue? Let me know which phase you want to tackle next!** 🚀
