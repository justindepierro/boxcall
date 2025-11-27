# Comprehensive Code Audit - November 27, 2024

## 🔍 AUDIT FINDINGS

### ❌ ISSUE 1: Legacy Diagram/Drawing Code Still Present

**Files with diagram/canvas references:**

1. **`src/services/PlayerManager.ts`** - ENTIRE FILE UNUSED
   - Canvas abstraction layer (IDiagramCanvas interface)
   - Player management for diagram editor
   - **Action**: DELETE entire file

2. **`src/pages/FormationMapperPage.tsx`** - Line 15, 1038
   - Imports `FormationBuilderModal` (deleted component)
   - Uses `<FormationBuilderModal>` component
   - **Action**: Remove import + remove modal usage OR delete entire page

3. **`src/hooks/playbook/usePlaybookModals.ts`** - Lines 16, 37, 48, 66, 83, 100, 114
   - `showFormationBuilderModal` state
   - `openFormationBuilderModal` / `closeFormationBuilderModal` functions
   - **Action**: Remove all FormationBuilder modal state/functions

4. **`src/components/playbook/QuickPlaySheet.tsx`** - Lines 27, 45, 245
   - `onOpenFormationBuilder` prop
   - Calls `onOpenFormationBuilder()`
   - **Action**: Remove prop and button handler

5. **`src/components/FABPresets.ts`** - Line 51
   - `diagramEditor` FAB preset config
   - **Action**: Remove diagramEditor preset

6. **`src/components/formations/FormationMatchingModal.tsx`** - Line 131
   - TODO comment about FormationBuilderModal
   - **Action**: Remove TODO comment

7. **`src/components/playbook/AddNewPlayModal.tsx`** - Line 589
   - TODO comment about DiagramEditor integration
   - **Action**: Remove TODO comment

8. **`src/types/formation.ts`** - Line 72
   - `formation_builder` source type
   - **Action**: Remove from type union

---

### ❌ ISSUE 2: Duplicate/Conflicting Style Definitions

**CRITICAL: Two sets of jade color tokens!**

#### Conflict: `design-tokens-unified.css` vs `generated-tokens.css`

**New (design-tokens-unified.css):**

```css
--color-jade-500: oklch(72% 0.18 156); /* #22c55e - primary brand */
```

**Old (generated-tokens.css):**

```css
--color-jade-500: #00a86b; /* DIFFERENT COLOR! */
```

**Problem**: `generated-tokens.css` is overriding our new design tokens!

**Files using RGB variants** (not defined in new tokens):

- `src/styles/animations.css` - Uses `--color-jade-500-rgb`
- `src/styles/animation-utilities.css` - Uses `--color-jade-500-rgb`
- `src/styles/component-utilities.css` - Uses `--color-jade-500-rgb`, `--color-jade-700-rgb`, etc.

**Action**:

1. Stop importing `generated-tokens.css` in `index.css`
2. Add RGB variants to `design-tokens-unified.css`
3. Update files using `-rgb` variants to use new token format

---

### ❌ ISSUE 3: Legacy Tailwind Theme Plugins Still Loaded

**File:** `tailwind.config.js`

Currently imports (but we removed from config):

```js
import auroraTheme from "./src/styles/tailwind/auroraTheme.js";
import boxcallTheme from "./src/styles/tailwind/boxcallTheme.js";
import layoutTokens from "./src/styles/tailwind/layoutTokens.js";
```

**But we removed them from plugins array!**

**Files in `/src/styles/tailwind/`:**

- `auroraTheme.js` - Legacy theme plugin (unused)
- `boxcallTheme.js` - Legacy theme plugin (unused)
- `layoutTokens.js` - Legacy token plugin (unused)

**Action**:

1. Remove import statements from `tailwind.config.js`
2. DELETE all 3 files in `src/styles/tailwind/` directory
3. DELETE entire `src/styles/tailwind/` directory

---

### ❌ ISSUE 4: Conflicting CSS Import Order in index.css

**File:** `src/index.css`

**Current order:**

```css
/* DESIGN TOKENS - Single source of truth (LiteWork pattern) */
@import "./styles/design-tokens-unified.css";
@import "./styles/utilities.css";

/* Import centralized design tokens first */ /* ← DUPLICATE COMMENT! */
@import "./styles/mobile.css";
@import "./styles/mobile-typography.css";
@import "./styles/fonts.css";
@import "./styles/generated-tokens.css"; /* ← OVERRIDES NEW TOKENS! */
@import "./styles/layout-utilities.css";
/* ... many more imports ... */
```

**Problems:**

1. `generated-tokens.css` overrides `design-tokens-unified.css` values
2. Duplicate "design tokens first" comments
3. Too many CSS imports (22 files!) - potential specificity conflicts
4. No clear organization

**Files imported (22 total):**

1. design-tokens-unified.css (NEW)
2. utilities.css (NEW)
3. mobile.css
4. mobile-typography.css
5. fonts.css
6. generated-tokens.css (CONFLICT!)
7. layout-utilities.css
8. grid-flex-patterns.css
9. density.css
10. panels.css
11. page-layout.css
12. responsive-dashboard.css
13. team-dashboard.css
14. overflow-prevention.css
15. animations.css
16. transitions.css
17. animation-utilities.css
18. typography-utilities.css
19. component-utilities.css
20. prosemirror-view/style/prosemirror.css

**Action**: Reorganize imports by priority/purpose

---

## 🎯 CLEANUP PLAN

### Phase 1: Remove Diagram/Drawing Code (HIGH PRIORITY)

```bash
# DELETE files
rm src/services/PlayerManager.ts
rm -rf src/styles/tailwind/  # Remove entire directory

# EDIT files to remove references
# 1. src/pages/FormationMapperPage.tsx - Remove FormationBuilderModal
# 2. src/hooks/playbook/usePlaybookModals.ts - Remove all FormationBuilder state
# 3. src/components/playbook/QuickPlaySheet.tsx - Remove onOpenFormationBuilder
# 4. src/components/FABPresets.ts - Remove diagramEditor preset
# 5. src/components/formations/FormationMatchingModal.tsx - Remove TODO
# 6. src/components/playbook/AddNewPlayModal.tsx - Remove TODO
# 7. src/types/formation.ts - Remove formation_builder type
```

### Phase 2: Fix Style Conflicts (CRITICAL PRIORITY)

**Step 1: Add RGB variants to design-tokens-unified.css**

Add after each color scale:

```css
/* Jade RGB variants for alpha transparency */
--color-jade-500-rgb: 34 197 94;
--color-jade-600-rgb: 22 163 74;
--color-jade-700-rgb: 21 128 61;
/* etc */
```

**Step 2: Remove generated-tokens.css import from index.css**

Remove this line:

```css
@import "./styles/generated-tokens.css"; /* DELETE THIS */
```

**Step 3: Clean up Tailwind config imports**

Remove unused imports:

```js
// DELETE THESE LINES
import auroraTheme from "./src/styles/tailwind/auroraTheme.js";
import boxcallTheme from "./src/styles/tailwind/boxcallTheme.js";
import layoutTokens from "./src/styles/tailwind/layoutTokens.js";
```

### Phase 3: Reorganize index.css Import Order

**New organized structure:**

```css
/* ==========================================
   DESIGN SYSTEM FOUNDATION (LiteWork Pattern)
   Single source of truth for all design tokens
   ========================================== */
@import "./styles/design-tokens-unified.css";
@import "./styles/utilities.css";

/* ==========================================
   TYPOGRAPHY & FONTS
   ========================================== */
@import "./styles/fonts.css";
@import "./styles/mobile-typography.css";
@import "./styles/typography-utilities.css";

/* ==========================================
   LAYOUT & SPACING
   ========================================== */
@import "./styles/layout-utilities.css";
@import "./styles/grid-flex-patterns.css";
@import "./styles/density.css";
@import "./styles/page-layout.css";
@import "./styles/responsive-dashboard.css";
@import "./styles/team-dashboard.css";
@import "./styles/overflow-prevention.css";

/* ==========================================
   COMPONENTS & UI
   ========================================== */
@import "./styles/component-utilities.css";
@import "./styles/panels.css";
@import "./styles/mobile.css";

/* ==========================================
   ANIMATIONS & TRANSITIONS
   ========================================== */
@import "./styles/animations.css";
@import "./styles/transitions.css";
@import "./styles/animation-utilities.css";

/* ==========================================
   THIRD-PARTY LIBRARIES
   ========================================== */
@import "prosemirror-view/style/prosemirror.css";

/* ==========================================
   TAILWIND BASE
   ========================================== */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================
   GLOBAL APP STYLES
   ========================================== */
:root {
  font-size: 87.5%; /* 14px base instead of 16px */
}

@media (max-width: 640px) {
  :root {
    font-size: 100%; /* 16px for better mobile readability */
  }
}
```

---

## 📋 DETAILED CLEANUP CHECKLIST

### Files to DELETE (5 total)

- [ ] `src/services/PlayerManager.ts`
- [ ] `src/styles/tailwind/auroraTheme.js`
- [ ] `src/styles/tailwind/boxcallTheme.js`
- [ ] `src/styles/tailwind/layoutTokens.js`
- [ ] `src/styles/tailwind/` (entire directory after deleting contents)

### Files to EDIT (11 total)

#### 1. `src/pages/FormationMapperPage.tsx`

- [ ] Remove line 15: `import { FormationBuilderModal } from "...";`
- [ ] Remove line 1038: `<FormationBuilderModal ... />` component
- [ ] Remove related state variables for FormationBuilder

#### 2. `src/hooks/playbook/usePlaybookModals.ts`

- [ ] Remove `showFormationBuilderModal` state (line 66)
- [ ] Remove `openFormationBuilderModal` function (line 100)
- [ ] Remove `closeFormationBuilderModal` function (line 114)
- [ ] Remove from return object (lines 16, 37, 48, 83)

#### 3. `src/components/playbook/QuickPlaySheet.tsx`

- [ ] Remove `onOpenFormationBuilder` prop (line 27)
- [ ] Remove prop destructuring (line 45)
- [ ] Remove button handler calling `onOpenFormationBuilder()` (line 245)

#### 4. `src/components/FABPresets.ts`

- [ ] Remove `diagramEditor` preset config (line 51+)

#### 5. `src/components/formations/FormationMatchingModal.tsx`

- [ ] Remove TODO comment about FormationBuilderModal (line 131)

#### 6. `src/components/playbook/AddNewPlayModal.tsx`

- [ ] Remove TODO comment about DiagramEditor (line 589)

#### 7. `src/types/formation.ts`

- [ ] Remove `"formation_builder"` from source type union (line 72)

#### 8. `src/styles/design-tokens-unified.css`

- [ ] Add RGB variants for all color scales (jade, navy, accent colors)

#### 9. `src/index.css`

- [ ] Remove `@import "./styles/generated-tokens.css";`
- [ ] Reorganize all imports by category
- [ ] Add clear section comments

#### 10. `tailwind.config.js`

- [ ] Remove 3 unused import statements (auroraTheme, boxcallTheme, layoutTokens)

#### 11. `src/styles/component-utilities.css`

- [ ] Update RGB references to use new format if needed

---

## 🚨 RISK ASSESSMENT

### HIGH RISK (Breaking Changes)

1. **Removing generated-tokens.css** - May break components using old token values
   - Mitigation: Search for all usages first, update to new tokens
2. **Deleting PlayerManager.ts** - May be imported somewhere
   - Mitigation: Grep search for imports before deleting

3. **Removing FormationBuilder modal** - FormationMapperPage may be in use
   - Mitigation: Check if FormationMapperPage is linked in navigation

### MEDIUM RISK (Potential Issues)

1. **RGB variant changes** - Components using `--color-jade-500-rgb` format
   - Mitigation: Add RGB variants to new token file

2. **CSS import order changes** - May affect specificity
   - Mitigation: Test thoroughly after reordering

### LOW RISK (Safe Changes)

1. **Removing TODO comments** - No functional impact
2. **Deleting unused Tailwind plugins** - Already removed from config
3. **Removing unused FAB presets** - No runtime impact

---

## 🎯 RECOMMENDED EXECUTION ORDER

### Step 1: Safe Deletions (Do First)

1. Delete `src/styles/tailwind/` directory
2. Remove unused imports from `tailwind.config.js`
3. Remove TODO comments

### Step 2: Style Fixes (Critical)

1. Add RGB variants to `design-tokens-unified.css`
2. Remove `generated-tokens.css` import from `index.css`
3. Reorganize `index.css` imports

### Step 3: Code Cleanup (Careful)

1. Search for `PlayerManager` imports
2. If none found, delete `src/services/PlayerManager.ts`
3. Remove FormationBuilder references from hooks/components
4. Remove formation_builder type

### Step 4: Verify & Test

1. Run `npm run type-check`
2. Run `npm run lint`
3. Check dev server for errors
4. Test button styles in UI
5. Test play card expansion
6. Verify image upload still works

---

## 📊 IMPACT SUMMARY

**Files to Delete:** 5
**Files to Edit:** 11
**Lines to Remove:** ~150
**Estimated Time:** 30-45 minutes
**Risk Level:** Medium (due to token conflicts)

**Benefits:**

- ✅ Remove ALL diagram/drawing code
- ✅ Eliminate style conflicts
- ✅ Clean design token system
- ✅ Faster CSS loading (fewer imports)
- ✅ Better maintainability

---

## ✅ SUCCESS CRITERIA

After cleanup, these should all pass:

1. [ ] No references to "pixi", "canvas", "DiagramEditor", "FormationBuilder"
2. [ ] No `--color-jade-500-rgb` undefined errors
3. [ ] `npm run type-check` passes
4. [ ] `npm run lint` passes
5. [ ] Dev server runs without errors
6. [ ] Button styles use new design tokens
7. [ ] Image upload works in PlayCard and AddNewPlayModal
8. [ ] No console warnings about undefined CSS variables
9. [ ] All color values consistent (no old jade green #00a86b)
10. [ ] CSS import order logical and documented

---

## 🔧 NEXT STEPS

**Ready to execute cleanup?** I can:

1. **Delete files** (5 files)
2. **Clean up code** (11 files with diagram references)
3. **Fix style conflicts** (add RGB variants, remove generated-tokens)
4. **Reorganize index.css** (better import order)
5. **Run verification** (type-check, lint, dev server test)

**Shall I proceed with the cleanup?**
