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
- **Spacing Compliance:** **Unknown** ⚠️ (100+ arbitrary values found)
- **Typography Compliance:** Unknown
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

### ⚠️ Spacing (Compliance Unknown - High Priority)
**Audit Date:** October 6, 2025  
**Status:** In Progress

**Arbitrary Values Found:** 100+ instances (search stopped at maxResults)

**Common Violations:**
- `p-[24px]` - Arbitrary padding
- `m-[x]` - Arbitrary margins
- `gap-[x]` - Arbitrary gaps
- `min-h-[200px]` - Arbitrary heights (44+  instances)
- `min-w-[160px]` - Arbitrary widths (30+ instances)
- `max-h-[90vh]` - Arbitrary viewport heights (12+ instances)

**Files with Most Violations:**
1. `src/components/dashboard/ProfileCard.tsx` - 14+ arbitrary values
2. `src/components/playbook/diagram/PlayDiagramBuilder.tsx` - 5+ arbitrary min-width values
3. `src/components/playbook/diagram-v2/components/TipsOverlay.tsx` - Multiple drop-shadow arbitrary values
4. `src/components/ui/Select/Select.tsx` - 3 arbitrary min-height values
5. `src/components/accessibility/AccessibleButton.tsx` - 3 arbitrary min-height values

**Impact:** HIGH - Spacing inconsistency affects entire app UX

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
