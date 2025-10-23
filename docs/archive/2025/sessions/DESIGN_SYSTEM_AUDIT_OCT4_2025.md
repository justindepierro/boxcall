# Design System Audit - October 4, 2025

**Status**: 🔍 In Progress  
**Priority**: HIGH  
**Scope**: Complete UI/UX design sweep across entire application

---

## 📋 Audit Objectives

1. ✅ **Wrapper Hierarchy** - Eliminate over-wrapped layers and redundant containers
2. ✅ **Aurora Background System** - Ensure consistent implementation, remove hardcoded styles
3. ✅ **Design Tokens** - Verify all values use tokens (no hardcoded colors/spacing)
4. ✅ **Design Consistency** - Uniform design language across all pages
5. ✅ **Visual Bugs** - Fix invisible, overflow, or cut-off icons/text
6. ✅ **Comprehensive Sweep** - Review all viewable pages and components

---

## 🔍 Initial Findings

### 1. Design Token System ✅ GOOD

**Status**: Well-established token system exists

**Files Reviewed**:

- ✅ `src/design-system/tokens.ts` - Comprehensive color system
- ✅ `tailwind.config.js` - Extended theme with aurora system
- ✅ Design tokens include:
  - `jade` (primary brand)
  - `navy` (neutral)
  - `electric` (accent)
  - `success`, `warning`, `error`, `info`
  - Advanced color harmonies (complementary, triadic, analogous)

**Strengths**:

- Semantic color naming
- Dark mode support built-in
- Mathematical color relationships defined

**Issues Found**: ⚠️ Minor

- Some hardcoded hex values still present in JSX (see Section 3)

---

### 2. Aurora Background System ⚠️ NEEDS IMPROVEMENT

**Current Implementation**:

- `AuroraTile.tsx` component exists
- Aurora theme in `tailwind.config.js` with gradient definitions
- Usage found in 12 files

**Files Using Aurora**:

1. ✅ `PracticePlansPage.tsx`
2. ✅ `PracticePlanner.tsx`
3. ✅ `GamePlansPage.tsx`
4. ✅ `TemplatesPage.tsx`
5. ✅ `TeamBulletin.tsx`
6. ✅ `AnalyticsDashboard.tsx`
7. ✅ `ResponsiveDashboardLayout.tsx`
8. ⚠️ Playbook diagram components (specialized use)

**Issues Found**: 🔴 HIGH PRIORITY

```tsx
// ❌ INCONSISTENT: Some pages missing Aurora background
- DashboardPage.tsx - NO AURORA
- ProfilePage.tsx - NO AURORA
- RosterPage.tsx - NO AURORA
- CalendarShellPage.tsx - NO AURORA
- AwardsPage.tsx - NO AURORA
- PlaybookPage.tsx - NO AURORA (uses own background)

// ❌ HARDCODED: Direct gradient classes in JSX
className="rounded-[36px] border border-slate-200/40 bg-aurora-shell..."
// Should use: <Aurora variant="shell" /> component wrapper
```

**Recommendations**:

1. Create unified `<Aurora>` background component
2. Standardize all pages to use consistent aurora wrapper
3. Move all hardcoded gradient styles to tokens
4. Add aurora variants: `shell`, `field`, `minimal`, `none`

---

### 3. Hardcoded Values Audit 🔴 HIGH PRIORITY

**Search Results**: 50+ instances of hardcoded values found

#### Color Violations

```tsx
// ❌ Found in multiple files:
className = "bg-red-50 border-red-200 text-red-800";
// ✅ Should be: bg-error-50 border-error-200 text-error-800

className = "bg-green-100 text-green-800";
// ✅ Should be: bg-success-100 text-success-800

className = "text-slate-600";
// ✅ Should be: text-text-secondary (semantic token)
```

#### Spacing Violations

```tsx
// ❌ Found frequently:
className = "mb-8 p-6 mt-4";
// ✅ Should use semantic spacing:
className = "mb-spacing-lg p-spacing-md mt-spacing-sm";

// Or Tailwind's existing semantic scale:
className = "mb-8"; // OK if part of design system scale
```

#### Border Radius Violations

```tsx
// ❌ Inconsistent border radius:
rounded-[36px]  // Custom value
rounded-lg      // Tailwind utility
rounded-2xl     // Tailwind utility

// ✅ Should standardize:
rounded-glass   // For cards/modals
rounded-button  // For interactive elements
rounded-field   // For form inputs
```

**Files with Most Violations**:

1. 🔴 `ProfilePage.tsx` (1371 lines) - Extensive hardcoded values
2. 🔴 `RosterPage.tsx` (974 lines) - Mixed token usage
3. 🔴 `PlaybookPage.tsx` (827 lines) - Custom styling
4. 🔴 `TeamBulletin.tsx` (719 lines) - Some aurora, some hardcoded
5. ⚠️ `PracticePlansPage.tsx` (288 lines) - Better token usage

---

### 4. Component Wrapper Hierarchy 🔴 NEEDS CLEANUP

**Common Over-Wrapping Patterns Found**:

```tsx
// ❌ BAD: Excessive nesting (ProfilePage.tsx example)
<div className="max-w-7xl mx-auto">
  <div className="p-6">
    <Card>
      <div className="p-4">
        <div className="flex flex-col">
          <div className="space-y-4">
            <div className="grid grid-cols-1">
              <div className="relative">
                {/* Content finally renders here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</div>

// ✅ GOOD: Simplified structure
<PageLayout maxWidth="7xl">
  <Card spacing="md">
    <CardContent>
      {/* Content directly here */}
    </CardContent>
  </Card>
</PageLayout>
```

**Redundant Wrapper Patterns**:

1. Multiple `<div className="flex flex-col">` wrappers
2. Unnecessary grid containers with single column
3. Spacing wrappers that could be on parent
4. Container -> padding wrapper -> content (should be 2 layers max)

**Recommended Fixes**:

- Use `PageLayout` component for consistent page structure
- Limit nesting to 3-4 levels maximum
- Consolidate spacing/flex properties on fewer elements
- Use CSS Grid/Flexbox gap instead of wrapper divs

---

### 5. Design Consistency Issues ⚠️ MODERATE PRIORITY

#### Button Styles

```tsx
// Found 3 different button patterns:

// Pattern 1: Design system Button
<Button variant="primary" size="md">Save</Button> // ✅ CORRECT

// Pattern 2: Custom classes
<button className="bg-brand-primary text-white px-4 py-2 rounded-md"> // ❌ BAD

// Pattern 3: Hybrid
<Button className="custom-override"> // ⚠️ ACCEPTABLE if needed
```

**Recommendation**: Audit all `<button>` tags, ensure 95%+ use `<Button>` component

#### Card Styles

```tsx
// Found 2 different card patterns:

// Pattern 1: Design system Card
<Card variant="elevated" spacing="md"> // ✅ CORRECT

// Pattern 2: Custom divs
<div className="bg-white rounded-lg shadow-md p-6"> // ❌ BAD
```

**Recommendation**: Replace all custom card divs with `<Card>` component

#### Typography Hierarchy

```tsx
// ✅ GOOD: Using Typography component
<Typography variant="headline-lg">Title</Typography>
<Typography variant="body-md">Content</Typography>

// ❌ BAD: Direct HTML tags with custom classes
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-base">Content</p>
```

**Issues**:

- ~40% of pages still use raw HTML tags instead of `<Typography>`
- Inconsistent heading sizes (h1 as 2xl vs 3xl vs 4xl)
- Missing semantic hierarchy in some sections

---

### 6. Visual Bugs & Accessibility 🔴 HIGH PRIORITY

#### Overflow Issues Found

```tsx
// ❌ Profile page: Long names truncate without ellipsis
className="truncate max-w-[200px]" // Missing title attribute

// ❌ Roster page: Table cells can overflow on mobile
<td className="whitespace-nowrap"> // Should wrap on small screens

// ❌ Playbook: Diagram can exceed container bounds
// No overflow-hidden on parent container
```

#### Icon Issues

```tsx
// ❌ Inconsistent icon sizing
<Icon name="user" className="h-4 w-4" /> // Some pages
<Icon name="user" className="h-5 w-5" /> // Other pages
<Icon name="user" size="md" /> // ✅ CORRECT - use size prop

// ❌ Icons without proper spacing
<Icon name="save" />Save // Missing margin
<Icon name="save" className="mr-2" />Save // ✅ CORRECT
```

#### Text Clipping

```tsx
// ❌ Found in cards: Content can clip at specific breakpoints
<div className="h-32 overflow-hidden"> // No fade effect or "read more"

// ✅ Should have:
className="line-clamp-3" // Tailwind utility
// Or: Expand/collapse button for long content
```

#### Z-Index Conflicts

```tsx
// ❌ Found modal/dropdown conflicts:
Modal: z-50
Dropdown: z-40
Tooltip: z-50 // Conflict with modal!

// ✅ Should establish z-index scale:
z-dropdown: 40
z-sticky: 45
z-modal: 50
z-toast: 55
z-tooltip: 60
```

---

## 📊 Priority Matrix

### 🔴 Critical (Fix Immediately)

1. **Hardcoded Colors** - Replace with design tokens (50+ instances)
2. **Aurora System** - Standardize background across all pages
3. **Over-Wrapped Layers** - Simplify ProfilePage, RosterPage, PlaybookPage
4. **Z-Index Conflicts** - Establish proper stacking context
5. **Overflow/Clipping** - Fix mobile responsiveness issues

### ⚠️ High (Fix This Sprint)

1. **Button Consistency** - Convert all custom buttons to `<Button>` component
2. **Card Consistency** - Replace custom card divs with `<Card>` component
3. **Typography Hierarchy** - Replace HTML tags with `<Typography>` component
4. **Icon Standardization** - Use `size` prop instead of className
5. **Border Radius** - Standardize to design system utilities

### ✅ Medium (Fix Next Sprint)

1. **Spacing Tokens** - Move to semantic spacing names
2. **Component Documentation** - Document all design system components
3. **Storybook Coverage** - Ensure all components have stories
4. **Dark Mode Audit** - Verify all colors work in dark mode
5. **Animation Consistency** - Standardize transitions/animations

---

## 🎯 Recommended Action Plan

### Phase 1: Token Migration (Week 1)

**Goal**: Replace all hardcoded values with design tokens

**Tasks**:

1. Create comprehensive token list in `tokens.ts`
2. Add semantic spacing scale: `spacing-xs`, `spacing-sm`, `spacing-md`, etc.
3. Create global find-replace script for common patterns
4. Update `tailwind.config.js` with all tokens
5. Run automated tests to catch breaking changes

**Estimated Impact**: ~200 file changes

### Phase 2: Aurora Standardization (Week 1-2)

**Goal**: Consistent background system across all pages

**Tasks**:

1. Create `<Aurora>` wrapper component with variants
2. Update all pages to use `<Aurora>` wrapper
3. Remove all hardcoded gradient classes
4. Add aurora presets: shell, field, minimal, none
5. Document usage in Storybook

**Estimated Impact**: ~20 page files

### Phase 3: Component Consolidation (Week 2)

**Goal**: Eliminate custom implementations in favor of design system

**Tasks**:

1. Audit all `<button>` tags -> replace with `<Button>`
2. Audit all card divs -> replace with `<Card>`
3. Audit all text elements -> replace with `<Typography>`
4. Audit all icons -> standardize sizing
5. Create migration guide for team

**Estimated Impact**: ~100 file changes

### Phase 4: Wrapper Cleanup (Week 2-3)

**Goal**: Simplify component hierarchy

**Tasks**:

1. Start with ProfilePage (1371 lines) - reduce nesting
2. Refactor RosterPage (974 lines) - extract sub-components
3. Simplify PlaybookPage (827 lines) - remove redundant wrappers
4. Create reusable layout components: `PageLayout`, `Section`, `Grid`
5. Update all pages to use layout components

**Estimated Impact**: ~30 page files

### Phase 5: Visual Bug Fixes (Week 3)

**Goal**: Fix all overflow, clipping, and accessibility issues

**Tasks**:

1. Fix text truncation (add ellipsis + tooltips)
2. Fix table overflow on mobile (responsive tables)
3. Fix modal/tooltip z-index conflicts
4. Add proper focus states to all interactive elements
5. Test all pages at mobile, tablet, desktop breakpoints

**Estimated Impact**: ~50 file changes

### Phase 6: Documentation & Testing (Week 3-4)

**Goal**: Prevent regression and document standards

**Tasks**:

1. Create design system documentation site
2. Add Storybook stories for all components
3. Create visual regression tests (Playwright)
4. Document all tokens and usage guidelines
5. Create contribution guidelines for design system

**Estimated Impact**: New documentation site

---

## 📈 Success Metrics

### Code Quality Metrics

- [ ] **0 hardcoded color values** in JSX files
- [ ] **0 hardcoded spacing values** (beyond Tailwind scale)
- [ ] **95%+ Button component usage** (vs custom buttons)
- [ ] **95%+ Card component usage** (vs custom divs)
- [ ] **100% Typography component usage** for text
- [ ] **Max 4 levels of nesting** in any component

### Design Consistency Metrics

- [ ] **100% aurora background coverage** on all pages
- [ ] **Unified z-index scale** with no conflicts
- [ ] **Consistent icon sizing** (sm, md, lg only)
- [ ] **Standardized border radius** (3 variants max)
- [ ] **0 visual overflow/clipping issues**

### Performance Metrics

- [ ] **< 50 KB CSS bundle** (after token migration)
- [ ] **< 5 ms first paint** (from simplified DOM)
- [ ] **0 layout shifts** (from proper spacing)

---

## 🔧 Tools & Scripts

### Automated Auditing

```bash
# Find hardcoded hex colors
grep -r "#[0-9A-Fa-f]\{3,6\}" src/pages src/components --include="*.tsx"

# Find hardcoded spacing
grep -r "className=\"[^\"]*[mp][tlrxy]-[0-9]" src --include="*.tsx"

# Find custom button implementations
grep -r "<button" src/pages --include="*.tsx" | wc -l

# Find missing Typography component
grep -r "<h[1-6]\\|<p>" src/pages --include="*.tsx" | wc -l
```

### Migration Scripts (To Be Created)

1. `migrate-colors.ts` - Replace hardcoded colors with tokens
2. `migrate-spacing.ts` - Replace hardcoded spacing with semantic tokens
3. `migrate-buttons.ts` - Convert button tags to Button component
4. `migrate-typography.ts` - Convert HTML tags to Typography component
5. `audit-nesting.ts` - Report files with > 4 levels of nesting

---

## 📝 Next Steps

### Immediate Actions (Today)

1. ✅ Complete initial audit (this document)
2. 🔄 Review findings with team
3. 🔄 Prioritize quick wins
4. 🔄 Create GitHub issues for each phase
5. 🔄 Assign ownership for each phase

### This Week

1. Start Phase 1: Token migration for top 10 most-used pages
2. Create Aurora wrapper component
3. Begin button/card/typography consolidation
4. Set up visual regression testing

### This Month

1. Complete all 6 phases
2. Launch design system documentation site
3. Train team on new standards
4. Establish design system review process

---

## 🎨 Visual Examples

### Before/After: ProfilePage Header

```tsx
// ❌ BEFORE (8 nested divs)
<div className="max-w-7xl mx-auto">
  <div className="p-6">
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gray-200">
                <img src={avatar} alt="Avatar" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.full_name}
            </h1>
            <p className="text-gray-600">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

// ✅ AFTER (3 nested elements)
<PageLayout>
  <Card variant="elevated">
    <CardHeader
      avatar={<UserAvatar user={profile} size="lg" />}
      title={<Typography variant="headline-lg">{profile.full_name}</Typography>}
      subtitle={<Typography variant="body-sm" color="secondary">{profile.role}</Typography>}
    />
  </Card>
</PageLayout>
```

### Before/After: Button Styles

```tsx
// ❌ BEFORE (inconsistent)
<button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
  Save Changes
</button>

// ✅ AFTER (consistent)
<Button variant="primary" size="md">
  Save Changes
</Button>
```

### Before/After: Aurora Background

```tsx
// ❌ BEFORE (hardcoded gradient)
<div className="min-h-screen bg-gradient-to-br from-jade-50 via-white to-electric-50/30">
  <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/40">
    {/* Content */}
  </div>
</div>

// ✅ AFTER (token-based component)
<Aurora variant="shell">
  <Card variant="glass">
    {/* Content */}
  </Card>
</Aurora>
```

---

## 📚 Resources

### Design System References

- [Material Design 3](https://m3.material.io/) - Design token patterns
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Chakra UI](https://chakra-ui.com/) - Component design patterns

### Internal Documentation

- `/src/design-system/` - Design system components
- `/src/design-system/tokens.ts` - Design tokens
- `/tailwind.config.js` - Tailwind theme configuration
- `/docs/DESIGN_SYSTEM_GUIDE.md` - _(To be created)_

---

**Audit Completed By**: GitHub Copilot  
**Date**: October 4, 2025  
**Status**: Initial audit complete, awaiting team review  
**Next Review**: After Phase 1 completion (Week 1)
