# Layout Token System Design

**Date**: October 6, 2025  
**Status**: Design Phase  
**Phase**: Option B - Build New Capabilities

---

## Executive Summary

Design comprehensive layout token system to standardize page containers, content areas, grid patterns, and responsive breakpoints across the BoxCall application.

### Goals

1. **Eliminate repetitive layout patterns** (e.g., `max-w-7xl mx-auto`, `grid grid-cols-1 md:grid-cols-2`)
2. **Standardize container widths** for consistent page layouts
3. **Create reusable grid patterns** for common layouts
4. **Improve responsive consistency** across pages
5. **Maintain existing functionality** (especially AppHeader/Sidebar)

### Non-Goals

- ❌ Modify AppHeader or Sidebar structure/behavior
- ❌ Change Layout.tsx wrapper component
- ❌ Alter navigation or authentication flows
- ❌ Touch working header (global search, user menu)

---

## Audit Findings

### Current Layout Patterns (by frequency)

#### 1. Page Container Patterns

**Most Common: `max-w-7xl mx-auto`** (80rem / 1280px)
- Used in: PracticePlanner, AchievementAdmin, RoleBasedDashboard, Footer, PageLayout
- Purpose: Main page container for dashboard/wide content
- **22+ occurrences**

**Second: `max-w-2xl mx-auto`** (42rem / 672px)
- Used in: BoxCall, AboutPage, CreateCoachAccount, TeamBulletin, CreateTeam
- Purpose: Centered content (forms, articles, narratives)
- **10+ occurrences**

**Third: `max-w-6xl mx-auto`** (72rem / 1152px)
- Used in: SocialFeaturesDemo, TeamSettings
- Purpose: Medium-wide content
- **4+ occurrences**

**Other widths found:**
- `max-w-4xl` (56rem / 896px) - CreateCoachAccount
- `max-w-3xl` (48rem / 768px) - DiagnosticsPage
- `max-w-xl` (36rem / 576px) - EventModal
- `max-w-lg` (32rem / 512px) - RouteErrorElement
- `max-w-md` (28rem / 448px) - PracticePlansPage, PlayerDashboard, TeamBulletin
- `max-w-sm` (24rem / 384px) - CreateTeam

#### 2. Grid Patterns

**Most Common: Dashboard Grid**
```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5
```
- Used in: SocialFeaturesDemo, PracticePlansPage, AchievementAdmin
- **15+ variations**

**Form Layouts**
```tsx
grid grid-cols-1 md:grid-cols-2 gap-4
// or gap-6
```
- Used in: CreateCoachAccount (8 times), TeamSettings, JoinTeam
- **20+ occurrences**

**Dashboard Hero Tiles**
```tsx
grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5
```
- Used in: TeamBulletin
- Dashboard overview cards

**Responsive Breakpoints Used:**
- `sm:` (640px)
- `md:` (768px) - MOST COMMON for 2-column layouts
- `lg:` (1024px) - MOST COMMON for 3-column layouts
- `xl:` (1280px) - Used for 4-column or sidebar layouts

#### 3. Content Area Widths

**Form Inputs**
```tsx
w-full sm:w-64
w-full // default for mobile
```

**Section Containers**
```tsx
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
```
- Consistent padding pattern: `px-4 sm:px-6 lg:px-8`
- Consistent vertical: `py-8`

#### 4. Custom Layout Classes

**Existing custom classes:**
- `bc-container-padding` (used in Footer, RoleBasedDashboard, NavBar)
- `bc-grid-gap` (used in RoleBasedDashboard)
- `bc-card-padding` (used in RoleBasedDashboard)
- `responsive-dashboard-container` (used in ResponsiveDashboardLayout)
- `responsive-content-grid` (complex grid system)

---

## Token Design

### 1. Container Width Tokens

**Purpose**: Standardize page container max-widths

```css
/* Container Widths - Page-level containers */
--layout-container-xs: 20rem;     /* 320px - Minimal mobile */
--layout-container-sm: 24rem;     /* 384px - Small forms */
--layout-container-md: 28rem;     /* 448px - Medium forms */
--layout-container-lg: 32rem;     /* 512px - Large forms */
--layout-container-xl: 36rem;     /* 576px - Modals */
--layout-container-2xl: 42rem;    /* 672px - Articles/Forms (max-w-2xl) */
--layout-container-3xl: 48rem;    /* 768px - Wide forms (max-w-3xl) */
--layout-container-4xl: 56rem;    /* 896px - Wide content (max-w-4xl) */
--layout-container-5xl: 64rem;    /* 1024px - Detail pages (max-w-5xl) */
--layout-container-6xl: 72rem;    /* 1152px - Wide dashboards (max-w-6xl) */
--layout-container-7xl: 80rem;    /* 1280px - Main app container (max-w-7xl) */
--layout-container-full: 100%;    /* Full width */
```

**Tailwind Utilities:**
```tsx
// Instead of: max-w-7xl mx-auto
<div className="container-page">

// Instead of: max-w-2xl mx-auto
<div className="container-content">

// Instead of: max-w-6xl mx-auto
<div className="container-wide">
```

### 2. Content Width Tokens

**Purpose**: Semantic content area sizing

```css
/* Content Widths - Semantic sizing */
--layout-content-narrow: var(--layout-container-2xl);   /* 42rem - Articles, forms */
--layout-content-medium: var(--layout-container-4xl);   /* 56rem - Detail pages */
--layout-content-wide: var(--layout-container-6xl);     /* 72rem - Dashboards */
--layout-content-full: var(--layout-container-7xl);     /* 80rem - Main container */
```

**Tailwind Utilities:**
```tsx
// Semantic naming
<div className="content-narrow">  // Forms, articles
<div className="content-medium">  // Detail pages
<div className="content-wide">    // Wide dashboards
<div className="content-full">    // Main container
```

### 3. Grid Gap Tokens

**Purpose**: Standardize gaps in grid layouts

```css
/* Grid Gaps - Layout-specific spacing */
--layout-gap-xs: 0.5rem;   /* 8px - Tight grids */
--layout-gap-sm: 0.75rem;  /* 12px - Compact grids */
--layout-gap-md: 1rem;     /* 16px - Standard grids (gap-4) */
--layout-gap-lg: 1.25rem;  /* 20px - Spacious grids (gap-5) */
--layout-gap-xl: 1.5rem;   /* 24px - Wide grids (gap-6) */
--layout-gap-2xl: 2rem;    /* 32px - Extra wide grids */
```

**Rationale**: These align with Tailwind's gap utilities but provide semantic tokens:
- `gap-4` (1rem) → `layout-gap-md`
- `gap-5` (1.25rem) → `layout-gap-lg`
- `gap-6` (1.5rem) → `layout-gap-xl`

### 4. Grid Template Tokens

**Purpose**: Common grid column patterns

```css
/* Grid Templates - Reusable patterns */
--layout-grid-single: repeat(1, minmax(0, 1fr));
--layout-grid-double: repeat(2, minmax(0, 1fr));
--layout-grid-triple: repeat(3, minmax(0, 1fr));
--layout-grid-quad: repeat(4, minmax(0, 1fr));
--layout-grid-auto-fit-sm: repeat(auto-fit, minmax(16rem, 1fr));
--layout-grid-auto-fit-md: repeat(auto-fit, minmax(20rem, 1fr));
--layout-grid-auto-fit-lg: repeat(auto-fit, minmax(24rem, 1fr));
```

### 5. Responsive Grid Utilities

**Purpose**: Replace repetitive responsive grid patterns

**Pattern 1: Dashboard Grid (1→2→3 columns)**
```tsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">

// AFTER
<div className="grid-dashboard">
```

**Pattern 2: Form Grid (1→2 columns)**
```tsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// AFTER
<div className="grid-form">
```

**Pattern 3: Hero Tiles (1→2→4 columns)**
```tsx
// BEFORE
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">

// AFTER
<div className="grid-hero">
```

**Pattern 4: Card Grid (auto-fit responsive)**
```tsx
// BEFORE
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// AFTER
<div className="grid-cards">
```

### 6. Padding Tokens

**Purpose**: Standardize container padding (replaces `bc-container-padding`)

```css
/* Container Padding - Page-level padding */
--layout-padding-xs: 0.75rem;  /* 12px - Mobile */
--layout-padding-sm: 1rem;     /* 16px - Mobile (px-4) */
--layout-padding-md: 1.5rem;   /* 24px - Tablet (px-6) */
--layout-padding-lg: 2rem;     /* 32px - Desktop (px-8) */
```

**Responsive Utility:**
```tsx
// BEFORE
<div className="px-4 sm:px-6 lg:px-8">

// AFTER
<div className="container-padding">
```

---

## Implementation Strategy

### Phase 1: Add CSS Tokens (generated-tokens.css)

Add layout tokens to the CSS variables file:

```css
/* LAYOUT TOKENS - Page Containers & Grid Systems */

/* Container Widths */
--layout-container-xs: 20rem;
--layout-container-sm: 24rem;
--layout-container-md: 28rem;
--layout-container-lg: 32rem;
--layout-container-xl: 36rem;
--layout-container-2xl: 42rem;
--layout-container-3xl: 48rem;
--layout-container-4xl: 56rem;
--layout-container-5xl: 64rem;
--layout-container-6xl: 72rem;
--layout-container-7xl: 80rem;
--layout-container-full: 100%;

/* Content Widths (Semantic) */
--layout-content-narrow: var(--layout-container-2xl);
--layout-content-medium: var(--layout-container-4xl);
--layout-content-wide: var(--layout-container-6xl);
--layout-content-full: var(--layout-container-7xl);

/* Grid Gaps */
--layout-gap-xs: 0.5rem;
--layout-gap-sm: 0.75rem;
--layout-gap-md: 1rem;
--layout-gap-lg: 1.25rem;
--layout-gap-xl: 1.5rem;
--layout-gap-2xl: 2rem;

/* Container Padding (Responsive) */
--layout-padding-xs: 0.75rem;
--layout-padding-sm: 1rem;
--layout-padding-md: 1.5rem;
--layout-padding-lg: 2rem;
```

### Phase 2: Extend Tailwind Config

Add custom utilities to `tailwind.config.js`:

```javascript
// Layout tokens
const layoutTokens = {
  container: {
    xs: 'var(--layout-container-xs)',
    sm: 'var(--layout-container-sm)',
    md: 'var(--layout-container-md)',
    lg: 'var(--layout-container-lg)',
    xl: 'var(--layout-container-xl)',
    '2xl': 'var(--layout-container-2xl)',
    '3xl': 'var(--layout-container-3xl)',
    '4xl': 'var(--layout-container-4xl)',
    '5xl': 'var(--layout-container-5xl)',
    '6xl': 'var(--layout-container-6xl)',
    '7xl': 'var(--layout-container-7xl)',
    full: 'var(--layout-container-full)',
  },
  content: {
    narrow: 'var(--layout-content-narrow)',
    medium: 'var(--layout-content-medium)',
    wide: 'var(--layout-content-wide)',
    full: 'var(--layout-content-full)',
  },
};

// Add to theme.extend
theme: {
  extend: {
    maxWidth: {
      ...layoutTokens.container,
      ...layoutTokens.content,
    },
  },
}

// Add custom utilities via plugin
plugins: [
  function({ addUtilities }) {
    addUtilities({
      // Container utilities
      '.container-page': {
        maxWidth: 'var(--layout-container-7xl)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.container-content': {
        maxWidth: 'var(--layout-container-2xl)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.container-wide': {
        maxWidth: 'var(--layout-container-6xl)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.content-narrow': {
        maxWidth: 'var(--layout-content-narrow)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.content-medium': {
        maxWidth: 'var(--layout-content-medium)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.content-wide': {
        maxWidth: 'var(--layout-content-wide)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      '.content-full': {
        maxWidth: 'var(--layout-content-full)',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      
      // Container padding utility
      '.container-padding': {
        paddingLeft: 'var(--layout-padding-sm)',
        paddingRight: 'var(--layout-padding-sm)',
        '@screen sm': {
          paddingLeft: 'var(--layout-padding-md)',
          paddingRight: 'var(--layout-padding-md)',
        },
        '@screen lg': {
          paddingLeft: 'var(--layout-padding-lg)',
          paddingRight: 'var(--layout-padding-lg)',
        },
      },
      
      // Grid patterns
      '.grid-dashboard': {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 'var(--layout-gap-md)',
        '@screen md': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 'var(--layout-gap-lg)',
        },
        '@screen lg': {
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        },
      },
      '.grid-form': {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 'var(--layout-gap-xl)',
        '@screen md': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
      },
      '.grid-hero': {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 'var(--layout-gap-md)',
        '@screen sm': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
        '@screen xl': {
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 'var(--layout-gap-lg)',
        },
      },
      '.grid-cards': {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: 'var(--layout-gap-md)',
        '@screen sm': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
        '@screen lg': {
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        },
      },
    });
  },
],
```

### Phase 3: Update PageLayout Component

Replace hardcoded `max-w-7xl` with token:

```tsx
// src/components/layout/PageLayout.tsx

// BEFORE
<div className={layoutClasses}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// AFTER
<div className={layoutClasses}>
  <div className="container-page container-padding">
```

### Phase 4: Migration Examples

#### Example 1: Dashboard Page

```tsx
// BEFORE
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
    {/* content */}
  </div>
</div>

// AFTER
<div className="container-page container-padding py-8">
  <div className="grid-dashboard">
    {/* content */}
  </div>
</div>
```

#### Example 2: Form Page

```tsx
// BEFORE
<div className="max-w-2xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* form fields */}
  </div>
</div>

// AFTER
<div className="container-content">
  <div className="grid-form">
    {/* form fields */}
  </div>
</div>
```

#### Example 3: Hero Tiles

```tsx
// BEFORE
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
  {/* tiles */}
</div>

// AFTER
<div className="grid-hero">
  {/* tiles */}
</div>
```

---

## Migration Priority

### High Priority (Phase 6)

1. **PageLayout** - Most used component
2. **RoleBasedDashboard** - Replace `bc-container-padding`
3. **TeamBulletin** - Dashboard hero grid
4. **CreateCoachAccount** - Form grids (8 occurrences)
5. **PracticePlansPage** - Card grids

### Medium Priority

6. **TeamSettings** - Form layouts
7. **SocialFeaturesDemo** - Multiple grid patterns
8. **AchievementAdminPage** - Dashboard grid
9. **PracticePlanner** - Page container
10. **BoxCall** - Content container

### Low Priority (Future)

- Individual form pages
- List pages
- Detail pages

---

## Testing Checklist

Before committing changes:

- [ ] Type check passes (`npm run type-check`)
- [ ] Lint passes (0 errors)
- [ ] Build succeeds (`npm run build`)
- [ ] **AppHeader still works** (global search, navigation, user menu)
- [ ] **Sidebar still works** (toggle, overlay, navigation items)
- [ ] Page containers render correctly at all breakpoints
- [ ] Grid layouts responsive behavior maintained
- [ ] Form layouts still aligned properly
- [ ] Dashboard layouts unchanged visually
- [ ] No visual regressions

---

## Success Metrics

### Quantitative

- [ ] Reduce layout code duplication by 60%
- [ ] Convert 15+ components to use layout tokens
- [ ] Remove 40+ hardcoded max-width classes
- [ ] Standardize 20+ grid patterns

### Qualitative

- [ ] Consistent container widths across pages
- [ ] Predictable responsive breakpoints
- [ ] Easier to create new pages (copy pattern)
- [ ] Better developer experience (semantic classes)
- [ ] AppHeader/Sidebar untouched and working
- [ ] Zero visual regressions

---

## Next Steps

1. ✅ **Phase 1 Complete**: Audit current patterns
2. ✅ **Phase 2 Complete**: Design token structure (this document)
3. ⏭️ **Phase 3**: Implement CSS tokens in `generated-tokens.css`
4. ⏭️ **Phase 4**: Extend `tailwind.config.js` with utilities
5. ⏭️ **Phase 5**: Create comprehensive documentation
6. ⏭️ **Phase 6**: Migrate 10-15 high-priority components
7. ⏭️ **Phase 7**: Validate and commit

---

*Generated: October 6, 2025*  
*Team: Engineering*  
*Phase: Option B - Layout Token System Design*
