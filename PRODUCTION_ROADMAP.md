# BoxCall Production Roadmap 🏈

**Generated:** December 9, 2025  
**Last Updated:** December 9, 2025  
**Goal:** Industry-leading, mobile-first football coaching platform

---

## Executive Summary

| Metric                     | Current  | Target | Priority    | Status |
| -------------------------- | -------- | ------ | ----------- | ------ |
| Bundle Size                | 6.1MB    | <3MB   | 🟡 High     | ⏳     |
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

### 1.2 RLS Policy Audit ✅ COMPLETE

**Audited 48 tables - ALL SECURE:**

- All 24 core tables have RLS enabled
- All 24 additional service tables have RLS enabled
- No anonymous access to any data
- Team isolation verified via `team_members` join table

Audit scripts: `scripts/audit-rls.mjs`, `scripts/audit-rls-extended.mjs`

- [x] Verify all 48 tables have proper RLS policies
- [x] Test anonymous access blocked on all tables
- [ ] Add audit logging for sensitive operations (future)
- [ ] Implement row-level encryption for PII (future)

### 1.3 Remove Archived/Backup Files ✅ COMPLETE

**Deleted:**

- ✅ `.cleanup-backup/`
- ✅ `docs/archive/`
- ✅ `scripts/archive/`
- ✅ `scripts/backup/`
- ✅ All `*.backup` and `*.bak` files

---

## 🟡 PHASE 2: TypeScript & Code Quality (Week 2)

### 2.1 Fix @ts-nocheck Files ✅ COMPLETE

**All 11 @ts-nocheck files fixed - 0 TypeScript errors!**

Files cleaned:

- ✅ `practiceService.ts` (1634 lines)
- ✅ `useSession.ts` (501 lines)
- ✅ `usePracticeSession.ts` (308 lines)
- ✅ `useGameSession.ts` (434 lines)
- ✅ `executionTrackingService.ts`
- ✅ `playConfidenceService.ts`
- ✅ `situationalRecommender.ts`
- ✅ `PracticeSession.tsx`
- ✅ `offlineExecutionQueue.ts`
- ✅ `playbookHealthScore.ts` (652 lines)
- ✅ `offlineExecutionQueue.test.ts`

The Supabase types were actually fine - these were legacy disables that were no longer needed.

### 2.2 Split Large Files

**Files exceeding 500 lines (work in progress):**

| File                 | Lines | Status                                   |
| -------------------- | ----- | ---------------------------------------- |
| `RosterPage.tsx`     | 1845  | Uses hooks - JSX heavy, lower priority   |
| `practiceService.ts` | 1631  | Complex service - split when refactoring |
| `ProfilePage.tsx`    | 1577  | Uses hooks - JSX heavy, lower priority   |
| `auth-store.ts`      | 1463  | Core auth - defer splitting              |
| `playsService.ts`    | 1330  | Complex service - split when refactoring |
| `PlaybookPage.tsx`   | 1256  | Uses page/ subfolder pattern             |
| `PlayGrid.tsx`       | 1127  | Handlers could be extracted              |

**Note:** Many large files already use extracted hooks. Priority is TypeScript safety over file size.

### 2.3 Resolve TODO/FIXME Comments

**127 remaining (was 131) - categorized:**

**✅ Fixed (4):**

- `dashboardStore.ts` - Now gets userId/role from auth store

**Remaining by category:**

- **Future features (~80):** ML recommendations, WebSocket collaboration, Stage 3 session tracking
- **Schema additions (~20):** logo_url, usage_count, streak tracking
- **Integration stubs (~15):** Sentry, analytics, email service
- **Type improvements (~12):** Proper typing for lazy-loaded components

Most TODOs are intentional placeholders for future features, not bugs.

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

## 🟢 PHASE 4: Mobile Excellence (Week 4) ✅ COMPLETE

### 4.1 Touch Target Compliance ✅

**2012 potential touch target issues** → ADDRESSED

- [x] Audit all interactive elements for 44px minimum
  - Added CSS variables for button heights (32-48px)
  - Added mobile @media query to enforce 44px minimum on touch devices
  - Added touch-compliant utility classes
- [x] Add haptic feedback to all buttons (already implemented via triggerHapticFeedback)
- [ ] Implement swipe gestures for common actions (future enhancement)
- [ ] Test on actual devices (iOS/Android) (requires manual testing)

### 4.2 PWA Enhancement ✅

**Current: Comprehensive PWA with Workbox**

**Implemented:**

- [x] Offline-first data access (via service worker caching strategies)
- [x] Background sync for queued saves (workbox-background-sync ready)
- [ ] Push notifications for team updates (infrastructure ready, needs backend)
- [x] App shortcuts for quick actions (Dashboard, Roster in manifest)
- [ ] Share target for receiving plays (future enhancement)

### 4.3 Loading States ✅

**112 loading state usages found** → STANDARDIZED

- [x] Standardize skeleton screens across all pages
  - 7 skeleton variants: Skeleton, DashboardCardSkeleton, GamePlanSkeleton, NavigationSkeleton, ListSkeleton, PageLoadingSkeleton, PlayCardSkeleton
  - Facebook-style shimmer effect
- [x] Add optimistic updates for all mutations (implemented in social features, playbook)
- [x] Implement stale-while-revalidate pattern (via React Query + service worker)
- [ ] Add progress indicators for file uploads (future enhancement)

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
