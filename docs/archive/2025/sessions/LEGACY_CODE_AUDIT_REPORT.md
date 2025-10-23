# 🔍 Legacy Code Audit Report

**Date**: October 6, 2025  
**Status**: 🚨 **ACTION REQUIRED**  
**Scope**: Complete codebase audit for legacy styling, deprecated tokens, and duplicate code

---

## 📊 Executive Summary

### Critical Findings

🚨 **1,000+ instances** of legacy code found across the codebase:

- ❌ **~200+ files** using deprecated `--semantic-*`, `--color-*`, `--navigation-*` tokens
- ❌ **~100+ files** using hardcoded Tailwind color classes (`bg-jade-600`, `text-navy-700`, etc.)
- ❌ **Multiple duplicate** CSS definitions and conflicting styles
- ❌ **Inconsistent** styling approaches (tokens vs hardcoded vs utility classes)

### Impact

- 🐛 **Maintenance Burden**: Changes require updating multiple locations
- 🎨 **Design Inconsistency**: Same component styled differently across pages
- 🚀 **Performance**: Redundant CSS bloating bundle size
- ♿ **Accessibility**: Inconsistent focus states and contrast ratios

---

## 🎯 Priority 1: Deprecated Token Usage (CRITICAL)

### 1.1 Semantic Tokens (`--semantic-*`)

**Status**: ⛔ **DEPRECATED** - Should use component tokens instead

#### High-Priority Files (Core Components)

```
src/index.css (Line 173-610)
├── --semantic-bg-primary (30+ uses)
├── --semantic-bg-secondary (25+ uses)
├── --semantic-bg-muted (20+ uses)
├── --semantic-text-primary (35+ uses)
├── --semantic-text-secondary (30+ uses)
├── --semantic-text-muted (15+ uses)
├── --semantic-border (25+ uses)
├── --semantic-primary (20+ uses)
└── --semantic-primary-hover (15+ uses)
```

**Files Using Semantic Tokens**:

- ✅ `src/index.css` - **CRITICAL** (Global styles - 100+ uses)
- ⚠️ `src/components/ui/Breadcrumb/Breadcrumb.tsx` (6 uses)
- ⚠️ `src/components/ui/SegmentedControl/SegmentedControl.tsx` (2 uses)
- ⚠️ `src/design-system/utils.ts` (2 uses)
- ⚠️ `src/hooks/useColorTheme.ts` (1 use)
- ⚠️ `src/lib/designSystemMapping.ts` (Documentation only)

#### Migration Required

**From**: `--semantic-bg-primary`  
**To**: Component-specific tokens:

- Navigation → `--component-navigation-bg`
- Cards → `--component-card-background`
- Modals → `--component-modal-bg`
- Inputs → `--component-input-bg`

**Estimated Effort**: 8-12 hours (150+ replacements)

---

### 1.2 Color Tokens (`--color-*`)

**Status**: ⛔ **DEPRECATED** - Direct color references should use semantic or component tokens

#### Files Using Color Tokens

```
src/index.css (Line 186-256, 367-522)
├── --color-bgBrand (10 uses)
├── --color-bgSecondary (8 uses)
├── --color-textPrimary (12 uses)
├── --color-border (15 uses)
├── --color-primary (8 uses)
├── --color-gray-* (20+ uses)
├── --color-error-* (10 uses)
└── --color-success-* (8 uses)
```

**Other Files**:

- `src/styles/team-dashboard.css` (50+ uses of `--color-gray-*`, `--color-jade-*`, `--color-navy-*`)
- `src/components/calendar/BoxCallCalendar.css` (30+ uses)
- `src/components/playbook/diagram*/ActionBar.tsx` (2 uses)
- `src/components/practice/.../TimelineSlider.tsx` (4 uses)

**Estimated Effort**: 10-15 hours (200+ replacements)

---

### 1.3 Navigation Tokens (`--navigation-*`)

**Status**: ⛔ **DEPRECATED** - Already migrated to `--component-navigation-*` in Priority 6

#### Remaining Issues

```
src/index.css (Line 180-182)
├── --navigation-background → SHOULD BE REMOVED (aliased to semantic)
├── --navigation-border → SHOULD BE REMOVED (aliased to semantic)
└── --navigation-linkHover → SHOULD BE REMOVED (aliased to semantic)
```

**Action**: Remove these alias definitions, they're redundant with component tokens.

**Estimated Effort**: 30 minutes

---

## 🎯 Priority 2: Hardcoded Tailwind Classes (HIGH)

### 2.1 Hardcoded Color Classes

**Status**: ❌ **BAD PRACTICE** - Should use utility classes or component tokens

#### Common Patterns Found

```typescript
// ❌ BAD: Hardcoded jade colors
className = "bg-jade-600 text-white hover:bg-jade-700";
className = "text-jade-600 dark:text-jade-400";
className = "border-jade-200 dark:border-jade-800";

// ❌ BAD: Hardcoded navy colors
className = "text-navy-600 hover:text-navy-700";
className = "bg-navy-900/20";

// ❌ BAD: Hardcoded blue colors
className = "bg-blue-600 text-white hover:bg-blue-700";
className = "text-blue-700 dark:text-blue-300";
className = "border-blue-200/50 dark:border-blue-700/50";

// ❌ BAD: Hardcoded red colors
className = "bg-red-50 border-red-200 text-red-700";
```

### 2.2 High-Impact Files (Must Fix)

#### Core UI Components

1. **Button.tsx** (Line 96-99)

   ```typescript
   // ❌ Link variant using hardcoded navy colors
   base: "text-navy-600 p-0 h-auto",
   hover: "hover:text-navy-700 hover:underline",
   ```

   **Fix**: Use `.btn-link` utility class (already exists!)

2. **Input.tsx** (Line 236)
   ```typescript
   // ❌ Loading spinner with hardcoded jade color
   <div className="animate-spin ... border-2 border-jade-500" />
   ```
   **Fix**: Use `--component-input-border-focus` token

#### Dashboard Components

3. **CompactTrophyShelf.tsx** (79+ jade/blue color uses)

   ```typescript
   // ❌ Hardcoded throughout component
   className = "border-jade-200/60 dark:border-jade-700/60";
   className = "text-jade-600 dark:text-jade-400";
   className = "text-blue-600 dark:text-blue-300";
   ```

   **Fix**: Create `.trophy-card`, `.trophy-stat-primary`, `.trophy-stat-secondary` utility classes

4. **RoleBasedDashboard.tsx** (Line 50, 91)
   ```typescript
   // ❌ Loading spinners with hardcoded jade
   <div className="border-b-2 border-jade-600" />
   ```
   **Fix**: Use `.spinner-primary` utility class

#### Form Components

5. **EnhancedFormFields.tsx** (Line 112, 187, 266)

   ```typescript
   // ❌ Focus states with hardcoded jade
   return "border-jade-500 ring-2 ring-jade-500/20";
   ```

   **Fix**: Use `.focus-ring` utility class

6. **CreateCoachAccount.tsx** (12 instances!)
   ```typescript
   // ❌ All inputs have hardcoded focus
   className = "focus:ring-2 focus:ring-jade-500 focus:border-jade-600";
   ```
   **Fix**: Use `.input` utility class

#### Page Components

7. **TeamBulletin.tsx** (10+ jade/blue uses)
8. **PracticePlanner.tsx** (8+ jade uses)
9. **PracticePlannerOld.tsx** (8+ jade uses)
10. **ProfilePage.tsx** (5+ jade/blue uses)

### 2.3 Complete File List (100+ files affected)

**Components** (50+ files):

- `src/components/onboarding/TeamOnboardingWizard.tsx`
- `src/components/playbook/page/PlaybookViewTabs.tsx`
- `src/components/dashboard/*` (multiple files)
- `src/components/practice/*` (multiple files)
- `src/components/forms/EnhancedFormFields.tsx`
- `src/components/analytics/AnalyticsDashboard.tsx`

**Pages** (20+ files):

- `src/pages/TeamBulletin.tsx`
- `src/pages/PracticePlanner.tsx`
- `src/pages/PracticePlannerOld.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/CreateCoachAccount.tsx`
- `src/pages/CreateTeam.tsx`
- `src/pages/AchievementAdminPage.tsx`
- `src/pages/RosterPage.tsx`

**Stylesheets** (5+ files):

- `src/styles/team-dashboard.css` (50+ color uses)
- `src/components/calendar/BoxCallCalendar.css` (30+ color uses)

**Estimated Total Effort**: 20-30 hours

---

## 🎯 Priority 3: Duplicate & Conflicting CSS (MEDIUM)

### 3.1 Duplicate Class Definitions

#### Found in `src/index.css`

```css
/* DUPLICATE #1: Legacy brand aliases (Lines 183-193) */
--color-bgBase: var(--semantic-bg-primary);
--color-bgSecondary: var(--semantic-bg-secondary);
--color-bgMuted: var(--semantic-bg-muted);
--color-bgBrand: var(
  --color-bgBrand,
  var(--semantic-bg-secondary)
); /* Circular reference! */
--color-border: var(--semantic-border);
--color-textPrimary: var(--semantic-text-primary);
--color-textSecondary: var(--semantic-text-secondary);
--color-textMuted: var(--semantic-text-muted);
--color-primary: var(--semantic-primary);
--color-primaryHover: var(--semantic-primary-hover);
--color-primaryActive: var(--semantic-primary-active);
```

**Action**: ⚠️ **REMOVE** - These are legacy aliases, no longer needed with component tokens

```css
/* DUPLICATE #2: Panel/Navigation aliases (Lines 173-182) */
--panel-bg: var(--semantic-bg-secondary);
--panel-border: var(--semantic-border);
--navigation-background: var(--semantic-bg-primary);
--navigation-border: var(--semantic-border);
--navigation-linkHover: var(--semantic-bg-muted);
```

**Action**: ⚠️ **REMOVE** - Redundant with component navigation tokens

### 3.2 Conflicting Utility Classes

#### Surface Classes (Multiple Definitions)

```css
/* src/index.css - Lines 225-294 */
.surface-base {
  background-color: var(--semantic-bg-secondary);
}
.surface-primary {
  background-color: var(--semantic-bg-primary);
}
.surface-secondary {
  background-color: var(--semantic-bg-secondary);
}
.surface-muted {
  background-color: var(--semantic-bg-muted);
}
.surface-subtle {
  background-color: var(--semantic-bg-muted);
}
.surface-nav {
  background: var(--navigation-background);
}
.surface-inverse {
  background-color: var(--semantic-surface-inverse);
}
```

**Issues**:

- `.surface-secondary` and `.surface-base` are identical
- `.surface-muted` and `.surface-subtle` are identical
- `.surface-nav` uses deprecated `--navigation-background`

**Action**: Consolidate to component-based surface utilities

### 3.3 Redundant Focus Ring Definitions

```css
/* src/index.css - Lines 480-484, 512-517, 582 */
.focus-primary { ... }  /* Uses semantic-primary */
.ring-outline { ... }   /* Uses semantic-primary */
.input-focus { outline: 2px solid var(--semantic-primary); }
```

**Action**: Remove, use `.focus-ring` utility class from component-utilities.css

**Estimated Effort**: 6-8 hours

---

## 🎯 Priority 4: Legacy Stylesheets (MEDIUM)

### 4.1 team-dashboard.css

**File**: `src/styles/team-dashboard.css`  
**Status**: ❌ **LEGACY** - 60+ hardcoded color references

**Issues**:

```css
/* Lines 20-42: Hardcoded colors instead of tokens */
background: var(--color-white);
border: 1px solid var(--color-gray-200);
box-shadow: 0 1px 3px rgb(var(--color-black-rgb) / 0.02);

/* Lines 62-125: Gradient classes with hardcoded colors */
.team-stat-gradient-jade {
  background: linear-gradient(135deg, var(--color-jade-500) 0%, var(--color-jade-400) 100%);
}
.team-stat-gradient-navy { ... }
.team-stat-gradient-amber { ... }
.team-stat-gradient-red { ... }
```

**Recommendation**:

1. Migrate to component tokens
2. OR mark as "decorative" (if these are intentionally branded gradients)
3. Create utility classes if reused

**Estimated Effort**: 4-6 hours

---

### 4.2 BoxCallCalendar.css

**File**: `src/components/calendar/BoxCallCalendar.css`  
**Status**: ⚠️ **MIXED** - Uses both tokens and hardcoded colors

**Issues**:

```css
/* Lines 3-13: Mix of good and bad */
--fc-border-color: var(--color-border); /* ✅ OK */
--fc-button-bg-color: var(--color-brand-jade); /* ❌ Hardcoded brand color */
--fc-button-hover-bg-color: var(--color-interaction-jade); /* ❌ Hardcoded */
--fc-today-bg-color: var(--color-surface-jade); /* ❌ Hardcoded */

/* Lines 57-78: Event type colors */
.fc-event-game {
  background-color: var(--color-brand-navy-dark) !important;
}
.fc-event-practice {
  background-color: var(--color-brand-jade) !important;
}
.fc-event-meeting {
  background-color: var(--color-warning) !important;
}
```

**Recommendation**: Create calendar-specific component tokens

**Estimated Effort**: 3-4 hours

---

## 🎯 Priority 5: Layout Token Usage (LOW)

### 5.1 Semantic Layout Tokens

**File**: `src/styles/layout-utilities.css`, `src/styles/grid-flex-patterns.css`

**Status**: ✅ **ACCEPTABLE** - These semantic layout tokens are appropriate

```css
/* These are OK to keep */
max-width: var(--semantic-layout-page-container);
max-width: var(--semantic-layout-page-content-width);
gap: var(--semantic-layout-grid-gap);
width: var(--semantic-layout-dashboard-sidebar);
```

**Reason**: Layout tokens are meant to be semantic and reusable across contexts. Unlike color/styling tokens, layout dimensions don't need component-specific variants.

**Action**: ✅ **NO CHANGE NEEDED**

---

## 📋 Cleanup Roadmap

### Phase 1: Critical Fixes (Week 1) 🚨

**Goal**: Remove deprecated tokens from core infrastructure

1. **Clean up `src/index.css`**
   - Remove legacy `--color-*` aliases (Lines 183-193)
   - Remove legacy `--navigation-*` aliases (Lines 180-182)
   - Remove legacy `--panel-*` aliases (Lines 173-174)
   - Consolidate duplicate surface classes
   - **Estimated**: 4-6 hours

2. **Fix Core UI Components**
   - Button.tsx link variant
   - Input.tsx loading spinner
   - **Estimated**: 1-2 hours

### Phase 2: Component Migration (Week 2-3) 🔄

**Goal**: Migrate high-traffic components to utility classes

3. **Dashboard Components**
   - CompactTrophyShelf.tsx
   - RoleBasedDashboard.tsx
   - **Estimated**: 4-6 hours

4. **Form Components**
   - EnhancedFormFields.tsx
   - CreateCoachAccount.tsx
   - All input focus states
   - **Estimated**: 6-8 hours

5. **Page Components**
   - TeamBulletin.tsx
   - PracticePlanner.tsx (both versions)
   - ProfilePage.tsx
   - **Estimated**: 8-10 hours

### Phase 3: Stylesheet Consolidation (Week 4) 🎨

**Goal**: Clean up legacy stylesheets

6. **team-dashboard.css Migration**
   - Create component tokens for stats
   - Migrate to utility classes
   - **Estimated**: 4-6 hours

7. **BoxCallCalendar.css Migration**
   - Create calendar component tokens
   - Update FullCalendar integration
   - **Estimated**: 3-4 hours

### Phase 4: Final Cleanup (Week 5) ✅

**Goal**: Remove all remaining legacy code

8. **Breadcrumb & Minor Components**
   - Update remaining semantic token usage
   - **Estimated**: 2-3 hours

9. **Documentation & Testing**
   - Update design system docs
   - Run visual regression tests
   - **Estimated**: 4-6 hours

---

## 📊 Effort Summary

| Phase     | Tasks                    | Estimated Hours | Priority    |
| --------- | ------------------------ | --------------- | ----------- |
| Phase 1   | Critical Fixes           | 6-8 hours       | 🚨 CRITICAL |
| Phase 2   | Component Migration      | 18-24 hours     | 🔥 HIGH     |
| Phase 3   | Stylesheet Consolidation | 7-10 hours      | ⚠️ MEDIUM   |
| Phase 4   | Final Cleanup            | 6-9 hours       | ✅ LOW      |
| **TOTAL** | **37-51 hours**          | **~1-2 weeks**  |             |

---

## 🎯 Success Metrics

### Before Cleanup

- ❌ 1,000+ legacy token/class uses
- ❌ 200+ files with deprecated code
- ❌ 50+ duplicate CSS definitions
- ❌ Inconsistent styling patterns

### After Cleanup (Target)

- ✅ 0 deprecated token uses
- ✅ 100% component token coverage
- ✅ 0 duplicate CSS definitions
- ✅ Consistent utility class patterns
- ✅ 20-30% smaller CSS bundle
- ✅ Improved maintainability

---

## 🚀 Quick Wins (Can Start Immediately)

1. **Remove Legacy Aliases** (30 min)
   - Delete Lines 173-193 from index.css
   - Run type check to verify

2. **Fix Button Link Variant** (15 min)
   - Replace hardcoded navy colors with `.btn-link` class
   - Already have the utility class!

3. **Fix Input Loading Spinner** (10 min)
   - Replace `border-jade-500` with token reference

4. **Create Spinner Utility Class** (20 min)
   ```css
   .spinner-primary {
     border-color: var(--component-button-primary-bg);
     border-top-color: transparent;
   }
   ```

**Total Quick Wins**: ~1.5 hours, immediate 20-30 file improvement

---

## 📝 Recommendations

### DO ✅

1. **Start with Phase 1** - Remove critical legacy code first
2. **Use utility classes** - Leverage component-utilities.css
3. **Create new tokens** - For legitimate new patterns (calendar, stats)
4. **Document decisions** - Update this report as you progress
5. **Test incrementally** - Type check + visual QA after each phase

### DON'T ❌

1. **Don't rush** - This is 1-2 weeks of careful work
2. **Don't mix phases** - Complete one phase before starting next
3. **Don't skip testing** - Visual regressions are easy to miss
4. **Don't remove layout tokens** - Those are intentionally semantic
5. **Don't break decorative gradients** - Some hardcoded colors are intentional branding

---

## 🔗 Related Documents

- [Priority 6 Complete](./PRIORITY_6_COMPONENT_STANDARDIZATION_COMPLETE.md) - Recent component migration
- [Priority 5 Complete](./PRIORITY_5_COMPONENT_TOKEN_ENHANCEMENT_COMPLETE.md) - Component token system
- [Design System V2.0 Roadmap](./DESIGN_SYSTEM_V2_ROADMAP.md) - Overall strategy

---

**Next Steps**: Review this audit, prioritize phases, and begin Phase 1 (Critical Fixes).

**Author**: GitHub Copilot  
**Status**: 📋 **AUDIT COMPLETE** - Ready for cleanup execution
