# Styling Issues Comprehensive Audit - November 27, 2025

## Summary

Found **5 categories of invalid Tailwind classes** causing styling failures across the codebase.

## Critical Issues Found

### 1. ❌ Invalid Spacing Utilities (HIGH PRIORITY)

**Problem**: Using `*-spacing-{size}` pattern which doesn't exist in Tailwind.

**Pattern Found**: `p-spacing-lg`, `gap-spacing-xs`, `pt-spacing-sm`, `mb-spacing-md`, etc.

**Valid Tailwind**: Should be `p-lg`, `gap-2`, `pt-sm`, `mb-md`

**Affected Files** (20+ instances):

- `src/pages/PlannerPage.tsx` - 20+ instances
- `src/pages/TeamSettings.tsx` - 10+ instances
- `src/pages/ProfilePage.tsx` - 20+ instances
- `src/pages/PlayerDetailPage.tsx` - 7 instances
- `src/components/playbook/play-card/PlayCardQuickActions.tsx` - **FIXED**

**Fix Required**:

```tsx
// ❌ WRONG
className = "p-spacing-lg gap-spacing-xs mt-spacing-md";

// ✅ CORRECT
className = "p-lg gap-2 mt-md";
```

---

### 2. ❌ Invalid Border Color Classes (HIGH PRIORITY)

**Problem**: Using `border-subtle`, `border-medium`, `border-strong` which don't exist in Tailwind config.

**Valid Tailwind Border Colors**:

- `border-primary` → `var(--color-border-primary)`
- `border-secondary` → `var(--color-border-secondary)`
- `border-muted` → `var(--color-border-muted)`
- `border-accent` → `var(--color-border-accent)`
- `border-focus` → `var(--color-border-focus)`

**Affected Files** (30+ instances):

- `src/pages/CreateCoachAccount.tsx` - 15+ instances of `border-medium`, `border-subtle`
- `src/pages/JoinTeam.tsx` - 5+ instances
- `src/pages/TeamSettings.tsx` - 3 instances
- `src/pages/legal/*.tsx` - Multiple instances
- `src/components/onboarding/ActivationChecklist.tsx`

**Fix Required**:

```tsx
// ❌ WRONG
className = "border border-medium";
className = "border-subtle";

// ✅ CORRECT
className = "border border-secondary";
className = "border-muted";
```

---

### 3. ❌ Invalid Surface Background Classes (MEDIUM PRIORITY)

**Problem**: Using `surface-subtle`, `surface-info`, `surface-success`, `surface-primary` as standalone classes.

**Valid Tailwind**:  
These don't exist. Should use `bg-{color}` classes:

- `bg-bg-subtle`
- `bg-info-lightest`
- `bg-success-lightest`
- `bg-bg-primary`

**Affected Files** (20+ instances):

- `src/pages/CreateCoachAccount.tsx` - Multiple `surface-subtle` instances
- `src/pages/JoinTeam.tsx`
- `src/pages/PracticePlanner.tsx`
- `src/pages/legal/*.tsx`

**Fix Required**:

```tsx
// ❌ WRONG
className = "surface-subtle";
className = "surface-info";

// ✅ CORRECT
className = "bg-bg-subtle";
className = "bg-info-lightest";
```

---

### 4. ❌ Double-Prefix Classes (CRITICAL - FIXED)

**Problem**: Using `text-text-*`, `bg-bg-*`, `border-border-*` double prefixes.

**Status**:

- ✅ `border-border-secondary` → `border-secondary` - **FIXED in PlayCard.tsx**
- ⚠️ Still exists in utility files (`src/design-system/utils.ts`, `src/lib/designSystemMapping.ts`)

**Affected Files**:

- `src/design-system/utils.ts` - 10+ instances of `text-text-*`
- `src/lib/designSystemMapping.ts` - Multiple double-prefix mappings
- `src/lib/hapticFeedback.ts`
- `src/components/practice/utils.ts`

**Fix Required**:

```tsx
// ❌ WRONG
className = "text-text-primary bg-bg-subtle border-border-secondary";

// ✅ CORRECT
className = "text-primary bg-bg-subtle border-secondary";
```

---

### 5. ❌ Invalid CSS @apply Directives (CRITICAL - FIXED)

**Problem**: Using `@apply` with non-existent utilities like `border-divider`.

**Status**: ✅ **FIXED** - Changed to direct CSS var references in `src/index.css`

**Solution Applied**:

```css
/* ✅ CORRECT - Direct CSS vars */
.divider-t {
  border-top-width: 1px;
  border-top-color: var(--color-border-muted);
}
```

---

## Fixes Completed

### ✅ Already Fixed:

1. `border-border-secondary` → `border-secondary` in PlayCard.tsx
2. CSS divider utilities (`.divider-t`, `.divider-b`, etc.) - Direct CSS vars
3. `pt-spacing-sm` → `pt-sm` in PlayCardQuickActions.tsx
4. `gap-spacing-xs` → `gap-2` in PlayCardQuickActions.tsx
5. Card spacing `space-y-4` → `space-y-3` in PlayGrid.tsx

---

## Fixes Needed (Priority Order)

### HIGH PRIORITY - Breaks Styling Now

**1. Fix all `*-spacing-*` utilities** (Est. 50+ instances)

```bash
# Files to fix:
src/pages/PlannerPage.tsx
src/pages/TeamSettings.tsx
src/pages/ProfilePage.tsx
src/pages/PlayerDetailPage.tsx
```

**2. Fix all `border-subtle`, `border-medium`, `border-strong`** (Est. 30+ instances)

```bash
# Files to fix:
src/pages/CreateCoachAccount.tsx (15+ instances)
src/pages/JoinTeam.tsx (5+ instances)
src/pages/TeamSettings.tsx
src/pages/legal/*.tsx
```

**3. Fix all `surface-*` standalone classes** (Est. 20+ instances)

```bash
# Files to fix:
src/pages/CreateCoachAccount.tsx
src/pages/JoinTeam.tsx
src/pages/PracticePlanner.tsx
src/pages/legal/*.tsx
```

### MEDIUM PRIORITY - Affects Consistency

**4. Fix double-prefix classes in utility files**

```bash
# Files to fix:
src/design-system/utils.ts
src/lib/designSystemMapping.ts
src/lib/hapticFeedback.ts
src/components/practice/utils.ts
```

---

## Validation Strategy

### Step 1: Automated Find & Replace

Run these grep commands to find remaining instances:

```bash
# Find invalid spacing utilities
grep -r "spacing-xs\|spacing-sm\|spacing-md\|spacing-lg\|spacing-xl" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"

# Find invalid border classes
grep -r "border-subtle\|border-medium\|border-strong" src/ --include="*.tsx" | grep -v "node_modules"

# Find surface classes
grep -r "surface-subtle\|surface-info\|surface-success\|surface-primary" src/ --include="*.tsx" | grep -v "node_modules"

# Find double-prefix classes
grep -r "text-text-\|bg-bg-\|border-border-" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

### Step 2: Manual Review

1. Check Tailwind config for all available utilities
2. Verify CSS variables exist for each token reference
3. Test in browser after each batch of fixes

### Step 3: Add ESLint Rule (Future)

Create custom rule to catch invalid class patterns:

- `*-spacing-*` (invalid)
- `border-subtle|medium|strong` (invalid)
- `surface-*` as standalone (invalid)
- `text-text-*`, `bg-bg-*`, `border-border-*` (invalid)

---

## Root Cause Analysis

### Why This Happened

1. **Inconsistent design token naming** - Some use prefix + token (`bg-bg-*`), some don't (`text-primary`)
2. **Custom spacing pattern** - Developer created `*-spacing-*` pattern not matching Tailwind
3. **Old utility classes** - `border-subtle` was likely from older design system
4. **@apply conflicts** - CSS variables don't work well with Tailwind's `@apply` directive

### Prevention Strategy

1. ✅ Stick to Tailwind's standard patterns
2. ✅ Use CSS variables directly in custom utilities
3. ✅ Document all valid class patterns in design system docs
4. ✅ Add ESLint rules to catch invalid patterns
5. ✅ Regular audits using grep commands above

---

## Estimated Impact

- **Files Affected**: ~20-30 files
- **Total Instances**: ~100+ invalid class usages
- **Severity**: HIGH - Many styles not applying correctly
- **Fix Time**: 2-3 hours for comprehensive fix
- **Testing Time**: 1 hour to verify all pages

---

## Next Steps

1. ✅ **DONE**: Fix PlayCard.tsx styling issues
2. ⏳ **IN PROGRESS**: Comprehensive audit (this document)
3. 🔜 **NEXT**: Fix all `*-spacing-*` utilities in high-priority files
4. 🔜 Fix all `border-*` invalid classes
5. 🔜 Fix all `surface-*` invalid classes
6. 🔜 Add ESLint rules to prevent future issues
7. 🔜 Update design system documentation
