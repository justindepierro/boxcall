# BoxCall Production Roadmap 🏈

**Generated:** December 9, 2025  
**Last Updated:** December 9, 2025  
**Goal:** Industry-leading, mobile-first football coaching platform

---

## Executive Summary

| Metric                     | Current  | Target | Priority    | Status |
| -------------------------- | -------- | ------ | ----------- | ------ |
| Bundle Size                | 6.1MB    | <3MB   | 🔴 Critical | ⏳     |
| Lint Warnings              | 0        | 0      | ✅ Done     | ✅     |
| @ts-nocheck Files          | 11       | 0      | 🟡 High     | ⏳     |
| Large Files (>500 LOC)     | 20+      | 0      | 🟡 High     | ⏳     |
| TODO/FIXME                 | ~100     | 0      | 🟡 High     | ⏳     |
| Test Coverage              | 48 files | 200+   | 🟠 Medium   | ⏳     |
| Auth Patterns (getSession) | 7        | 7      | ✅ Valid    | ✅     |
| Archive Folders            | 4        | 0      | ✅ Done     | ✅     |

---

## 🔴 PHASE 1: Security & Auth Hardening (Week 1)

### 1.1 Auth Pattern Review ✅ COMPLETE

**Reviewed 7 `getSession()` calls - ALL ARE VALID USE CASES:**

The getSession() calls are for legitimate session management:

- `auth-store.ts:901` - Session refresh (needs `expires_at`)
- `auth-store.ts:1011` - Background verification
- `auth-store.ts:1145` - Initial bootstrap
- `api/health.ts:133` - Health check
- `sessionRefresh.ts:47` - Token refresh
- `authDebug.ts:53` - Debug utility
- `AuthDebugPanel.tsx:27` - Debug component

**Auth is secure!** Using `getCurrentUserId()` from auth-helpers.ts for all API calls.

### 1.2 RLS Policy Audit

- [ ] Verify all 24 tables have proper RLS policies
- [ ] Test team isolation (user can't access other teams' data)
- [ ] Add audit logging for sensitive operations
- [ ] Implement row-level encryption for PII

### 1.3 Remove Archived/Backup Files ✅ COMPLETE

**Deleted:**

- ✅ `.cleanup-backup/`
- ✅ `docs/archive/`
- ✅ `scripts/archive/`
- ✅ `scripts/backup/`
- ✅ All `*.backup` and `*.bak` files

---

## 🟡 PHASE 2: TypeScript & Code Quality (Week 2)

### 2.1 Fix @ts-nocheck Files

**11 files with disabled type checking:**

| File                          | Issue                    | Solution                 |
| ----------------------------- | ------------------------ | ------------------------ |
| `practiceService.ts`          | Supabase types           | Fix with proper generics |
| `useSession.ts`               | Session types incomplete | Create session.types.ts  |
| `usePracticeSession.ts`       | Depends on useSession    | Fix after useSession     |
| `useGameSession.ts`           | Depends on useSession    | Fix after useSession     |
| `executionTrackingService.ts` | Missing session tables   | Stage 3 feature          |
| `playConfidenceService.ts`    | Missing session tables   | Stage 3 feature          |
| `situationalRecommender.ts`   | Missing session tables   | Stage 3 feature          |
| `PracticeSession.tsx`         | Missing session tables   | Stage 3 feature          |
| `offlineExecutionQueue.ts`    | Session types            | Fix with useSession      |
| `playbookHealthScore.ts`      | Complex play types       | Simplify logic           |

### 2.2 Split Large Files

**Files exceeding 500 lines:**

| File                 | Lines | Action                                                    |
| -------------------- | ----- | --------------------------------------------------------- |
| `RosterPage.tsx`     | 1845  | Split into RosterList, RosterFilters, RosterActions       |
| `practiceService.ts` | 1640  | Split into PracticeScriptService, PracticeScheduleService |
| `ProfilePage.tsx`    | 1577  | Split into ProfileHeader, ProfileStats, ProfileSettings   |
| `auth-store.ts`      | 1429  | Split into auth-actions.ts, auth-selectors.ts             |
| `playsService.ts`    | 1330  | Split into PlayCRUD, PlaySearch, PlayValidation           |
| `PlaybookPage.tsx`   | 1256  | Already has page/ subfolder - move more logic out         |
| `PlayGrid.tsx`       | 1097  | Split handlers into separate files                        |

### 2.3 Resolve TODO/FIXME Comments

**~100 remaining - categorized:**

- **Auth-related (6):** dashboardStore.ts - get userId/role from auth
- **API integration (8):** errorHandler, exportUtils, devLogger
- **Type definitions (12):** DesktopPlaybookView, PlaybookModals, etc.
- **Feature stubs (20+):** collaboration, ML recommendations
- **Low priority (50+):** Minor improvements, future features

---

## 🟠 PHASE 3: Performance Optimization (Week 3)

### 3.1 Bundle Size Reduction (6.1MB → <3MB)

**Quick Wins:**

```bash
# Current chunk analysis needed
npm run analyze
```

**Actions:**

- [ ] Enable tree-shaking for lodash (lodash-es)
- [ ] Lazy load heavy components (PDF, Charts, Canvas)
- [ ] Remove unused dependencies
- [ ] Implement route-based code splitting
- [ ] Compress images to WebP

### 3.2 React Performance

**Issues Found:**

- 193 inline style objects (cause re-renders)
- 686 anonymous onClick handlers
- 828 components without React.memo

**Actions:**

- [ ] Add React.memo to pure presentational components
- [ ] Extract inline styles to CSS/Tailwind classes
- [ ] Use useCallback for event handlers passed as props
- [ ] Implement virtualization for long lists (react-window)

### 3.3 Database Query Optimization

**Issues:**

- 71 queries missing error handling
- 30 N+1 query patterns

**Actions:**

- [ ] Add try/catch to all supabase queries
- [ ] Batch queries using .in() instead of loops
- [ ] Implement query result caching with React Query
- [ ] Add database indexes for common queries

---

## 🟢 PHASE 4: Mobile Excellence (Week 4)

### 4.1 Touch Target Compliance

**2012 potential touch target issues**

- [ ] Audit all interactive elements for 44px minimum
- [ ] Add haptic feedback to all buttons
- [ ] Implement swipe gestures for common actions
- [ ] Test on actual devices (iOS/Android)

### 4.2 PWA Enhancement

**Current: Basic PWA**

**Target:**

- [ ] Offline-first data access
- [ ] Background sync for queued saves
- [ ] Push notifications for team updates
- [ ] App shortcuts for quick actions
- [ ] Share target for receiving plays

### 4.3 Loading States

**112 loading state usages found**

- [ ] Standardize skeleton screens across all pages
- [ ] Add optimistic updates for all mutations
- [ ] Implement stale-while-revalidate pattern
- [ ] Add progress indicators for file uploads

---

## 🔵 PHASE 5: Testing & Documentation (Week 5)

### 5.1 Test Coverage Expansion

**Current: 48 test files**

**Targets:**

- [ ] 80% coverage for services
- [ ] 60% coverage for hooks
- [ ] 40% coverage for components
- [ ] E2E tests for critical flows (auth, playbook, game plans)

### 5.2 Documentation Cleanup

- [ ] Remove archived docs
- [ ] Update API documentation
- [ ] Create component storybook
- [ ] Add inline code comments for complex logic

---

## 🚀 PHASE 6: Industry-Leading Features (Ongoing)

### 6.1 Competitive Advantages

| Feature                 | Status     | Impact |
| ----------------------- | ---------- | ------ |
| Billick Game Planning   | ✅ Done    | High   |
| Canvas Play Diagrams    | ✅ Done    | High   |
| Practice Scripts        | ✅ Done    | High   |
| Coach Cards PDF         | ✅ Done    | Medium |
| Real-time Collaboration | ❌ Stub    | High   |
| AI Play Recommendations | ❌ TODO    | High   |
| Video Integration       | ❌ TODO    | Medium |
| Opponent Scouting       | ❌ TODO    | High   |
| Live Game Tracking      | 🟡 Stage 3 | High   |

### 6.2 Mobile-First Innovations

- [ ] Sideline quick-access mode (large buttons, voice control)
- [ ] Offline playbook with sync
- [ ] QR code play sharing
- [ ] Apple Watch companion app
- [ ] AR formation visualization (future)

---

## 📋 Immediate Action Items (This Week)

### Day 1-2: Security

```bash
# Find and fix all getSession calls
grep -rn "getSession()" src --include="*.ts" --include="*.tsx"

# Audit auth patterns
grep -rn "session.user" src --include="*.ts" --include="*.tsx"
```

### Day 3-4: Code Quality

```bash
# Remove archived folders
rm -rf .cleanup-backup docs/archive scripts/archive scripts/backup

# Remove backup files
find . -name "*.backup" -delete
find . -name "*.bak" -delete
```

### Day 5: Performance Baseline

```bash
# Generate bundle analysis
npm run build
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:5173 --output html
```

---

## Success Metrics

| Metric                   | Current | 30-Day Goal | 90-Day Goal |
| ------------------------ | ------- | ----------- | ----------- |
| Lighthouse Performance   | ~70     | 85+         | 95+         |
| Lighthouse Accessibility | ~80     | 95+         | 100         |
| First Contentful Paint   | ~2s     | <1s         | <0.5s       |
| Time to Interactive      | ~4s     | <2s         | <1s         |
| Bundle Size              | 6.1MB   | 4MB         | <3MB        |
| Type Coverage            | 89%     | 95%         | 100%        |
| Test Coverage            | ~20%    | 50%         | 80%         |

---

## Team Checklist Before Production

- [ ] All getSession() → getUser() migrations complete
- [ ] All @ts-nocheck files resolved or documented
- [ ] No TODO/FIXME in critical paths
- [ ] All console.log statements removed from production
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) configured
- [ ] Rate limiting on all API endpoints
- [ ] CORS properly configured
- [ ] CSP headers in place
- [ ] All environment variables documented
- [ ] Database backup strategy in place
- [ ] Monitoring dashboards created
- [ ] On-call rotation established

---

_This roadmap is a living document. Update as items are completed._
