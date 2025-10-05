# Phase 3: Design Token Migration Plan

**Status**: In Progress  
**Started**: October 4, 2025  
**Estimated Time**: 3-4 hours

## Overview

Migrate hardcoded values to semantic design tokens for consistency and maintainability.

## Token Mapping Reference

### Spacing Tokens (Priority 1)

Our semantic spacing scale (8px grid):

- `spacing-xs` → 8px (var(--space-2)) - minimum spacing
- `spacing-sm` → 12px (var(--space-3)) - compact spacing
- `spacing-md` → 16px (var(--space-4)) - comfortable spacing (default)
- `spacing-lg` → 24px (var(--space-6)) - spacious section spacing
- `spacing-xl` → 32px (var(--space-8)) - large section spacing
- `spacing-2xl` → 48px (var(--space-12)) - page section spacing
- `spacing-3xl` → 64px (var(--space-16)) - hero spacing

#### Migration Mapping

**Padding (p-\*):**

```
p-2  (8px)  → p-spacing-xs
p-3  (12px) → p-spacing-sm
p-4  (16px) → p-spacing-md
p-6  (24px) → p-spacing-lg
p-8  (32px) → p-spacing-xl
p-12 (48px) → p-spacing-2xl
p-16 (64px) → p-spacing-3xl
```

**Margin (m-_, mb-_, mt-\*, etc):**

```
mb-2  → mb-spacing-xs
mb-3  → mb-spacing-sm
mb-4  → mb-spacing-md
mb-6  → mb-spacing-lg
mb-8  → mb-spacing-xl
mb-12 → mb-spacing-2xl
```

**Gap:**

```
gap-2 → gap-spacing-xs
gap-3 → gap-spacing-sm
gap-4 → gap-spacing-md
gap-6 → gap-spacing-lg
gap-8 → gap-spacing-xl
```

**Space Between:**

```
space-y-2 → space-y-spacing-xs
space-y-4 → space-y-spacing-md
space-y-6 → space-y-spacing-lg
```

### Color Tokens (Priority 2)

#### Hardcoded Hex Colors Found

**Practice Block Types** (`src/types/practice.ts`):

```
#10B981 → emerald-500 (Warmup - green)
#06B6D4 → cyan-500 (Stretch - blue)
#8B5CF6 → electric-500 (Drills - purple)
#F59E0B → warning-500 (Scrimmage - amber)
#EF4444 → error-500 (Team Period - red)
#6B7280 → gray-500 (Film - gray)
#14B8A6 → teal-500 (Cool Down - teal)
#F97316 → orange-600 (Special Teams)
#00A86B → jade-500 (Custom - brand)
```

**Background Colors in Components**:

```
#FCFDFC → surface-primary or bg-white
#f5f9f6 → jade-50 (light jade tint)
#eef3f1 → gray-50 (subtle background)
```

#### Recommended Token Usage

**Backgrounds:**

- `#FCFDFC`, `#ffffff` → `bg-surface-primary` or `bg-white`
- Light gradients → Use Aurora component variants
- Gray backgrounds → `bg-surface-secondary`, `bg-surface-tertiary`

**Text Colors:**

- Black/dark text → `text-text-primary`
- Gray text → `text-text-secondary` or `text-text-tertiary`
- Muted text → `text-text-muted`

**Interactive Elements:**

- Primary actions → `bg-brand-primary`, `text-brand-primary`
- Success states → `bg-success-500`, `text-success-600`
- Errors → `bg-error-500`, `text-error-600`
- Info → `bg-info-500`, `text-info-600`

## Migration Strategy

### Phase 3A: High-Impact Spacing (Estimated: 1-2 hours)

**Target Files** (most spacing instances):

1. PlannerPage.tsx - ~40 instances
2. ProfilePage.tsx - ~60 instances
3. RosterPage.tsx - ~50 instances
4. TeamSettings.tsx - ~30 instances
5. CreateTeam.tsx - ~50 instances

**Approach:**

1. Focus on most common patterns: `mb-4`, `p-6`, `gap-4`, `mb-6`, `p-4`
2. Use find/replace with regex for consistent patterns
3. Manual review for edge cases (tight spacing, specific layouts)

### Phase 3B: Color Tokens (Estimated: 1 hour)

**Target Files:**

1. `src/types/practice.ts` - Practice block colors
2. `src/components/layout/Layout.tsx` - Gradient backgrounds
3. `src/components/team-dashboard/layout/TeamBulletinHeader.tsx` - Hex background
4. CSS files - Global color overrides

**Approach:**

1. Replace practice block hex codes with Tailwind color tokens
2. Remove hardcoded gradients in favor of Aurora variants
3. Update CSS overrides to use CSS variables

### Phase 3C: Validation & Testing (Estimated: 30 minutes)

1. Visual regression testing on key pages
2. Verify spacing looks correct across breakpoints
3. Check dark mode compatibility
4. Run build to catch any broken references

## Success Metrics

- [ ] Reduce hardcoded hex colors by 80%+ (50+ → <10)
- [ ] Migrate 200+ spacing instances to semantic tokens
- [ ] Zero visual regressions on core pages
- [ ] Build passes with 0 errors
- [ ] Dark mode still works correctly

## Automation Script

Create `scripts/migrate-tokens.js`:

```javascript
// Find and replace common patterns
const migrations = {
  spacing: {
    "p-6": "p-spacing-lg",
    "mb-4": "mb-spacing-md",
    "gap-4": "gap-spacing-md",
    // ... more patterns
  },
};
```

## Files Modified Tracking

- [ ] src/pages/PlannerPage.tsx
- [ ] src/pages/ProfilePage.tsx
- [ ] src/pages/RosterPage.tsx
- [ ] src/pages/TeamSettings.tsx
- [ ] src/pages/CreateTeam.tsx
- [ ] src/types/practice.ts
- [ ] src/components/layout/Layout.tsx
- [ ] src/components/team-dashboard/layout/TeamBulletinHeader.tsx

## Notes

- Keep `p-1`, `p-2`, `m-1` for micro-spacing (not worth tokens)
- Preserve `space-x-*` for flex layouts (less critical)
- Don't migrate border radius values (different scale)
- Test on mobile after spacing changes

## Rollback Plan

Git commit strategy:

1. Commit spacing migrations separately from color migrations
2. Test after each commit
3. Easy to revert individual commits if issues arise
