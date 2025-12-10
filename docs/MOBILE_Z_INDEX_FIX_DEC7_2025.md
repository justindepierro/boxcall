# Mobile Z-Index Fixes - December 7, 2025

## Executive Summary

Fixed critical z-index conflicts in mobile components that caused UI layering issues. Mobile drawer and bottom navigation were using hardcoded `z-50` (value: 50) instead of design system tokens, causing them to appear under modal backdrops (z-index: 1040).

**Status**: ✅ FIXED

---

## Problems Identified

### 1. MobileDrawer Z-Index Too Low

**Issue**: MobileDrawer used `z-50` (50), appearing UNDER modal backdrops (1040)

**Location**: `src/components/mobile/core/MobileDrawer.tsx`

**Symptom**: Drawer slides in but modal backdrop covers it, making drawer unusable

**Root Cause**: Hardcoded Tailwind `z-50` = 50, while design system `z-modal-backdrop` = 1040

### 2. MobileBottomNavigation Z-Index Conflict

**Issue**: Bottom nav used `z-50` (50), could appear under modals in some scenarios

**Location**: `src/components/mobile/core/MobileBottomNavigation.tsx`

**Symptom**: Bottom nav occasionally hidden behind modal backdrops

**Root Cause**: Hardcoded `z-50` instead of semantic token

---

## Design System Z-Index Hierarchy

From `src/styles/design-tokens-unified.css`:

```css
--z-index-dropdown: 1000; /* Dropdowns */
--z-index-sticky: 1020; /* Sticky headers */
--z-index-fixed: 1030; /* Fixed UI elements (bottom nav) */
--z-index-modal-backdrop: 1040; /* Modal backdrops */
--z-index-modal: 1050; /* Modal content */
--z-index-popover: 1060; /* Popovers */
--z-index-tooltip: 1070; /* Tooltips (highest) */
```

**Correct Stacking Order**:

1. Page content (z-index: auto/0)
2. Dropdowns (1000)
3. Sticky headers (1020)
4. Fixed bottom nav (1030) ← **Bottom nav belongs here**
5. Modal backdrop (1040)
6. Modal content (1050) ← **Drawer belongs here**
7. Popovers (1060)
8. Tooltips (1070)

---

## Fixes Applied

### Fix 1: MobileDrawer → z-modal (1050)

**File**: `src/components/mobile/core/MobileDrawer.tsx`

**Change**:

**Change**: MobileDrawer wrapper now uses the semantic `z-modal` token instead of the hardcoded `z-50` value while keeping the same `fixed inset-0 md:hidden` layout classes.

**Rationale**: Drawer is modal-like UI that should appear above backdrops

**Result**: Drawer now properly appears above modal backdrops (1050 > 1040)

### Fix 2: MobileBottomNavigation → z-fixed (1030)

**File**: `src/components/mobile/core/MobileBottomNavigation.tsx`

**Change**:

**Change**: MobileBottomNavigation root uses the `z-fixed` semantic token instead of `z-50`, keeping the same `fixed bottom-0 left-0 right-0` positioning bundle.

**Rationale**: Bottom nav is fixed UI, should stay visible but not block modals

**Result**: Bottom nav appears above content (1030) but below modal backdrops (1040)

---

## Other Z-Index Issues Found (Not Fixed Yet)

These components still use hardcoded `z-50` instead of semantic tokens:

1. **CreateTeam.tsx** (line 732): Modal with `z-50`
   - Should use: `z-modal` (1050)

2. **TeamMemberInviteModal.tsx** (line 79): Modal with `z-50`
   - Should use: `z-modal` (1050)

3. **PlayerForm.tsx** (line 152): Modal with `z-50`
   - Should use: `z-modal` (1050)

4. **AnnouncementEditor.tsx** (line 185): Modal with `z-50`
   - Should use: `z-modal` (1050)

5. **RichTextEditor.tsx** (lines 532, 572, 623): Dropdowns with `z-50`
   - Should use: `z-dropdown` (1000) or `z-popover` (1060)

**Priority**: Medium - These work currently but should be refactored for consistency

---

## Verification Steps

### 1. TypeScript Compilation

```bash
npm run type-check
```

✅ **Result**: No errors

### 2. Visual Testing Checklist

**On Mobile Device**:

- [ ] Open playbook page
- [ ] Tap menu icon to open MobileDrawer
- [ ] Verify drawer slides in from side
- [ ] Verify drawer appears above all other content
- [ ] Open a modal (filters, settings, etc.)
- [ ] Verify modal backdrop appears OVER bottom nav (bottom nav dims)
- [ ] Verify modal content appears OVER backdrop
- [ ] Close modal
- [ ] Verify bottom nav returns to normal (solid background)
- [ ] Scroll page with bottom nav visible
- [ ] Verify bottom nav stays fixed at bottom

### 3. Z-Index Hierarchy Test

**Expected Behavior**:

1. **Normal state**: Content + Bottom Nav (z-fixed: 1030)
2. **Modal open**: Content → Bottom Nav → Backdrop (1040) → Modal (1050)
3. **Drawer open**: Content → Bottom Nav → Drawer Backdrop → Drawer (1050)

---

## Impact Assessment

### Before Fix

- **MobileDrawer**: Could appear under modals → Unusable
- **MobileBottomNavigation**: Could appear under modals → Navigation broken
- **User Experience**: Modal interactions broken on mobile

### After Fix

- **MobileDrawer**: Always appears above backdrops ✅
- **MobileBottomNavigation**: Properly dims behind modals ✅
- **User Experience**: Expected modal behavior ✅

---

## Related Files

**Modified**:

- `src/components/mobile/core/MobileDrawer.tsx`
- `src/components/mobile/core/MobileBottomNavigation.tsx`

**Reference**:

- `src/styles/design-tokens-unified.css` (z-index definitions)
- `tailwind.config.js` (z-index token mappings)
- `docs/DESIGN_SYSTEM_REFERENCE.md` (design system docs)

---

## Future Work

### Short Term

1. Audit remaining `z-50` hardcoded values
2. Refactor to use semantic tokens everywhere
3. Add ESLint rule to prevent hardcoded z-index values

### Long Term

1. Create z-index visual debugger tool
2. Document stacking contexts in design system
3. Add automated tests for z-index hierarchy

---

## Testing Notes

**Desktop**: No visual changes (mobile components hidden via `md:hidden`)

**Mobile**:

- Test on iOS Safari 16+
- Test on Android Chrome 110+
- Test on tablets (< 1024px width)
- Verify safe-area-inset handling on iPhone X+ models

---

## Commit Info

**Commit Message**:

```
fix(mobile): fix z-index hierarchy for drawer and bottom nav

- MobileDrawer: z-50 → z-modal (50 → 1050)
- MobileBottomNavigation: z-50 → z-fixed (50 → 1030)
- Fixes drawer appearing under modal backdrops
- Fixes bottom nav layering conflicts with modals
- Uses design system semantic tokens
```

**Files Changed**: 2
**Lines Changed**: 4 (2 per file)
**Breaking Changes**: None
**Testing Required**: Visual testing on mobile devices
