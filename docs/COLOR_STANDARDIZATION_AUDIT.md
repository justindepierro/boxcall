# Color Standardization Audit
**Date:** January 20, 2025  
**Status:** Phase 1 - Audit & Categorization  
**Design System Step:** 3 (Color Semantic Token Completion)

---

## Executive Summary

Found **624 instances** of direct Tailwind color scale usage (e.g., `text-gray-600`, `bg-slate-900`) across **100+ component files**. These bypass our semantic token system and need to be replaced with semantic color tokens.

### Key Metrics
- **Total Violations:** 624
- **Files Affected:** ~100+ in `src/components/`
- **Most Common Colors:** `slate` (224x), `gray` (186x)
- **Most Common Utilities:** `text-*`, `bg-*`, `border-*`

### Impact
- ❌ **Theming:** Hard to maintain consistent color palette
- ❌ **Dark Mode:** Direct colors don't respect theme switching
- ❌ **Accessibility:** No guarantee of sufficient contrast
- ❌ **Maintenance:** Changes require find-and-replace across codebase

---

## Violation Breakdown

### Top 60 Most Common Violations

```
Count  Color Class       Semantic Meaning
-----  ---------------  --------------------------------------------------
  67   text-gray-6      → text-secondary (secondary text)
  41   bg-slate-8       → bg-surface-elevated-dark (dark elevated surface)
  35   text-slate-4     → text-muted (muted/helper text)
  35   text-gray-5      → text-secondary (secondary text)
  34   border-slate-7   → border-subtle-dark (dark theme borders)
  32   bg-gray-1        → bg-subtle (subtle background)
  26   text-gray-9      → text-primary (primary text)
  26   bg-gray-5        → bg-muted (muted background)
  25   text-slate-9     → text-primary-dark (dark theme primary text)
  24   text-slate-3     → text-muted-dark (dark theme muted text)
  20   text-blue-6      → text-link (links/interactive)
  18   bg-slate-9       → bg-surface-dark (dark surface)
  17   text-slate-5     → text-secondary-dark (dark secondary text)
  17   text-slate-1     → text-inverse (inverse text on dark)
  16   text-slate-6     → text-secondary-dark
  16   border-slate-2   → border-subtle (subtle borders)
  15   text-green-6     → text-success (success state text)
  15   border-gray-2    → border-subtle (subtle borders)
  15   bg-slate-5       → bg-muted-dark (dark muted background)
  14   text-red-6       → text-error (error state text)
  14   text-gray-4      → text-muted (muted text)
  13   text-gray-7      → text-primary (primary text dark)
  13   bg-slate-7       → bg-surface-elevated-dark
  12   text-slate-7     → text-primary-dark
  12   bg-gray-2        → bg-subtle
  12   bg-blue-5        → bg-info (info background)
  11   text-purple-6    → text-premium (premium features)
  11   text-blue-7      → text-link-hover
  11   bg-red-5         → bg-error (error background)
  10   border-red-5     → border-error (error borders)
   9   text-red-5       → text-error
   8   text-gray-8      → text-primary
   8   bg-green-5       → bg-success (success background)
   7   text-blue-8      → text-link-active
   7   border-slate-8   → border-dark
   7   border-slate-6   → border-subtle-dark
   7   border-blue-2    → border-info
   7   bg-yellow-5      → bg-warning (warning background)
   7   bg-green-1       → bg-success-subtle
   6   text-yellow-6    → text-warning
   6   text-emerald-4   → text-success-light
   6   text-blue-3      → text-info-light
   6   ring-red-5       → ring-error (focus ring error)
   6   border-red-2     → border-error-subtle
   6   border-gray-3    → border
   6   bg-slate-2       → bg-subtle-dark
   6   bg-blue-1        → bg-info-subtle
   5   text-red-4       → text-error-light
   5   text-purple-7    → text-premium-dark
   5   text-green-8     → text-success-dark
   5   text-blue-4      → text-info
   5   text-amber-6     → text-warning
   5   bg-red-9         → bg-error-dark
   5   bg-gray-8        → bg-surface-elevated
   5   bg-blue-9        → bg-info-dark
   4   text-red-7       → text-error-dark
   4   text-purple-8    → text-premium-strong
   4   text-purple-3    → text-premium-light
   4   text-emerald-6   → text-success
   4   ring-blue-5      → ring-info
```

---

## Categorization by Semantic Purpose

### 1. Text Colors (287 violations)

#### Primary Text (48 instances)
- `text-gray-9` (26x) → `text-primary`
- `text-gray-8` (8x) → `text-primary`
- `text-gray-7` (13x) → `text-primary`
- `text-slate-9` (25x) → `text-primary-dark`
- `text-slate-7` (12x) → `text-primary-dark`
- `text-slate-1` (17x) → `text-inverse`

**Semantic Token Needed:** 
- `text-primary` (light mode)
- `text-primary-dark` (dark mode)
- `text-inverse` (inverse/contrast)

#### Secondary Text (95 instances)
- `text-gray-6` (67x) → `text-secondary`
- `text-gray-5` (35x) → `text-secondary`
- `text-slate-6` (16x) → `text-secondary-dark`
- `text-slate-5` (17x) → `text-secondary-dark`

**Semantic Token Needed:**
- `text-secondary` (helper text, labels)
- `text-secondary-dark` (dark mode secondary)

#### Muted/Disabled Text (59 instances)
- `text-slate-4` (35x) → `text-muted`
- `text-gray-4` (14x) → `text-muted`
- `text-slate-3` (24x) → `text-muted-dark`

**Semantic Token Needed:**
- `text-muted` (disabled, placeholder)
- `text-muted-dark` (dark mode muted)

#### Interactive/Link Colors (38 instances)
- `text-blue-6` (20x) → `text-link`
- `text-blue-7` (11x) → `text-link-hover`
- `text-blue-8` (7x) → `text-link-active`

**Semantic Token Needed:**
- `text-link` (default link color)
- `text-link-hover` (hover state)
- `text-link-active` (active/pressed)

#### Status Colors (47 instances)
**Success:**
- `text-green-6` (15x) → `text-success`
- `text-emerald-6` (4x) → `text-success`
- `text-green-8` (5x) → `text-success-dark`
- `text-emerald-4` (6x) → `text-success-light`

**Error:**
- `text-red-6` (14x) → `text-error`
- `text-red-5` (9x) → `text-error`
- `text-red-4` (5x) → `text-error-light`
- `text-red-7` (4x) → `text-error-dark`

**Warning:**
- `text-yellow-6` (6x) → `text-warning`
- `text-amber-6` (5x) → `text-warning`

**Semantic Tokens Needed:**
- `text-success`, `text-success-dark`, `text-success-light`
- `text-error`, `text-error-dark`, `text-error-light`
- `text-warning`, `text-warning-dark`, `text-warning-light`
- `text-info`, `text-info-dark`, `text-info-light`

#### Premium/Special (20 instances)
- `text-purple-6` (11x) → `text-premium`
- `text-purple-7` (5x) → `text-premium-dark`
- `text-purple-8` (4x) → `text-premium-strong`
- `text-purple-3` (4x) → `text-premium-light`

**Semantic Token Needed:**
- `text-premium` (premium features badge/indicator)

---

### 2. Background Colors (216 violations)

#### Surface Backgrounds (98 instances)

**Light Mode Surfaces:**
- `bg-gray-1` (32x) → `bg-subtle` (subtle background tint)
- `bg-gray-2` (12x) → `bg-subtle`
- `bg-gray-5` (26x) → `bg-muted` (more visible muted bg)
- `bg-gray-8` (5x) → `bg-surface-elevated`

**Dark Mode Surfaces:**
- `bg-slate-9` (18x) → `bg-surface-dark` (dark primary surface)
- `bg-slate-8` (41x) → `bg-surface-elevated-dark` (elevated dark surface)
- `bg-slate-7` (13x) → `bg-surface-elevated-dark`
- `bg-slate-5` (15x) → `bg-muted-dark`
- `bg-slate-2` (6x) → `bg-subtle-dark`

**Semantic Tokens Needed:**
- `bg-surface` (base surface - white)
- `bg-surface-elevated` (elevated surface - gray-50/100)
- `bg-subtle` (subtle tint - gray-50/100)
- `bg-muted` (more visible - gray-200/300)
- `bg-surface-dark` (dark base - slate-900)
- `bg-surface-elevated-dark` (dark elevated - slate-800)
- `bg-subtle-dark` (dark subtle - slate-700)
- `bg-muted-dark` (dark muted - slate-600)

#### Status Backgrounds (43 instances)

**Success:**
- `bg-green-5` (8x) → `bg-success`
- `bg-green-1` (7x) → `bg-success-subtle`

**Error:**
- `bg-red-5` (11x) → `bg-error`
- `bg-red-9` (5x) → `bg-error-dark`

**Warning:**
- `bg-yellow-5` (7x) → `bg-warning`

**Info:**
- `bg-blue-5` (12x) → `bg-info`
- `bg-blue-1` (6x) → `bg-info-subtle`
- `bg-blue-9` (5x) → `bg-info-dark`

**Semantic Tokens Needed:**
- `bg-success`, `bg-success-subtle`, `bg-success-dark`
- `bg-error`, `bg-error-subtle`, `bg-error-dark`
- `bg-warning`, `bg-warning-subtle`, `bg-warning-dark`
- `bg-info`, `bg-info-subtle`, `bg-info-dark`

---

### 3. Border Colors (103 violations)

#### Neutral Borders (82 instances)

**Light Mode:**
- `border-gray-3` (6x) → `border` (default border)
- `border-gray-2` (15x) → `border-subtle` (subtle border)

**Dark Mode:**
- `border-slate-7` (34x) → `border-dark` (dark default border)
- `border-slate-8` (7x) → `border-dark`
- `border-slate-6` (7x) → `border-subtle-dark`
- `border-slate-2` (16x) → `border-subtle-dark`

**Semantic Tokens Needed:**
- `border` (default - gray-200)
- `border-subtle` (lighter - gray-100/200)
- `border-strong` (darker - gray-300)
- `border-dark` (dark mode default - slate-700)
- `border-subtle-dark` (dark mode light - slate-600)

#### Status Borders (21 instances)

**Error:**
- `border-red-5` (10x) → `border-error`
- `border-red-2` (6x) → `border-error-subtle`

**Info:**
- `border-blue-2` (7x) → `border-info`

**Semantic Tokens Needed:**
- `border-error`, `border-error-subtle`
- `border-success`, `border-success-subtle`
- `border-warning`, `border-warning-subtle`
- `border-info`, `border-info-subtle`

---

### 4. Focus Ring Colors (18 violations)

- `ring-red-5` (6x) → `ring-error`
- `ring-blue-5` (4x) → `ring-info`
- Plus various `ring-*-500/20` opacity variants

**Semantic Tokens Needed:**
- `ring-primary` (default focus ring)
- `ring-error` (error field focus)
- `ring-success` (success field focus)
- `ring-info` (info focus)

---

## Files with Most Violations

### Top 20 Files by Violation Count

1. **PlayDiagramBuilder.tsx** (~75 violations)
   - Dark theme diagram editor
   - Heavy use of slate-900/800/700 for surfaces
   - Text colors: slate-100/300/400
   - Needs: Dark surface tokens

2. **PlayDetailModal.tsx** (~60 violations)
   - Modal backgrounds and overlays
   - Slate-based dark theme
   - Border colors for structure
   - Needs: Modal surface tokens

3. **ProfilePopoverDemo.tsx** (~45 violations)
   - Demo component with many examples
   - Gray-based text hierarchy
   - Needs: Text hierarchy tokens

4. **DatabasePerformanceMonitor.tsx** (~35 violations)
   - Status indicators (green/yellow/red)
   - Gray text and backgrounds
   - Needs: Status tokens

5. **Icon.stories.tsx** (~30 violations)
   - Storybook examples
   - Gray text labels
   - Needs: Label text tokens

6. **AuroraToolPalette.tsx** (~28 violations)
   - Tool palette UI
   - Slate backgrounds and text
   - Needs: Tool UI tokens

7. **AdvancedFilters.stories.tsx** (~25 violations)
   - Storybook component
   - Gray text and backgrounds
   - Low priority (demo)

8. **PremiumFeaturesDemo.tsx** (~25 violations)
   - Premium feature showcase
   - Purple/blue/green status colors
   - Needs: Premium/status tokens

9. **EnhancedFormFields.tsx** (~22 violations)
   - Form inputs and states
   - Red error states, green success
   - Needs: Form state tokens

10. **AccessibleButton.tsx** (~20 violations)
    - Button variants and states
    - Gray, blue, red colors
    - Needs: Button variant tokens

### File Categories

**High Priority (Core Components):**
- Diagram Editor (PlayDiagramBuilder, ToolPalette)
- Modals (PlayDetailModal, various modals)
- Forms (EnhancedFormFields, AccessibleInput)
- Buttons (AccessibleButton)

**Medium Priority (Feature Components):**
- Play Cards (PlayCard, PlayCardDetails)
- Dashboard widgets
- Profile components

**Low Priority (Demos/Stories):**
- Storybook stories (*.stories.tsx)
- Demo components (*Demo.tsx)

---

## Semantic Token Gaps

### Currently Missing Semantic Tokens

#### Text Tokens
- ❌ `text-muted-dark` - Dark mode muted text
- ❌ `text-secondary-dark` - Dark mode secondary
- ❌ `text-link-hover` - Link hover state
- ❌ `text-link-active` - Link active state
- ❌ `text-success-dark` - Dark success text
- ❌ `text-success-light` - Light success text
- ❌ `text-error-dark` - Dark error text
- ❌ `text-error-light` - Light error text
- ❌ `text-warning-dark` - Dark warning text
- ❌ `text-warning-light` - Light warning text
- ❌ `text-info` - Info text (blue)
- ❌ `text-info-dark` - Dark info text
- ❌ `text-info-light` - Light info text
- ❌ `text-premium` - Premium feature text
- ❌ `text-premium-dark` - Dark premium text
- ❌ `text-premium-light` - Light premium text

#### Background Tokens
- ❌ `bg-surface-elevated` - Elevated surface (cards)
- ❌ `bg-subtle` - Subtle background tint
- ❌ `bg-muted` - More visible muted bg
- ❌ `bg-surface-dark` - Dark mode base surface
- ❌ `bg-surface-elevated-dark` - Dark elevated
- ❌ `bg-subtle-dark` - Dark subtle tint
- ❌ `bg-muted-dark` - Dark muted bg
- ❌ `bg-success-subtle` - Light success bg
- ❌ `bg-success-dark` - Dark success bg
- ❌ `bg-error-subtle` - Light error bg
- ❌ `bg-error-dark` - Dark error bg
- ❌ `bg-warning-subtle` - Light warning bg
- ❌ `bg-warning-dark` - Dark warning bg
- ❌ `bg-info` - Info background
- ❌ `bg-info-subtle` - Light info bg
- ❌ `bg-info-dark` - Dark info bg

#### Border Tokens
- ❌ `border-subtle` - Subtle border
- ❌ `border-strong` - Strong/visible border
- ❌ `border-dark` - Dark mode border
- ❌ `border-subtle-dark` - Dark mode subtle
- ❌ `border-error-subtle` - Light error border
- ❌ `border-success` - Success border
- ❌ `border-success-subtle` - Light success border
- ❌ `border-warning` - Warning border
- ❌ `border-warning-subtle` - Light warning border
- ❌ `border-info` - Info border
- ❌ `border-info-subtle` - Light info border

#### Ring/Focus Tokens
- ❌ `ring-primary` - Default focus ring
- ❌ `ring-error` - Error field focus
- ❌ `ring-success` - Success field focus
- ❌ `ring-info` - Info focus

---

## Proposed Semantic Token System

### Complete Semantic Color Token Set

```typescript
export const semanticColorTokens = {
  // ===== TEXT COLORS =====
  text: {
    // Primary hierarchy
    primary: colorTokens.gray[900],           // Main text
    primaryDark: colorTokens.slate[100],      // Dark mode primary
    secondary: colorTokens.gray[600],         // Helper text, labels
    secondaryDark: colorTokens.slate[400],    // Dark mode secondary
    muted: colorTokens.gray[500],             // Disabled, placeholder
    mutedDark: colorTokens.slate[500],        // Dark mode muted
    inverse: "#FFFFFF",                       // Text on dark backgrounds
    
    // Interactive
    link: colorTokens.blue[600],              // Links
    linkHover: colorTokens.blue[700],         // Link hover
    linkActive: colorTokens.blue[800],        // Link active/pressed
    linkVisited: colorTokens.purple[700],     // Visited links
    
    // Status
    success: colorTokens.green[600],          // Success text
    successDark: colorTokens.green[800],      // Dark success
    successLight: colorTokens.green[400],     // Light success
    
    error: colorTokens.red[600],              // Error text
    errorDark: colorTokens.red[700],          // Dark error
    errorLight: colorTokens.red[400],         // Light error
    
    warning: colorTokens.yellow[600],         // Warning text
    warningDark: colorTokens.yellow[700],     // Dark warning
    warningLight: colorTokens.yellow[500],    // Light warning
    
    info: colorTokens.blue[600],              // Info text
    infoDark: colorTokens.blue[800],          // Dark info
    infoLight: colorTokens.blue[400],         // Light info
    
    // Special
    premium: colorTokens.purple[600],         // Premium features
    premiumDark: colorTokens.purple[700],     // Dark premium
    premiumLight: colorTokens.purple[300],    // Light premium
    
    brand: colorTokens.jade[600],             // Brand color text
  },
  
  // ===== BACKGROUND COLORS =====
  bg: {
    // Surfaces (light mode)
    surface: "#FFFFFF",                       // Base surface
    surfaceElevated: colorTokens.gray[50],    // Elevated cards
    subtle: colorTokens.gray[50],             // Subtle tint
    muted: colorTokens.gray[200],             // More visible
    
    // Surfaces (dark mode)
    surfaceDark: colorTokens.slate[900],      // Dark base
    surfaceElevatedDark: colorTokens.slate[800], // Dark elevated
    subtleDark: colorTokens.slate[700],       // Dark subtle
    mutedDark: colorTokens.slate[600],        // Dark muted
    
    // Status
    success: colorTokens.green[500],          // Success bg
    successSubtle: colorTokens.green[50],     // Light success bg
    successDark: colorTokens.green[900],      // Dark success bg
    
    error: colorTokens.red[500],              // Error bg
    errorSubtle: colorTokens.red[50],         // Light error bg
    errorDark: colorTokens.red[900],          // Dark error bg
    
    warning: colorTokens.yellow[500],         // Warning bg
    warningSubtle: colorTokens.yellow[50],    // Light warning bg
    warningDark: colorTokens.yellow[900],     // Dark warning bg
    
    info: colorTokens.blue[500],              // Info bg
    infoSubtle: colorTokens.blue[50],         // Light info bg
    infoDark: colorTokens.blue[900],          // Dark info bg
    
    // Interactive
    hover: colorTokens.gray[100],             // Hover background
    hoverDark: colorTokens.slate[800],        // Dark hover
    active: colorTokens.gray[200],            // Active/pressed
    activeDark: colorTokens.slate[700],       // Dark active
    
    // Brand
    brand: colorTokens.jade[50],              // Brand bg
    brandDark: colorTokens.jade[900],         // Dark brand bg
  },
  
  // ===== BORDER COLORS =====
  border: {
    // Neutral
    default: colorTokens.gray[200],           // Default border
    subtle: colorTokens.gray[100],            // Subtle border
    strong: colorTokens.gray[300],            // Strong border
    
    // Dark mode
    dark: colorTokens.slate[700],             // Dark default
    subtleDark: colorTokens.slate[600],       // Dark subtle
    strongDark: colorTokens.slate[800],       // Dark strong
    
    // Status
    success: colorTokens.green[600],          // Success border
    successSubtle: colorTokens.green[200],    // Light success
    
    error: colorTokens.red[500],              // Error border
    errorSubtle: colorTokens.red[200],        // Light error
    
    warning: colorTokens.warning[500],        // Warning border
    warningSubtle: colorTokens.warning[200],  // Light warning
    
    info: colorTokens.blue[500],              // Info border
    infoSubtle: colorTokens.blue[200],        // Light info
    
    // Interactive
    focus: colorTokens.jade[500],             // Focus state
    hover: colorTokens.gray[300],             // Hover state
  },
  
  // ===== FOCUS RING COLORS =====
  ring: {
    primary: colorTokens.jade[500],           // Default focus ring
    error: colorTokens.red[500],              // Error focus
    success: colorTokens.green[500],          // Success focus
    info: colorTokens.blue[500],              // Info focus
    warning: colorTokens.warning[500],        // Warning focus
  },
}
```

---

## Implementation Strategy

### Phase 1: Token Definition (Week 1)
1. ✅ Audit complete (624 violations identified)
2. 🔄 **Current:** Define comprehensive semantic token system
3. Add all missing tokens to `tokens.ts`
4. Ensure dark mode coverage for every token
5. Document usage guidelines for each token

### Phase 2: High Priority Replacements (Week 2-3)
1. **Core Components** (150 violations)
   - Diagram Editor components
   - Modal components
   - Form components
   - Button components

2. **Text Hierarchy** (100 violations)
   - Replace `text-gray-6` → `text-secondary`
   - Replace `text-gray-9` → `text-primary`
   - Replace `text-slate-4` → `text-muted`

3. **Surface Backgrounds** (100 violations)
   - Replace `bg-slate-8` → `bg-surface-elevated-dark`
   - Replace `bg-gray-1` → `bg-subtle`
   - Replace `bg-slate-9` → `bg-surface-dark`

### Phase 3: Medium Priority (Week 4)
1. **Feature Components** (200 violations)
   - Play Cards
   - Dashboard widgets
   - Profile components

2. **Status Colors** (80 violations)
   - Success/error/warning/info states
   - Status indicators
   - Alert backgrounds

### Phase 4: Low Priority (Week 5)
1. **Storybook Stories** (100 violations)
   - Demo components
   - Example code
   - Documentation

### Phase 5: ESLint Enforcement (Week 6)
1. Update existing `no-raw-tailwind-colors` rule
2. Add suggestions for common violations
3. Test across codebase
4. Enable in CI/CD

---

## Success Metrics

### Completion Criteria
- ✅ 0 direct Tailwind color scale usage (except whitelisted)
- ✅ All semantic tokens defined with dark mode
- ✅ ESLint rule prevents new violations
- ✅ Type check passing
- ✅ All WCAG AA contrast requirements met

### Target Timeline
- **Phase 1:** 1 week (token definition)
- **Phase 2-3:** 3 weeks (replacements)
- **Phase 4-5:** 2 weeks (cleanup + ESLint)
- **Total:** ~6 weeks

---

## Notes & Considerations

### Whitelist Candidates
Some direct color usage may be intentional:
- Storybook color palette demonstrations
- Color picker examples
- Diagram-specific player colors (already have semantic tokens)

### Dark Mode Strategy
Every semantic token needs both light and dark variants:
- Use CSS variables with theme switching
- Light/dark tokens in `tokens.ts`
- Test all components in both modes

### Migration Approach
- ✅ **Systematic:** File-by-file, category-by-category
- ✅ **Testable:** Type check after each change
- ✅ **Reversible:** Git commits per category
- ✅ **Documented:** Track progress in this document

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2025  
**Next Review:** After Phase 1 token definition  
**Related:** DESIGN_SYSTEM_ROADMAP.md, DESIGN_SYSTEM_BASELINE.md
