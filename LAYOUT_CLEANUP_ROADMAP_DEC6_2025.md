# Layout Cleanup Roadmap - December 6, 2025

## 🚨 Critical Issues Identified

### Issue #1: Double Header Problem

**Problem**: TeamBulletin (and likely other pages) render TWO headers:

1. **AppHeader** from `Layout.tsx` (via DataRouter's `AuthenticatedLayout`)
2. **PageLayout header** from `PageLayout.tsx` (with title/subtitle)

**Visual Result**: Two navigation bars stacked, causing:

- Wasted vertical space
- Confusing UX (which header is real?)
- Content pushed down unnecessarily

**Root Cause**:

```tsx
// DataRouter.tsx wraps EVERY protected route in Layout
<ProtectedPage>
  {" "}
  // Contains Layout → AppHeader + Sidebar
  <LazyTeamBulletin /> // Contains PageLayout → Another header
</ProtectedPage>
```

### Issue #2: Inconsistent Layout Patterns

**Current State**:

- ✅ **DashboardPage**: Uses simple `<div>` wrapper, no PageLayout - CORRECT PATTERN
- ✅ **PlaybookPage**: Likely similar clean pattern
- ❌ **TeamBulletin**: Uses PageLayout with redundant header
- ❌ **Other pages**: Unknown, need audit

**Target State**: ALL pages should follow DashboardPage pattern:

```tsx
// ✅ GOOD: DashboardPage pattern
<div className="min-h-screen bg-secondary p-4 md:p-6">
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Page content directly */}
  </div>
</div>

// ❌ BAD: PageLayout adds redundant header
<PageLayout title="..." subtitle="...">
  {/* Content */}
</PageLayout>
```

### Issue #3: Flashing/Breathing Cards

**Problem**: Components re-rendering unnecessarily

**Identified Causes**:

1. ✅ **DashboardPage** - Fixed with React.memo
2. ❌ **TeamBulletin** - Not wrapped in React.memo
3. ❌ **Real-time subscriptions** - May trigger parent re-renders
4. ❌ **State updates** - activityStats, teamData fetching

### Issue #4: Conflicting Styles

**Problem**: Multiple style systems competing:

- PageLayout uses semantic classes (`page-layout`, `container-page`)
- DashboardPage uses Tailwind utility classes
- TeamBulletin has inline gradient backgrounds
- Aurora wrapper adds another layer

**Result**: Inconsistent spacing, colors, shadows, padding

### Issue #5: Excessive Wrapper Nesting

**Current TeamBulletin Structure** (7+ levels):

```tsx
<Aurora variant="shell">
  <PageLayout title="..." subtitle="...">
    <a href="#main-content">Skip link</a>
    <CollaborationProvider>
      <main id="main-content">
        <div className="bg-gradient-to-r...">
          {" "}
          // Another header!
          <div className="max-w-7xl mx-auto px-4...">
            <TeamBulletinHeader />
            {/* Stats bar */}
          </div>
        </div>
        {/* Actual content */}
      </main>
    </CollaborationProvider>
  </PageLayout>
</Aurora>
```

**DashboardPage Structure** (2 levels):

```tsx
<div className="min-h-screen bg-secondary p-4 md:p-6">
  <div className="max-w-7xl mx-auto space-y-6">{/* Content directly */}</div>
</div>
```

---

## 🎯 Solution Strategy

### Phase 1: Immediate Fixes (Priority 1)

**Goal**: Stop the bleeding - fix double headers and flashing cards

1. **Remove PageLayout from TeamBulletin**
   - Delete `<PageLayout>` wrapper
   - Replace with DashboardPage-style div wrapper
   - Move title/subtitle to inline content
   - **Impact**: Removes duplicate header immediately

2. **Wrap TeamBulletin in React.memo**
   - Prevent unnecessary re-renders
   - Add displayName for debugging
   - **Impact**: Stops card flashing

3. **Simplify TeamBulletin wrapper structure**
   - Remove or simplify Aurora wrapper (it's adding little value)
   - Remove redundant div nesting
   - Flatten to 2-3 levels max
   - **Impact**: Cleaner DOM, better performance

### Phase 2: Standardize All Pages (Priority 2)

**Goal**: Consistent layout patterns across entire app

1. **Audit ALL page components**
   - Identify which use PageLayout
   - Identify which use Aurora
   - Check for React.memo usage
   - **Files to check**:
     - PlaybookPage.tsx
     - GamePlansPage.tsx
     - PracticePlansPage.tsx
     - AnalyticsPage.tsx
     - RosterPage.tsx
     - ProfilePage.tsx
     - TeamSettings.tsx
     - All other team/\* pages

2. **Convert pages to DashboardPage pattern**
   - Replace PageLayout with simple div wrapper
   - Use consistent spacing classes
   - Follow semantic HTML (main, section, article)
   - Ensure responsive design (p-4 md:p-6)

3. **Deprecate or Fix PageLayout**
   - **Option A**: Delete PageLayout entirely (recommended)
   - **Option B**: Strip out header logic, keep as content wrapper only
   - **Decision**: Option A - PageLayout is redundant with Layout

### Phase 3: Performance Optimization (Priority 3)

**Goal**: Eliminate all re-render issues

1. **Wrap all page components in React.memo**
   - Add to every page in `src/pages/`
   - Add displayName for debugging
   - Test re-render behavior

2. **Optimize real-time hooks**
   - Review `useTeamActivity` - may need memoization
   - Review `useAnnouncementsRealtime` - check dependency arrays
   - Add useCallback/useMemo where needed

3. **Implement proper loading states**
   - Use skeleton screens (not spinners)
   - Prevent layout shift during loading
   - Show optimistic updates immediately

### Phase 4: Style Consolidation (Priority 4)

**Goal**: Single source of truth for styles

1. **Standardize color usage**
   - Use design tokens exclusively
   - Remove inline gradient definitions
   - Create reusable gradient utilities if needed

2. **Standardize spacing**
   - Use consistent padding/margin (space-6, space-8)
   - Use consistent container widths (max-w-7xl)
   - Use consistent card spacing (gap-6)

3. **Standardize typography**
   - Use Typography component consistently
   - Remove inline text size/weight classes
   - Use semantic variants (headline-lg, body, etc.)

---

## 📋 Detailed Implementation Plan

### Task 1.1: Fix TeamBulletin Double Header

**File**: `src/pages/TeamBulletin.tsx`

**Changes**:

```tsx
// REMOVE PageLayout import
// REMOVE: import { PageLayout } from "../components/layout/PageLayout";

// REMOVE Aurora wrapper (optional - adds little value)
// REMOVE: import { Aurora } from "../components/ui/Aurora";

// WRAP component in React.memo
const TeamBulletin: React.FC = React.memo(function TeamBulletin() {
  // ... existing logic ...

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Skip link */}
        <a href="#main-content" className="sr-only focus:not-sr-only...">
          Skip to main content
        </a>

        <CollaborationProvider {...props}>
          {/* Clean header section - NO PageLayout */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Typography variant="headline-lg" className="text-primary mb-1">
                  {teamData.name} Bulletin
                </Typography>
                <Typography variant="body" className="text-secondary">
                  Season {teamData.season} • {teamData.memberCount} members
                </Typography>
              </div>
              {/* Action buttons */}
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {/* Existing stats */}
            </div>
          </header>

          <main id="main-content" className="space-y-6">
            {/* Existing content */}
          </main>
        </CollaborationProvider>
      </div>
    </div>
  );
});

TeamBulletin.displayName = "TeamBulletin";
```

**Testing**:

- ✅ Only ONE header visible (AppHeader from Layout)
- ✅ No double navigation bars
- ✅ Clean spacing and layout
- ✅ Cards don't flash on re-render

### Task 1.2: Optimize TeamBulletin Re-renders

**File**: `src/pages/TeamBulletin.tsx`

**Changes**:

```tsx
// Memoize expensive computations
const teamHeaderProps = useMemo(
  () => ({
    teamName: teamData?.name || "",
    season: teamData?.season || "",
    // ... other props
  }),
  [teamData]
); // Only re-compute when teamData changes

// Memoize callbacks
const handleRefresh = useCallback(
  () => {
    // refresh logic
  },
  [
    /* dependencies */
  ]
);

// Already has React.memo from Task 1.1
```

### Task 1.3: Audit All Pages

**Create spreadsheet/checklist**:

| Page              | Uses PageLayout? | Uses Aurora? | Has React.memo? | Needs Fix? |
| ----------------- | ---------------- | ------------ | --------------- | ---------- |
| DashboardPage     | ❌               | ❌           | ✅              | ✅ GOOD    |
| TeamBulletin      | ✅               | ✅           | ❌              | ❌ FIX     |
| PlaybookPage      | ?                | ?            | ?               | ?          |
| GamePlansPage     | ?                | ?            | ?               | ?          |
| PracticePlansPage | ?                | ?            | ?               | ?          |
| AnalyticsPage     | ?                | ?            | ?               | ?          |
| RosterPage        | ?                | ?            | ?               | ?          |
| ProfilePage       | ?                | ?            | ?               | ?          |
| TeamSettings      | ?                | ?            | ?               | ?          |

### Task 2.1: Standardize All Pages

**For each page that uses PageLayout**:

1. Remove PageLayout import and wrapper
2. Add React.memo wrapper
3. Use DashboardPage div structure
4. Move title/subtitle to inline Typography
5. Test for visual regressions

### Task 3.1: Performance Audit

**Files to review**:

- `src/hooks/useTeamActivity.ts` - Check re-render frequency
- `src/hooks/useAnnouncementsRealtime.ts` - Verify debouncing works
- `src/pages/TeamBulletin.tsx` - Profile with React DevTools

### Task 4.1: Style Audit

**Create inventory**:

- List all inline gradient definitions
- List all arbitrary spacing values
- List all arbitrary color values
- Create design token equivalents

---

## 🎬 Execution Order

### Immediate (Today)

1. ✅ **Task 1.1**: Fix TeamBulletin double header
2. ✅ **Task 1.2**: Wrap TeamBulletin in React.memo
3. ✅ **Task 1.3**: Start page audit (first 5 pages)

### Next Session

4. **Task 1.3**: Complete page audit (remaining pages)
5. **Task 2.1**: Convert first 3 pages to standard pattern
6. **Task 3.1**: Performance profiling of TeamBulletin

### Future Sessions

7. **Task 2.1**: Convert remaining pages
8. **Task 4.1**: Style consolidation
9. **Delete PageLayout.tsx** (once all migrations complete)

---

## 📊 Success Metrics

### Performance Targets

- ✅ Zero unnecessary re-renders (verify with React DevTools Profiler)
- ✅ <100ms time to interactive after navigation
- ✅ No layout shift during page load
- ✅ Consistent 60fps scrolling

### Visual Quality Targets

- ✅ ONE header per page (AppHeader only)
- ✅ Consistent spacing (all pages use same padding/margins)
- ✅ Consistent colors (design tokens only, no inline gradients)
- ✅ Consistent typography (Typography component usage)

### Code Quality Targets

- ✅ All pages follow DashboardPage pattern
- ✅ All pages wrapped in React.memo
- ✅ PageLayout.tsx deleted or refactored
- ✅ Aurora usage reviewed/minimized
- ✅ Maximum 3 levels of wrapper nesting

---

## 🚀 Quick Win: Start Here

**Minimal viable fix (15 minutes)**:

1. Open `src/pages/TeamBulletin.tsx`
2. Comment out `<PageLayout>` wrapper (keep children)
3. Add React.memo wrapper
4. Test in browser - double header should be gone

**This alone will fix**:

- ✅ Double header issue
- ✅ Most of the flashing cards issue
- ✅ Reduce nesting by 2 levels

Then we can systematically tackle the remaining pages.

---

## 📝 Notes & Decisions

### Why Delete PageLayout Instead of Fixing It?

- **Reason 1**: Layout component already provides consistent wrapper (AppHeader + Sidebar)
- **Reason 2**: Pages need full control over their content structure
- **Reason 3**: DashboardPage proves simple div wrapper is sufficient
- **Reason 4**: PageLayout's header logic duplicates AppHeader

### Why DashboardPage Pattern is Correct

- **Clean**: No unnecessary wrappers
- **Flexible**: Full control over spacing and layout
- **Consistent**: Uses design tokens and Tailwind consistently
- **Performant**: Minimal React tree depth
- **Accessible**: Semantic HTML (div → main → section)

### Aurora Component: Keep or Remove?

**Review needed**: What value does Aurora provide?

- If visual effect only → Consider removing for simplicity
- If critical for design → Keep but standardize usage
- Current usage in TeamBulletin seems cosmetic

---

**Status**: Roadmap created, ready for execution
**Next Action**: Implement Task 1.1 (Fix TeamBulletin double header)
