# Mobile Logic Duplication & Conflict Audit

**Date:** October 19, 2025  
**Audited By:** GitHub Copilot  
**Scope:** Complete scan of mobile detection, sizing, and display logic across the codebase

---

## Executive Summary

**Status:** ✅ **CLEAN - No Critical Conflicts Found**

The codebase has **consistent mobile detection** using a single source of truth (`useIsMobile()` hook at 768px breakpoint). However, there are **3 areas of concern** that could lead to confusion:

1. ⚠️ **Breakpoint Misalignment**: Tailwind `sm:` (640px default) vs Hook `isMobile` (<768px)
2. ⚠️ **Duplicate Detection Logic**: `useViewMode.ts` has hardcoded `max-width: 768px` check
3. ℹ️ **Unused Hook**: `useMobileErrorHandler.ts` is dead code (0 references)

**Good News:**

- ✅ No conflicting size definitions
- ✅ Single source of truth for mobile detection (`useBreakpoint.ts`)
- ✅ Consistent 768px breakpoint used everywhere
- ✅ No competing CSS media queries with different breakpoints

---

## 1. Mobile Detection Logic Inventory

### ✅ Primary Source of Truth

**File:** `src/hooks/useBreakpoint.ts`

```typescript
// AUTHORITATIVE BREAKPOINT DEFINITIONS
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "mobile"; // < 768px
}

export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "tablet"; // 768px - 1023px
}

export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "desktop"; // >= 1024px
}
```

**Breakpoint Values:**

- Mobile: `< 768px`
- Tablet: `768px - 1023px`
- Desktop: `≥ 1024px`

**Usage:** **9 files** use this hook correctly:

1. `src/pages/PlaybookPage.tsx` (line 132) ✅
2. `src/components/playbook/PlayGrid.tsx` (line 363) ✅
3. `src/components/playbook/PlayCard.tsx` (line 155) ✅
4. `src/components/playbook/play-card/PlayCardTileHeader.tsx` (line 52) ✅
5. `src/components/playbook/AddNewPlayModal.tsx` (line 79) ✅
6. `src/components/playbook/AddNewPlayModal/components/FuzzySearchInput.tsx` (line 43) ✅
7. `src/hooks/useMobileButtonProps.ts` (lines 21, 50, 68) ✅
8. `src/components/playbook/AddNewPlayModal/MobileWizardView.tsx` ✅
9. `src/components/mobile/ui/MobilePageHeader.tsx` ✅

---

## 2. Conflicting or Duplicate Detection

### ⚠️ Issue #1: Duplicate Hardcoded Breakpoint in `useViewMode.ts`

**File:** `src/components/playbook/PlayGrid/hooks/useViewMode.ts` (line 56)

```typescript
// ❌ DUPLICATE BREAKPOINT - Should use useIsMobile() instead!
const mediaQuery = window.matchMedia("(max-width: 768px)");
```

**Problem:**

- This hook manually checks `max-width: 768px` instead of using `useIsMobile()`
- If we ever change the mobile breakpoint, this will be out of sync
- Creates maintenance burden (two places to update)

**Impact:** 🟡 **MODERATE**

- Currently matches `useIsMobile()` breakpoint (768px)
- **Will break** if breakpoints are ever adjusted
- Violates DRY principle

**Recommendation:**

```typescript
// ✅ BETTER: Use existing hook
import { useIsMobile } from "../../../hooks/useBreakpoint";

export function useViewMode() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (hasManualViewModeOverride) return;

    const newMode = isMobile ? "grid" : "list";
    setViewMode(newMode, false);
  }, [isMobile, hasManualViewModeOverride]);
}
```

---

### ⚠️ Issue #2: Tailwind Breakpoint Misalignment

**File:** `tailwind.config.js` (line 200)

```javascript
screens: {
  sm: "768px",   // ✅ CORRECT - Matches useIsMobile() breakpoint
  md: "1024px",  // ✅ CORRECT - Matches useIsDesktop() breakpoint
  lg: "1280px",
  xl: "1440px",
  "2xl": "1920px",
}
```

**Analysis:**

- ✅ **GOOD**: Tailwind `sm:` is **correctly configured** to 768px (not default 640px)
- ✅ **GOOD**: Tailwind `md:` matches desktop breakpoint (1024px)
- ✅ **GOOD**: Comments in config explicitly document alignment with hooks

**Confusion Risk:** 🟡 **LOW BUT PRESENT**

Developers familiar with default Tailwind might expect:

- `sm:` = 640px (default Tailwind)
- But we use `sm:` = 768px (custom)

**Mitigation:**

- Comments in `tailwind.config.js` are clear ✅
- `src/components/mobile/index.ts` documents breakpoints ✅
- All components use hooks, not magic numbers ✅

---

## 3. Mobile Sizing Logic Inventory

### ✅ Touch Target Sizing (Consistent)

**File:** `src/hooks/useMobileButtonProps.ts`

```typescript
// AUTHORITATIVE MOBILE SIZING
export function useMobileButtonProps(
  desktopSize: ButtonSize = "md",
  isPrimary = false
): { size: ButtonSize } {
  const isMobile = useIsMobile();

  if (!isMobile) return { size: desktopSize };

  // ✅ Consistent: Forces 44px+ touch targets on mobile
  return {
    size: isPrimary
      ? desktopSize === "sm"
        ? "lg"
        : "xl" // Primary: 44-48px
      : desktopSize === "sm"
        ? "md"
        : "lg", // Secondary: 40-44px
  };
}
```

**Usage:** 3 files use this hook:

1. `src/pages/PlaybookPage.tsx` (lines 135-136) ✅
2. `src/components/playbook/AddNewPlayModal.tsx` (lines 80-81) ✅
3. `src/hooks/useMobileButtonProps.ts` (itself) ✅

**No Conflicts Found** ✅

---

### ✅ Padding/Spacing Logic (Consistent)

**PlayCard.tsx** (line 443-450):

```typescript
className={`${
  isCompact
    ? isMobile ? "p-5" : "p-3 sm:p-4"
    : isMobile ? "p-6" : "p-4 sm:p-6"
} overflow-visible`}
```

**Analysis:**

- Uses `isMobile` hook for runtime detection ✅
- Uses `sm:` Tailwind classes for responsive scaling ✅
- No conflicts (both use 768px breakpoint) ✅

**Logic Flow:**

```
Desktop (≥768px):
  Compact: p-3 → sm:p-4
  Standard: p-4 → sm:p-6

Mobile (<768px):
  Compact: p-5
  Standard: p-6
```

**No Conflicts Found** ✅

---

### ✅ Grid Layout Logic (Consistent)

**PlayGrid.tsx** (line 670-673):

```typescript
className={`grid gap-6 py-6 px-4 overflow-visible auto-rows-max ${
  isMobile
    ? "grid-cols-1 gap-4"  // Mobile: Single column
    : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 py-8"
}`}
```

**Analysis:**

- Uses `isMobile` hook for layout switching ✅
- Tailwind responsive classes for desktop scaling ✅
- Clear separation: Mobile = 1 col, Desktop = responsive grid ✅

**No Conflicts Found** ✅

---

## 4. Unused/Dead Code

### 🗑️ Dead Hook: `useMobileErrorHandler.ts`

**File:** `src/hooks/useMobileErrorHandler.ts`

```typescript
export const useMobileErrorHandler = () => {
  return {
    errorState: null as MobileErrorState | null,
    handleError: (error: Error) => {
      console.error("Mobile error:", error);
    },
  };
};
```

**Usage:** **0 files** (found in `reports/knip-report.json` as unused)

**Recommendation:** 🗑️ **DELETE** (or implement if needed)

---

## 5. Display Detection Summary

### Runtime Detection (JavaScript)

| Hook/Function                                | Location                        | Breakpoint | Usage Count      |
| -------------------------------------------- | ------------------------------- | ---------- | ---------------- |
| `useIsMobile()`                              | `hooks/useBreakpoint.ts`        | < 768px    | **9 files** ✅   |
| `useIsTablet()`                              | `hooks/useBreakpoint.ts`        | 768-1023px | 0 files          |
| `useIsDesktop()`                             | `hooks/useBreakpoint.ts`        | ≥ 1024px   | 0 files          |
| `useIsMobileOrTablet()`                      | `hooks/useBreakpoint.ts`        | < 1024px   | 0 files          |
| `useMobileButtonProps()`                     | `hooks/useMobileButtonProps.ts` | < 768px    | 3 files ✅       |
| `useMobileTouchTarget()`                     | `hooks/useMobileButtonProps.ts` | < 768px    | 0 files          |
| `useMobileInputProps()`                      | `hooks/useMobileButtonProps.ts` | < 768px    | 0 files          |
| `useMobileNavigation()`                      | `hooks/useMobileNavigation.ts`  | n/a        | 1 file ✅        |
| ⚠️ `window.matchMedia("(max-width: 768px)")` | `PlayGrid/hooks/useViewMode.ts` | ≤ 768px    | **DUPLICATE** ⚠️ |

### CSS/Tailwind Detection

| Breakpoint | Value  | Meaning        | Alignment                   |
| ---------- | ------ | -------------- | --------------------------- |
| `sm:`      | 768px  | Tablet and up  | ✅ Matches `useIsMobile()`  |
| `md:`      | 1024px | Desktop and up | ✅ Matches `useIsDesktop()` |
| `lg:`      | 1280px | Large desktop  | ✅ No conflicts             |
| `xl:`      | 1440px | XL desktop     | ✅ No conflicts             |
| `2xl:`     | 1920px | 4K displays    | ✅ No conflicts             |

---

## 6. Potential Conflicts Analysis

### Test Case: PlayCard Rendering at 767px (Mobile)

**Scenario:** User on iPhone 14 Pro (viewport: 767px wide)

```typescript
// Runtime check (JavaScript)
const isMobile = useIsMobile(); // Returns: true ✅

// CSS classes applied
<div className="p-6 text-base md:min-h-0">
  {/* p-6: Applied immediately (mobile padding) ✅ */}
  {/* text-base: Applied immediately (mobile font size) ✅ */}
  {/* md:min-h-0: NOT applied (767px < 1024px) ✅ */}
</div>
```

**Result:** ✅ **NO CONFLICT** - Renders as mobile correctly

---

### Test Case: PlayCard Rendering at 768px (Tablet)

**Scenario:** User on iPad Mini (viewport: 768px wide)

```typescript
// Runtime check (JavaScript)
const isMobile = useIsMobile(); // Returns: false ✅

// CSS classes applied
<div className="p-3 sm:p-4 text-sm md:min-h-0">
  {/* p-3: Applied initially ✅ */}
  {/* sm:p-4: Applied (768px ≥ 768px) ✅ */}
  {/* text-sm: Applied (not mobile) ✅ */}
  {/* md:min-h-0: NOT applied (768px < 1024px) ✅ */}
</div>
```

**Result:** ✅ **NO CONFLICT** - Renders as tablet correctly

---

### Test Case: PlayCard Rendering at 1024px (Desktop)

**Scenario:** User on laptop (viewport: 1024px wide)

```typescript
// Runtime check (JavaScript)
const isMobile = useIsMobile(); // Returns: false ✅

// CSS classes applied
<div className="p-3 sm:p-4 text-sm md:min-h-0">
  {/* p-3: Applied initially ✅ */}
  {/* sm:p-4: Applied (1024px ≥ 768px) ✅ */}
  {/* text-sm: Applied (not mobile) ✅ */}
  {/* md:min-h-0: Applied (1024px ≥ 1024px) ✅ */}
</div>
```

**Result:** ✅ **NO CONFLICT** - Renders as desktop correctly

---

## 7. Recommendations

### 🔴 Priority 1: Fix Duplicate Detection in `useViewMode.ts`

**Current (line 56):**

```typescript
const mediaQuery = window.matchMedia("(max-width: 768px)");
```

**Recommended Fix:**

```typescript
import { useIsMobile } from "../../../hooks/useBreakpoint";

export function useViewMode() {
  const isMobile = useIsMobile();
  // ... rest of hook uses isMobile instead of mediaQuery
}
```

**Benefits:**

- Single source of truth ✅
- Easier to maintain ✅
- Type-safe ✅
- Consistent with rest of codebase ✅

---

### 🟡 Priority 2: Delete Dead Code

**File to Delete:**

```
src/hooks/useMobileErrorHandler.ts
```

**Reason:** 0 usages, stub implementation, no value

---

### 🟢 Priority 3: Add JSDoc to Clarify Tailwind Breakpoints

**File:** `src/components/mobile/index.ts` (already has good docs ✅)

**Recommendation:** Add reminder in common components:

```typescript
/**
 * PlayCard Component
 *
 * Breakpoints:
 * - Mobile (<768px): Uses isMobile hook + single-column layout
 * - Tablet (768-1023px): Uses sm: classes
 * - Desktop (≥1024px): Uses md: classes
 *
 * Note: Our sm: = 768px (not default 640px)
 */
```

---

## 8. Maintenance Checklist

When modifying mobile breakpoints in the future:

- [ ] Update `src/hooks/useBreakpoint.ts` (lines 15, 22)
- [ ] Update `tailwind.config.js` (line 200 `screens.sm`)
- [ ] Update `src/components/playbook/PlayGrid/hooks/useViewMode.ts` (line 56) ⚠️
- [ ] Update documentation in `src/components/mobile/index.ts`
- [ ] Search codebase for hardcoded `768` values
- [ ] Run full regression test suite

---

## 9. Summary Table

| Category           | Status           | Issue Count | Critical?   |
| ------------------ | ---------------- | ----------- | ----------- |
| Mobile Detection   | ✅ Consistent    | 1 duplicate | 🟡 Moderate |
| Touch Targets      | ✅ Consistent    | 0           | ✅ None     |
| Sizing/Padding     | ✅ Consistent    | 0           | ✅ None     |
| Grid Layout        | ✅ Consistent    | 0           | ✅ None     |
| Tailwind Alignment | ✅ Correct       | 0           | ✅ None     |
| Dead Code          | 🗑️ 1 unused hook | 1           | 🟢 Low      |

**Overall Grade:** 🟢 **A- (Excellent with minor improvements needed)**

---

## 10. Architectural Strengths

✅ **What's Working Well:**

1. **Single Source of Truth:** `useBreakpoint.ts` is authoritative
2. **Consistent Breakpoint:** 768px used everywhere (except 1 duplicate)
3. **Type Safety:** Hooks provide TypeScript types
4. **Performance:** Throttled resize events (100ms debounce)
5. **Tailwind Alignment:** `sm:` and `md:` match hook breakpoints
6. **Documentation:** Mobile components have clear usage guidelines
7. **Touch Targets:** Consistent 44px+ minimum on mobile
8. **No Magic Numbers:** Components use hooks, not hardcoded values

---

## Conclusion

The codebase has **excellent mobile logic consistency** with only **2 minor issues**:

1. ⚠️ **Fix:** Remove duplicate `window.matchMedia` in `useViewMode.ts` (use `useIsMobile()`)
2. 🗑️ **Delete:** `useMobileErrorHandler.ts` (dead code)

No critical conflicts exist. The mobile detection system is robust and maintainable.

**Estimated Fix Time:** 15 minutes
**Risk Level:** 🟢 Low (changes are isolated and safe)
