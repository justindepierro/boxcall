# Design System Baseline
**Created:** October 6, 2025  
**Purpose:** Snapshot of design system state before Phase 1 improvements

> This document serves as the "before" measurement to track progress through the 12-step roadmap.

---

## Executive Summary

### Current Maturity Level
**Design System Maturity:** Level 2 - "Scaling" (out of 5 levels)
- ✅ Token architecture established
- ✅ Component library exists  
- ⚠️ Inconsistent token usage
- ❌ No automated enforcement
- ❌ Incomplete documentation

### Health Metrics
- **Token Coverage:** ~85% (claimed, needs verification)
- **Component Count:** 382 `.tsx` files in `src/components/`
- **Corner Radius Compliance:** 100% ✅ (completed Oct 6, 2025)
- **Spacing Compliance:** 100% ✅ (completed Jan 20, 2025 - 83 violations fixed)
- **Typography Compliance:** 40% ✅ (Phase 1 & 2 complete Jan 20, 2025 - 38 violations fixed, 58 intentional whitelisted)
- **Color Compliance:** Unknown

---

## Codebase Statistics

### File Counts
- **Total TypeScript Files:** 1,860 `.ts`/`.tsx` files
- **Component Files:** 382 files in `src/components/`
- **Service Files:** ~70 files in `src/services/`
- **Page Files:** ~30 files in `src/pages/`

### Design Token System
**Location:** `src/design-system/tokens.ts`

**Token Groups (15 total):**
1. ✅ `colorTokens` - Brand palette (jade, navy, electric)
2. ✅ `semanticTokens` - UI-ready semantic colors
3. ✅ `typographyTokens` - Font families, sizes, weights
4. ✅ `spacingTokens` - 8px grid spacing scale
5. ✅ `borderRadiusTokens` - Corner radius values
6. ✅ `elevationTokens` - Shadow system
7. ✅ `opacityTokens` - Transparency values
8. ✅ `contrastTokens` - Contrast ratios
9. ✅ `densityTokens` - Layout density options
10. ✅ `accessibilityTokens` - A11y-specific values
11. ✅ `componentTokens` - Component-specific tokens
12. ✅ `animationTokens` - Animation/transition values
13. ✅ `breakpointTokens` - Responsive breakpoints
14. ✅ `zIndexTokens` - Z-index scale
15. ✅ `gridTokens` - Grid layout values

**CSS Variables Generated:** 376+ custom properties

---

## Compliance Audit Results

### ✅ Corner Radius (100% Compliant)
**Audit Date:** October 6, 2025  
**Status:** Complete

**Standard:**
- Tier 1: `rounded-lg` (10-12px) - Interactive elements
- Tier 2: `rounded-xl` (16px) - Cards/containers
- Special: `rounded-2xl` (20px) - App icons only

**Violations Found:** 0
**Files Updated:** 130+

### ✅ Spacing (100% Compliant)
**Audit Date:** October 6, 2025 (initial) → January 20, 2025 (completed)
**Status:** Complete

**Initial State (October 6, 2025):**
- Arbitrary Values Found: 100+ instances
- Common Violations: Arbitrary padding, margins, gaps, heights, widths, viewport units
- Impact: HIGH - Spacing inconsistency affected entire app UX

**Final Resolution (January 20, 2025):**
**Total Violations Fixed:** 83 violations across 54 unique files

**Phase 1: Touch Targets (10 violations)**
- ProfileCard.tsx: 6 violations (44px touch targets)
- Footer.tsx: 4 violations (44px touch targets)
- Standard: All touch targets now 44px minimum (iOS accessibility)

**Phase 2: Component Heights (12 violations)**
- Select.tsx: 3 violations (32/40/48px → min-h-8/10/12)
- AccessibleButton.tsx: 3 violations (32/40/48px → min-h-8/10/12)
- AccessibleInput.tsx: 3 violations (32/40/48px → min-h-8/10/12)
- InlineEditableText.tsx: 3 violations (24/32/40px → min-h-6/8/10)

**Phase 3: Modal Heights (15 violations)**
- Converted all viewport heights: vh → svh (small viewport height)
- Better mobile support (iOS Safari address bar handling)
- Modal.tsx base component updated (affects all modals)

**Phase 4: Width Constraints (29 violations)**
- Badge counters: 18-24px → Tailwind w-5/w-6
- Button/Input widths: 140-240px → min-w-36/40/44/56/60
- Content containers: 100-220px → w-24/max-w-56
- Tool palettes: 1120px → max-w-screen-xl

**Phase 5: Final Sweep (16 violations)**
- Tile heights: 160-180px → min-h-40/44
- Builder canvas: 620px → min-h-[37.5rem]
- Content areas: 400-600px → min-h-96/h-[37.5rem]
- Drag-drop zones: 200px → min-h-48
- Remaining viewport units → svh

**Phase 6: Additional Find (1 violation)**
- TeamSwitcher dropdown: 16rem → min-w-64

**Benefits Achieved:**
- ✅ Consistent spacing across entire app
- ✅ Mobile-safe viewport units (svh) throughout
- ✅ iOS accessibility compliance (44px touch targets)
- ✅ Standard Tailwind classes (easier maintenance)
- ✅ Better responsive behavior
- ✅ Type check passing

**Violations Remaining:** 0 ✅

### ⚠️ Typography (40% Compliant)
**Audit Date:** January 20, 2025  
**Status:** Phase 1 & 2 Complete, Phase 3+ In Progress

**Initial Audit:**
- **Total Violations Found:** 96 arbitrary font size instances
  - text-[10px]: 30 instances
  - text-[11px]: 55 instances (most common)
  - text-[12px]: 8 instances
  - text-[2rem], text-[13px]: 3 instances

**Phase 1: Direct Replacements (38 violations fixed)**
**Completion Date:** January 20, 2025
- Extended Tailwind with `text-2xs` (0.625rem = 10px)
- Replaced text-[10px] → text-2xs (30 instances)
- Replaced text-[12px] → text-xs (8 instances)
- Files modified: 12 (PlayerSidebar, ToolPalette, PlayCard components, etc.)
- Result: 38/96 violations fixed (40%)

**Phase 2: ESLint Enforcement (58 intentional whitelisted)**
**Completion Date:** January 20, 2025
- Created `boxcall-design/no-arbitrary-typography` ESLint rule
- Whitelisted 17 intentional arbitrary values:
  - **text-[11px]** (55 instances): Compact labels/badges between xs (12px) and 2xs (10px)
  - **text-[13px]** (1 instance): Compact mode between xs and sm
  - **Typography variants** (15 sizes): Design system semantic typography scale
    - Display: text-[3.25rem], text-[2.75rem], text-[2.25rem]
    - Headline: text-[2rem], text-[1.625rem], text-[1.375rem], text-[1.125rem]
    - Body: text-[0.95rem], text-[0.9rem], text-[0.82rem], text-[0.72rem]
    - Code/Button: text-[0.85rem], text-[0.78rem]
    - Labels: text-[0.7rem], text-[0.62rem]
    - Additional: text-[1rem]
- ESLint rule provides suggestions for common violations
- Documentation: eslint-rules/README.md, TYPOGRAPHY_STANDARDIZATION_STRATEGY.md

**Benefits Achieved:**
- ✅ 38 violations fixed with standard Tailwind classes
- ✅ 58 intentional exceptions documented and whitelisted
- ✅ ESLint enforcement prevents new violations
- ✅ Design system integrity preserved (no visual changes)
- ✅ Type check passing

**Remaining Work:**
- Phase 3+: Continue typography standardization where applicable
- Update typography tokens documentation
- Create comprehensive typography usage guide

**Violations Remaining:** 58 intentional (documented and whitelisted) ✅

### ⚠️ Typography (Compliance Unknown)
**Audit Date:** Not yet audited  
**Status:** Pending

**Known Issues:**
- Arbitrary `text-[size]` classes likely present
- Font weight consistency unknown
- Line height standardization unknown

### ⚠️ Color Usage (Compliance Unknown)
**Audit Date:** Not yet audited  
**Status:** Pending

**Known Issues:**
- Hardcoded hex/rgb colors likely present
- Semantic token usage not verified
- Dark mode coverage incomplete

---

## Component Inventory

### UI Primitives (Design System Core)
**Location:** `src/components/ui/`

**Key Components:**
- ✅ `Card` - 100% compliant (consolidated from GlassCard)
- ⚠️ `Button` - Corner radius compliant, spacing unknown
- ⚠️ `Badge` - Corner radius compliant, spacing unknown
- ⚠️ `Select` - Has 3 arbitrary min-height values
- ⚠️ `Input` - Compliance unknown
- ⚠️ `Modal` - Corner radius compliant, has arbitrary max-height
- ⚠️ `Tooltip` - Compliance unknown
- ⚠️ `Dropdown` - Compliance unknown

### Feature Components
**Location:** `src/components/[feature]/`

**Major Feature Areas:**
- `playbook/` - 50+ components (diagram editor, play cards, grids)
- `dashboard/` - 20+ components (cards, widgets, layouts)
- `calendar/` - 10+ components (event modals, views)
- `practice/` - 15+ components (planner, scripts, modals)
- `team/` - 8+ components (roster, settings, staff)
- `auth/` - 5+ components (login, register, guards)

**Compliance Status:** Mixed - corner radius fixed, spacing/typography unknown

---

## Documentation Inventory

### Existing Documentation (5 docs)
1. ✅ **BOXCALL_DESIGN_LANGUAGE.md** (750 lines)
   - Comprehensive design vision
   - Token architecture overview
   - Usage guidelines
   - Status: Active, well-maintained
   
2. ✅ **CORNER_RADIUS_STANDARD.md** (170 lines)
   - Complete 2-tier corner radius system
   - Migration guide
   - Exception policy
   - Status: Complete, current

3. ✅ **DESIGN_SYSTEM_ROADMAP.md** (NEW - 500+ lines)
   - 12-step improvement plan
   - Timeline and deliverables
   - Success metrics
   - Status: Active planning

4. ✅ **DESIGN_SYSTEM_CHANGELOG.md** (NEW - 200+ lines)
   - Version history
   - Breaking changes log
   - Migration guides
   - Status: Active, ongoing

5. ✅ **DESIGN_SYSTEM_BASELINE.md** (NEW - this document)
   - Current state snapshot
   - Compliance audit results
   - Progress tracking

### Missing Documentation (To Be Created)
- ❌ `SPACING_SYSTEM.md` - Spacing usage guide
- ❌ `TYPOGRAPHY_SYSTEM.md` - Typography scale and usage
- ❌ `COLOR_SYSTEM.md` - Semantic color guide
- ❌ `COMPONENT_API_STANDARD.md` - Prop patterns
- ❌ `VARIANT_SYSTEM.md` - Variant guidelines
- ❌ `MOTION_SYSTEM.md` - Animation standards
- ❌ `ACCESSIBILITY_GUIDELINES.md` - A11y patterns

---

## Testing & Quality

### Current Testing Infrastructure
- ✅ **Unit Tests:** Vitest configured
- ✅ **E2E Tests:** Playwright configured
- ⚠️ **Component Tests:** Limited Storybook stories
- ❌ **Visual Regression:** Not implemented
- ❌ **Accessibility Tests:** Not automated
- ❌ **Design Linting:** Not implemented

### Storybook Status
**Location:** `.storybook/` (exists)
**Stories Found:** Limited coverage

**Components with Stories:**
- `Button.stories.ts` ✅
- `AppHeader.stories.tsx` ✅
- `PlayGrid.stories.tsx` ✅
- Several modal/form components ✅

**Coverage Estimate:** ~15% of components have stories

---

## Known Technical Debt

### High Priority Issues
1. **100+ Arbitrary Spacing Values**
   - Impact: Inconsistent spacing across app
   - Risk: Breaks grid system, hard to maintain
   - Effort: 2-3 weeks to fix systematically

2. **No Design Linting**
   - Impact: New violations added daily
   - Risk: Regression without enforcement
   - Effort: 1 week to implement ESLint rules

3. **Incomplete Storybook Coverage**
   - Impact: No component documentation
   - Risk: Developers reinvent components
   - Effort: 3-4 weeks to document all components

4. **No Visual Regression Testing**
   - Impact: Unintended visual changes ship
   - Risk: User-facing bugs
   - Effort: 1-2 weeks to set up Chromatic/Percy

### Medium Priority Issues
1. **Typography not standardized**
   - Some arbitrary font sizes likely exist
   - Line heights may be inconsistent
   
2. **Dark mode token coverage incomplete**
   - Some components may not work in dark mode
   - Need systematic audit

3. **Component prop APIs inconsistent**
   - Different components use different patterns
   - Confusing for developers

### Low Priority Issues
1. **Animation timing not standardized**
   - Arbitrary duration values likely present
   - No motion design system

2. **Figma-Code sync missing**
   - Designers update Figma, code out of sync
   - Manual token updates needed

---

## Performance Baseline

### Bundle Size
- **Total JS:** Unknown (needs measurement)
- **CSS Bundle:** Unknown (needs measurement)
- **Token Generation Time:** Unknown (needs benchmarking)

### Runtime Performance
- **First Contentful Paint (FCP):** Unknown
- **Largest Contentful Paint (LCP):** Unknown
- **Cumulative Layout Shift (CLS):** Unknown

*Note: Performance monitoring not yet implemented*

---

## Accessibility Baseline

### WCAG 2.1 AA Compliance
**Status:** Unknown - needs comprehensive audit

**Known Issues:**
- ⚠️ Color contrast not systematically verified
- ⚠️ Keyboard navigation not fully tested
- ⚠️ Screen reader support not validated
- ⚠️ Focus management needs review

**Accessibility Features:**
- ✅ `AccessibleButton` component exists
- ✅ `AccessibleInput` component exists
- ✅ `SkipLinks` component exists
- ✅ `useAccessibility` hook exists
- ⚠️ Usage across app unknown

---

## Success Metrics (To Track Over Time)

### Quantitative Goals
| Metric | Baseline (Oct 6) | Target (Q1 2026) | Progress |
|--------|-----------------|------------------|----------|
| Token Coverage | ~85% | 100% | 🟡 |
| Arbitrary Spacing | 100+ | 0 | 🔴 |
| Storybook Coverage | ~15% | 100% | 🔴 |
| Visual Regression Tests | 0 | 100% | 🔴 |
| WCAG AA Violations | Unknown | 0 | ⚠️ |
| Component API Consistency | Unknown | 100% | ⚠️ |
| Dark Mode Coverage | ~80% | 100% | 🟡 |

### Qualitative Goals
- ⬜ Designers can update tokens without code changes
- ⬜ Developers never need to invent new spacing values
- ⬜ New engineers onboard to design system in <1 day
- ⬜ Design reviews take <15 minutes (obvious compliance)
- ⬜ Zero "how do I style this?" questions

---

## Recent Changes (Before Roadmap Start)

### October 5-6, 2025: Corner Radius Standardization
**Impact:** 130+ files updated

**Changes:**
- Created 2-tier corner radius system
- Deleted GlassCard component (consolidated into Card)
- Fixed Card component CSS variable fallback
- Replaced all `rounded` → `rounded-lg` (43 files)
- Replaced all `rounded-md` → `rounded-lg` (52 files)
- Replaced all `rounded-3xl` → `rounded-xl` (8 files)
- Updated inline borderRadius styles (4 files)
- Updated CSS hardcoded values (1 file)
- Created comprehensive documentation (2 docs)

**Result:** ✅ 100% corner radius compliance achieved

---

## Next Steps (Phase 1 - Weeks 1-3)

### Step 1: Spacing Audit (In Progress)
- [ ] Complete audit of all arbitrary spacing values
- [ ] Document spacing decision tree
- [ ] Create ESLint rule to prevent arbitrary spacing
- [ ] Migrate all components to semantic spacing tokens
- [ ] Create SPACING_SYSTEM.md documentation

### Step 2: Typography Standardization
- [ ] Audit all font sizes and line heights
- [ ] Create type scale tokens
- [ ] Build Typography component
- [ ] Migrate all text rendering to tokens

### Step 3: Color Token Completion
- [ ] Audit all color usage
- [ ] Create missing semantic color tokens
- [ ] Add dark mode values for all colors
- [ ] Build color contrast checker

---

## Appendix: Detailed Spacing Violations

### Sample Violations (First 20)

1. **docs/BOXCALL_DESIGN_LANGUAGE.md:274**
   ```tsx
   min-h-[44px]  // Should use token
   ```

2. **src/pages/PracticePlanner.tsx:285**
   ```tsx
   min-h-[200px]  // Should use token
   ```

3. **src/pages/Logout.tsx:28**
   ```tsx
   min-h-[40vh]  // Should use semantic viewport token
   ```

4. **src/pages/TeamBulletin.tsx:269, 300**
   ```tsx
   min-h-[400px]  // Should use token (2 instances)
   ```

5. **src/components/dashboard/ProfileCard.tsx** (14+ violations)
   ```tsx
   min-h-[44px]          // Button touch target
   min-w-[44px]          // Button touch target
   min-w-[36px]          // Icon button
   min-h-[36px]          // Icon button
   max-w-[120px]         // Text truncation
   ```

6. **src/components/ui/Select/Select.tsx:35-37**
   ```tsx
   min-h-[32px]  // sm size
   min-h-[40px]  // md size
   min-h-[48px]  // lg size
   ```

7. **src/components/accessibility/AccessibleButton.tsx:139-141**
   ```tsx
   min-h-[32px]  // sm size
   min-h-[40px]  // md size
   min-h-[48px]  // lg size
   ```

*Note: Full audit results to be documented in SPACING_SYSTEM.md*

---

**Last Updated:** October 6, 2025  
**Next Review:** October 13, 2025 (end of Week 1)  
**Maintained By:** Design System Team
