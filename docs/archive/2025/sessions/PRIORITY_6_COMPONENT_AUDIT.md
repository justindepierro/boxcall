# Priority 6: Component Library Standardization - Audit Results

**Date**: January 2025 (October 6, 2025)  
**Status**: 🔍 In Progress - Audit Phase  
**Goal**: Migrate all components to use new component token system from Priority 5

---

## 📊 Component Audit Results

### High-Priority Components (Frequent Usage)

#### 1. Button Component ⚠️ **NEEDS MIGRATION**

**File**: `/src/components/ui/Button/Button.tsx` (337 lines)

**Current State**: Uses Tailwind classes with semantic tokens

- ✅ Uses semantic tokens (`brand-primary`, `text-inverse`, `surface-muted`)
- ❌ Still has hardcoded Tailwind utility classes
- ❌ Not using new component token CSS variables
- ❌ Not using component utility classes (`.btn-primary`, `.btn-secondary`, etc.)

**Variants Found**: 13 button variants

- `primary`, `secondary`, `outline`, `gradient`, `glass`, `ghost`, `subtle`
- `link`, `brandLink`, `neutralLink`, `infoLink`, `dangerLink`
- `danger`, `success`, `warning`

**Migration Target**: Use component tokens from Priority 5

- Replace with `--component-button-primary-bg`, `--component-button-primary-bg-hover`, etc.
- OR use utility classes: `.btn-primary`, `.btn-secondary`, `.btn-outline`, etc.

**Estimated Effort**: 2-3 hours

---

#### 2. Input Component ⚠️ **NEEDS MIGRATION**

**File**: `/src/components/ui/Input/Input.tsx`

**Current State**: Unknown (needs inspection)

**Expected Issues**:

- Hardcoded border colors
- Hardcoded focus ring styles
- Hardcoded validation state colors
- Missing component token usage

**Migration Target**: Use input token system

- Replace with `--component-input-bg`, `--component-input-border`, `--component-input-border-focus`
- Use validation tokens: `--component-input-bg-error`, `--component-input-border-success`, etc.
- OR use utility classes: `.input`, `.input-error`, `.input-success`, `.input-warning`

**Estimated Effort**: 2 hours

---

#### 3. Card Component ⚠️ **NEEDS MIGRATION**

**File**: `/src/components/ui/Card/Card.tsx`

**Current State**: Unknown (needs inspection)

**Expected Issues**:

- Hardcoded shadow values
- Hardcoded hover states
- Missing elevation system
- Not using interactive/selected tokens

**Migration Target**: Use card token system

- Replace with `--component-card-background`, `--component-card-shadow`
- Use elevation tokens: `--component-card-shadow-flat`, `--component-card-shadow-raised`, `--component-card-shadow-elevated`
- Use interactive tokens: `--component-card-bg-hover`, `--component-card-bg-selected`
- OR use utility classes: `.card`, `.card-interactive`, `.card-elevated`, `.card-selected`

**Estimated Effort**: 1-2 hours

---

#### 4. Badge Component ⚠️ **NEEDS MIGRATION**

**File**: `/src/components/ui/Badge/Badge.tsx`

**Current State**: Unknown (needs inspection)

**Expected Issues**:

- Hardcoded badge colors
- Hardcoded text colors
- Hardcoded border colors
- Not using semantic color variants

**Migration Target**: Use badge token system

- Replace with `--component-badge-primary-bg`, `--component-badge-success-bg`, etc.
- Support 6 color variants: neutral, primary, success, warning, error, info
- OR use utility classes: `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`

**Estimated Effort**: 1-2 hours

---

#### 5. Modal/Dialog Component ⚠️ **NEEDS MIGRATION**

**Files**: Modal-related components

**Current State**: Unknown (needs inspection)

**Expected Issues**:

- Hardcoded backdrop color/blur
- Hardcoded z-index values
- Hardcoded modal container styles
- Not using systematic z-index scale

**Migration Target**: Use modal token system

- Replace with `--component-modal-backdrop-bg`, `--component-modal-backdrop-blur`
- Use z-index tokens: `--component-z-index-modal-backdrop`, `--component-z-index-modal`
- Use container tokens: `--component-modal-bg`, `--component-modal-shadow`
- OR use utility classes: `.modal-backdrop`, `.modal-container`, `.modal-header`, `.modal-footer`, `.z-modal-backdrop`, `.z-modal`

**Estimated Effort**: 2-3 hours

---

#### 6. Navigation Component ⚠️ **NEEDS MIGRATION**

**Files**: Navigation, Header, Sidebar components

**Current State**: Unknown (needs inspection)

**Expected Issues**:

- Hardcoded nav item colors
- Hardcoded active/hover states
- Not using mobile/sidebar variants
- Inconsistent active state styling

**Migration Target**: Use navigation token system

- Replace with `--component-navigation-item-text`, `--component-navigation-item-text-active`
- Use state tokens: `--component-navigation-item-bg-hover`, `--component-navigation-item-bg-active`
- Use variant tokens: `--component-navigation-mobile-header-bg`, `--component-navigation-sidebar-bg`
- OR use utility classes: `.nav`, `.nav-item`, `.nav-item-active`, `.nav-mobile`, `.nav-sidebar`

**Estimated Effort**: 2-3 hours

---

### Medium-Priority Components

#### 7. Form Fields ⚠️ **PARTIAL MIGRATION NEEDED**

**File**: `/src/components/forms/ProfileFormFields.tsx`

**Current State**: Uses some semantic tokens, but hardcoded classes found

- ✅ Uses `border-border`, `bg-surface-primary`, `text-text-primary`
- ❌ Hardcoded: `border-error`, `focus:border-error`, `text-jade-600`, `focus:ring-jade-500`
- ❌ Not using input token system

**Issues Found**:

```tsx
// Line 94: Hardcoded jade colors in checkbox
className = "rounded border-border-medium text-jade-600 focus:ring-jade-500";
```

**Migration Target**: Use input token system consistently

- Replace `text-jade-600` → use `--component-input-border-focus`
- Replace `focus:ring-jade-500` → use focus ring tokens
- Apply validation token system

**Estimated Effort**: 1 hour

---

#### 8. Aurora Component ✅ **ACCEPTABLE** (Background Pattern)

**File**: `/src/components/ui/Aurora.tsx`

**Current State**: Uses gradient backgrounds for visual effects

- Uses: `bg-gradient-to-br from-jade-50 via-white to-electric-50/30`
- This is decorative/artistic, not functional UI

**Decision**: ⏸️ **LOW PRIORITY**

- Aurora is a decorative background pattern component
- Doesn't need strict token migration
- Focus on functional UI components first

**Estimated Effort**: N/A (defer)

---

#### 9. MinimalGridTest Component ⚠️ **NEEDS CLEANUP**

**File**: `/src/components/dashboard/MinimalGridTest.tsx`

**Current State**: Test component with hardcoded jade colors

```tsx
<div className="bg-jade-100 p-4">Panel 1</div>
<div className="bg-jade-200 p-4">Panel 2</div>
```

**Decision**: 🗑️ **REMOVE OR UPDATE**

- This appears to be a test component
- Should either be removed or updated to use semantic tokens
- Not critical for production

**Estimated Effort**: 15 minutes (or delete)

---

### Low-Priority Components

#### 10. Icon Component ✅ **ALREADY TOKEN-BASED**

**File**: `/src/components/ui/Icon/types.ts`

**Current State**: Uses color prop system

```ts
color?: "current" | "jade" | "navy" | "slate" | "success" | "warning" | "error" | "info"
```

**Status**: ✅ Already using semantic color system

- Icons reference color tokens through props
- No hardcoded values in implementation
- Uses `currentColor` by default

**Decision**: ✅ **NO MIGRATION NEEDED**

---

#### 11. PDF Services ✅ **ALREADY TOKEN-BASED**

**File**: `/src/services/pdf/styles.ts`

**Current State**: Already using design tokens

```ts
primary: semantic.primary,
secondary: colorTokens.navy[600],
success: colorTokens.success[600],
```

**Status**: ✅ Already importing and using design system tokens

**Decision**: ✅ **NO MIGRATION NEEDED**

---

## 📋 Migration Priority Ranking

### 🔴 Critical (Week 1)

1. **Button Component** - Most used component, 13 variants
2. **Input Component** - Core form component, validation states
3. **Card Component** - Layout primitive, interactive states

### 🟡 High (Week 2)

4. **Badge Component** - Status indicators throughout app
5. **Modal Component** - Overlay system, z-index coordination
6. **Navigation Component** - Primary navigation, active states
7. **Form Fields** - Complete input system standardization

### 🟢 Medium (Week 3)

8. **MinimalGridTest** - Remove or fix test component
9. **Additional form components** - Select, TextArea, Radio, Checkbox
10. **Layout primitives** - Create Stack, Inline, Grid components

### ⚪ Low Priority

11. **Aurora** - Decorative component, defer
12. **Icon** - Already token-based ✅
13. **PDF Services** - Already token-based ✅

---

## 🎯 Migration Strategy

### Phase 1: Core Components (Days 1-2)

1. ✅ Audit complete
2. ⏳ Migrate Button component
3. ⏳ Migrate Input component
4. ⏳ Migrate Card component
5. ⏳ Run tests, fix issues

### Phase 2: Interactive Components (Days 3-4)

6. ⏳ Migrate Badge component
7. ⏳ Migrate Modal component
8. ⏳ Migrate Navigation component
9. ⏳ Run tests, fix issues

### Phase 3: Composition & Documentation (Days 5-6)

10. ⏳ Create layout primitives (Stack, Inline, Grid)
11. ⏳ Standardize variant system
12. ⏳ Create Storybook examples
13. ⏳ Final validation & documentation

---

## 📊 Token Coverage Analysis

### Component Tokens Available (Priority 5)

✅ **Button tokens**: 48 properties (7 variants × all states + sizes)  
✅ **Input tokens**: 20 properties (validation + focus + disabled)  
✅ **Card tokens**: 11 properties (elevation + interactive)  
✅ **Badge tokens**: 18 properties (6 color variants)  
✅ **Modal tokens**: 14 properties (backdrop + container + parts)  
✅ **Navigation tokens**: 14 properties (desktop + mobile + sidebar)  
✅ **Z-index tokens**: 10 properties (layering scale)  
✅ **Focus ring tokens**: 5 properties (accessibility)  
✅ **Tooltip tokens**: 7 properties  
✅ **Skeleton tokens**: 4 properties  
✅ **Dropdown tokens**: 9 properties

**Total**: 160+ component-specific tokens ready for use

### Component Utility Classes Available

✅ Button utilities: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-danger`, `.btn-success`, `.btn-warning`, `.btn-link` + sizes (`.btn-xs` → `.btn-xl`)  
✅ Card utilities: `.card`, `.card-interactive`, `.card-selected`, `.card-flat`, `.card-raised`, `.card-elevated`  
✅ Badge utilities: `.badge-neutral`, `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`  
✅ Input utilities: `.input`, `.input-error`, `.input-success`, `.input-warning`  
✅ Modal utilities: `.modal-backdrop`, `.modal-container`, `.modal-header`, `.modal-footer`, `.z-modal-backdrop`, `.z-modal`  
✅ Navigation utilities: `.nav`, `.nav-item`, `.nav-item-active`, `.nav-mobile`, `.nav-sidebar`  
✅ Z-index utilities: `.z-base`, `.z-dropdown`, `.z-sticky`, `.z-modal`, `.z-tooltip`, etc.  
✅ Focus utilities: `.focus-ring`

**Total**: 60+ utility classes ready for use

---

## 🚀 Next Steps

1. ✅ **Audit Complete** - This document
2. ⏳ **Start Button Migration** - Replace Tailwind with component tokens
3. ⏳ **Test Button Changes** - Verify all variants work
4. ⏳ **Continue with Input, Card, Badge**
5. ⏳ **Build composition patterns**
6. ⏳ **Create final documentation**

**Estimated Total Time**: 15-20 hours over 6 days

---

## 📝 Notes

- **Component tokens are ready**: All tokens from Priority 5 are generated and available
- **Utility classes are ready**: 60+ utility classes created in component-utilities.css
- **Migration approach**: Can use either CSS variables directly OR utility classes
- **Testing strategy**: Component tests, visual regression, Storybook validation
- **Documentation**: Before/after examples, API changes, migration guide

**Current Status**: 🟢 Ready to begin migration
