# Fast Track to 10/10 - Action Plan

**Goal:** 8.4 → 10/10 in minimum time  
**Strategy:** Focus on high-impact, low-effort tasks first

---

## 🚀 Speed Run (6 hours to 9.5/10)

### Hour 1-2: Quick Wins (+0.6 points → 9.0/10)

#### 1. Add CSP Headers (15 min) +0.1

```bash
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

#### 2. Add Rate Limit UI Feedback (30 min) +0.2

```typescript
// In AddNewPlayModal.tsx, add at top:
const { remaining } = useRateLimitFeedback('play-create');

// Show badge:
{remaining <= 3 && (
  <Badge variant="warning" className="mb-2">
    <Icon name="clock" className="h-3 w-3" />
    {remaining} creates remaining this minute
  </Badge>
)}
```

#### 3. Improve Rate Limit Error Messages (15 min) +0.1

```typescript
// In SecurePlaysService.ts
catch (error) {
  if (isRateLimitError(error)) {
    const seconds = Math.ceil(error.retryAfterMs / 1000);
    throw new Error(
      `You're creating plays too quickly. Please wait ${seconds} seconds before trying again.`
    );
  }
}
```

#### 4. Add Session Expiry Check (30 min) +0.1

```typescript
// src/hooks/useSessionMonitor.ts
export function useSessionMonitor() {
  useEffect(() => {
    const check = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login?reason=expired";
      }
    }, 60000); // Check every minute

    return () => clearInterval(check);
  }, []);
}

// In App.tsx:
useSessionMonitor();
```

#### 5. Add Security Event Toast (15 min) +0.1

```typescript
// In PlaybookPage.tsx, after SecurePlaysService calls:
try {
  await SecurePlaysService.createPlay(data);
} catch (error) {
  if (error.message.includes("Rate limit")) {
    toast.error(error.message, {
      duration: 5000,
      icon: "⏱️",
    });
  } else if (error.message.includes("validation")) {
    toast.error("Invalid play data", error.message);
  }
}
```

**Total: 1.75 hours → 9.0/10** ✅

---

### Hour 3-4: Persistent Logging (+0.3 points → 9.3/10)

#### 6. Create Security Events Table (30 min)

```sql
-- database/migrations/add_security_events.sql
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'validation_error',
    'rate_limit',
    'auth_failure',
    'rls_violation',
    'suspicious_activity'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast queries
  INDEX idx_security_events_user_id ON security_events(user_id),
  INDEX idx_security_events_type ON security_events(event_type),
  INDEX idx_security_events_severity ON security_events(severity),
  INDEX idx_security_events_created_at ON security_events(created_at DESC)
);

-- RLS: Only coaches can view
CREATE POLICY "Coaches can view security events" ON security_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND status = 'active'
    )
  );

-- Auto-cleanup old events (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  DELETE FROM security_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

#### 7. Update SecurePlaysService to Persist Events (1 hour)

```typescript
// src/services/securePlaysService.ts
private static async logSecurityEvent(event: SecurityEvent) {
  // Log to console (keep for debugging)
  this.securityEvents.push(event);

  // Persist to database
  try {
    await supabase.from('security_events').insert({
      event_type: event.type,
      severity: event.severity,
      user_id: event.userId,
      action: event.action,
      details: event.details,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failure shouldn't break app
  }
}

private static async getClientIP(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}
```

**Total: 1.5 hours → 9.3/10** ✅

---

### Hour 5-6: Security Dashboard (+0.2 points → 9.5/10)

#### 8. Create Basic Security Dashboard (2 hours)

```typescript
// src/pages/SecurityDashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Typography } from '../components/design-system/Typography';
import { Badge } from '../components/ui/Badge';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export const SecurityDashboard = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    let query = supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('severity', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvents(data);
    }
  };

  const stats = {
    total: events.length,
    high: events.filter(e => e.severity === 'high').length,
    medium: events.filter(e => e.severity === 'medium').length,
    low: events.filter(e => e.severity === 'low').length,
  };

  return (
    <PageLayout variant="dashboard">
      <div className="space-y-6">
        <Typography variant="display-sm">Security Dashboard</Typography>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <Typography variant="body-sm" className="text-text-secondary">Total Events</Typography>
            <Typography variant="display-xs">{stats.total}</Typography>
          </Card>
          <Card>
            <Typography variant="body-sm" className="text-text-secondary">High Severity</Typography>
            <Typography variant="display-xs" className="text-danger-default">{stats.high}</Typography>
          </Card>
          <Card>
            <Typography variant="body-sm" className="text-text-secondary">Medium Severity</Typography>
            <Typography variant="display-xs" className="text-warning-default">{stats.medium}</Typography>
          </Card>
          <Card>
            <Typography variant="body-sm" className="text-text-secondary">Low Severity</Typography>
            <Typography variant="display-xs" className="text-success-default">{stats.low}</Typography>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg ${
                filter === f
                  ? 'bg-primary-default text-white'
                  : 'bg-surface-secondary'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Events Table */}
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Severity</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-b border-border-subtle hover:bg-surface-secondary">
                  <td className="p-3">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Badge>{event.event_type}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      event.severity === 'high' ? 'danger' :
                      event.severity === 'medium' ? 'warning' : 'default'
                    }>
                      {event.severity}
                    </Badge>
                  </td>
                  <td className="p-3">{event.action}</td>
                  <td className="p-3 text-sm text-text-secondary">
                    {JSON.stringify(event.details).substring(0, 50)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </PageLayout>
  );
};

// Add route in App.tsx:
<Route path="/security" element={<SecurityDashboard />} />
```

**Total: 2 hours → 9.5/10** ✅

---

## 🎯 Final Push to 10/10 (Additional 4-6 hours)

### Priority Tasks (Choose 3-4)

#### A. Audit Logging (2 hours) +0.2

- Database triggers for all mutations
- Before/after values stored
- Queryable audit trail

#### B. Automated Security Tests (2 hours) +0.2

- 20+ validation tests
- 10+ rate limit tests
- 10+ RLS tests
- Run in CI/CD

#### C. Advanced Session Management (1 hour) +0.1

- Auto-refresh before expiry
- Warn user at 5 min
- Graceful logout

#### D. Security Hardening Checklist (2 hours) +0.15

- Review all headers
- Check all endpoints
- Verify all inputs
- Document security policies

#### E. Manual Penetration Testing (2 hours) +0.15

- SQL injection attempts
- XSS attempts
- Rate limit bypass attempts
- Document findings

---

## 📊 Score Progression

```
Start:        8.4/10 ✅ [Current]
              ↓
Hour 2:       9.0/10 ⚡ [Quick wins]
              ↓
Hour 4:       9.3/10 📝 [Persistent logging]
              ↓
Hour 6:       9.5/10 📊 [Dashboard]
              ↓
Hour 8-10:    9.7/10 🔐 [Audit + Tests]
              ↓
Hour 10-12:   10/10 🎯 [Hardening + Pen test]
```

---

## 🎮 Choose Your Path

### Path A: Speed Run (6 hours → 9.5/10)

**Best for:** Quick wins, immediate improvement  
**Tasks:** 1-8 from above  
**Result:** Solid security, great UX

### Path B: Thorough (12 hours → 10/10)

**Best for:** Complete security, production-ready  
**Tasks:** All tasks (1-8 + A-E)  
**Result:** Perfect score, bulletproof app

### Path C: Incremental (1 task/day → 10/10 in 2 weeks)

**Best for:** Learning, understanding each piece  
**Tasks:** One task per day with deep dive  
**Result:** Deep security knowledge + perfect score

---

## 🚀 Recommended: Start with Hour 1-2 (Quick Wins)

**Why?**

- Fastest ROI (0.6 points in < 2 hours)
- Low risk, high impact
- Immediate user experience improvements
- Build momentum

**Next Steps:**

1. Add CSP headers → 15 min
2. Add rate limit UI → 30 min
3. Improve error messages → 15 min
4. Add session check → 30 min
5. Add toast notifications → 15 min

**Total: 1.75 hours → 9.0/10** 🎉

**Then decide:** Continue to 10/10 or test at 9.0?

---

Want me to start implementing the quick wins? I can have you at 9.0/10 in the next hour! 🚀
