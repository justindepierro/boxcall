# Layout Token System - Usage Guide

**Version**: 1.0.0  
**Date**: October 6, 2025  
**Status**: ✅ Ready for Use

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Container Utilities](#container-utilities)
4. [Grid Patterns](#grid-patterns)
5. [Responsive Padding](#responsive-padding)
6. [Migration Guide](#migration-guide)
7. [Best Practices](#best-practices)
8. [Safe Zones](#safe-zones)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Layout Token System provides **standardized, reusable layout patterns** to replace repetitive Tailwind classes across the BoxCall application.

### Benefits

✅ **Consistency** - All pages use same container widths  
✅ **DRY Code** - No more `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5`  
✅ **Semantic** - Classes describe intent (`grid-dashboard` vs implementation details)  
✅ **Responsive** - Built-in breakpoint behavior  
✅ **Maintainable** - Change once, update everywhere

### What's Included

- **Container Utilities**: `.container-page`, `.container-content`, `.container-wide`
- **Grid Patterns**: `.grid-dashboard`, `.grid-form`, `.grid-hero`, `.grid-cards`
- **Responsive Padding**: `.container-padding`
- **Max-Width Tokens**: `max-w-container-7xl`, `max-w-content-narrow`, etc.

---

## Quick Start

### Before (Old Way)

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
    {/* content */}
  </div>
</div>
```

### After (New Way)

```tsx
<div className="container-page container-padding py-8">
  <div className="grid-dashboard">
    {/* content */}
  </div>
</div>
```

**Result**: 50% less code, same responsive behavior, more maintainable.

---

## Container Utilities

### Page Containers

Use these for main page wrappers.

#### `.container-page`

**Purpose**: Main app container (80rem / 1280px)  
**Replaces**: `max-w-7xl mx-auto`  
**Use for**: Dashboard pages, wide layouts

```tsx
<div className="container-page">
  {/* Main page content */}
</div>
```

#### `.container-content`

**Purpose**: Centered content (42rem / 672px)  
**Replaces**: `max-w-2xl mx-auto`  
**Use for**: Forms, articles, narratives

```tsx
<div className="container-content">
  {/* Form or article content */}
</div>
```

#### `.container-wide`

**Purpose**: Wide dashboard (72rem / 1152px)  
**Replaces**: `max-w-6xl mx-auto`  
**Use for**: Wide content areas

```tsx
<div className="container-wide">
  {/* Wide content */}
</div>
```

### Semantic Content Widths

Use these for content-specific sizing.

#### `.content-narrow`

**Purpose**: Narrow reading width (42rem)  
**Best for**: Forms, articles, single-column content

```tsx
<article className="content-narrow">
  <Typography variant="headline-lg">Article Title</Typography>
  <Typography variant="body-lg">Content...</Typography>
</article>
```

#### `.content-medium`

**Purpose**: Medium content width (56rem)  
**Best for**: Detail pages, profiles

```tsx
<div className="content-medium">
  <ProfileDetail user={user} />
</div>
```

#### `.content-wide`

**Purpose**: Wide dashboard content (72rem)  
**Best for**: Dashboards, analytics

```tsx
<div className="content-wide">
  <DashboardStats stats={stats} />
</div>
```

#### `.content-full`

**Purpose**: Full page width (80rem)  
**Best for**: Maximum width layouts

```tsx
<div className="content-full">
  <WideTable data={data} />
</div>
```

### Max-Width Tokens

You can also use tokens directly with Tailwind's `max-w-*` utility:

```tsx
<div className="max-w-container-7xl mx-auto">   {/* 80rem */}
<div className="max-w-container-6xl mx-auto">   {/* 72rem */}
<div className="max-w-container-2xl mx-auto">   {/* 42rem */}
<div className="max-w-content-narrow mx-auto">  {/* 42rem */}
<div className="max-w-content-wide mx-auto">    {/* 72rem */}
```

---

## Grid Patterns

### `.grid-dashboard`

**Pattern**: 1 → 2 → 3 columns  
**Breakpoints**: md (2 cols), lg (3 cols)  
**Gap**: 1rem → 1.25rem  
**Replaces**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5`

**Use for**: Dashboard cards, analytics tiles, stat cards

```tsx
<div className="grid-dashboard">
  <StatsCard title="Users" value="1,234" />
  <StatsCard title="Teams" value="56" />
  <StatsCard title="Plays" value="789" />
</div>
```

**Responsive Behavior**:
- Mobile (< 768px): 1 column, 1rem gap
- Tablet (768px+): 2 columns, 1.25rem gap
- Desktop (1024px+): 3 columns, 1.25rem gap

### `.grid-form`

**Pattern**: 1 → 2 columns  
**Breakpoints**: md (2 cols)  
**Gap**: 1.5rem  
**Replaces**: `grid grid-cols-1 md:grid-cols-2 gap-6`

**Use for**: Form layouts, input grids

```tsx
<form className="grid-form">
  <input type="text" name="firstName" />
  <input type="text" name="lastName" />
  <input type="email" name="email" />
  <input type="tel" name="phone" />
</form>
```

**Responsive Behavior**:
- Mobile (< 768px): 1 column, 1.5rem gap
- Tablet/Desktop (768px+): 2 columns, 1.5rem gap

### `.grid-hero`

**Pattern**: 1 → 2 → 4 columns  
**Breakpoints**: sm (2 cols), xl (4 cols)  
**Gap**: 1rem → 1.25rem  
**Replaces**: `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5`

**Use for**: Hero tiles, dashboard overview cards

```tsx
<div className="grid-hero">
  <HeroTile icon="users" label="Team Members" value="24" />
  <HeroTile icon="calendar" label="Events" value="12" />
  <HeroTile icon="trophy" label="Achievements" value="8" />
  <HeroTile icon="star" label="Rating" value="4.8" />
</div>
```

**Responsive Behavior**:
- Mobile (< 640px): 1 column, 1rem gap
- Small (640px+): 2 columns, 1rem gap
- Extra large (1280px+): 4 columns, 1.25rem gap

### `.grid-cards`

**Pattern**: 1 → 2 → 3 columns  
**Breakpoints**: sm (2 cols), lg (3 cols)  
**Gap**: 1rem  
**Replaces**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

**Use for**: Card grids, item listings

```tsx
<div className="grid-cards">
  <Card title="Play #1" />
  <Card title="Play #2" />
  <Card title="Play #3" />
  <Card title="Play #4" />
</div>
```

**Responsive Behavior**:
- Mobile (< 640px): 1 column, 1rem gap
- Small (640px+): 2 columns, 1rem gap
- Large (1024px+): 3 columns, 1rem gap

### Grid Variants

#### `.grid-dashboard-tight`

Same as `.grid-dashboard` but with tighter gaps (0.75rem → 1rem).

```tsx
<div className="grid-dashboard-tight">
  {/* Compact dashboard cards */}
</div>
```

#### `.grid-dashboard-wide`

Same as `.grid-dashboard` but extends to 4 columns on xl screens.

```tsx
<div className="grid-dashboard-wide">
  {/* Wide dashboard with 4 columns */}
</div>
```

---

## Responsive Padding

### `.container-padding`

**Purpose**: Responsive horizontal padding  
**Replaces**: `px-4 sm:px-6 lg:px-8`

**Padding Scale**:
- Mobile (< 640px): 1rem (16px)
- Tablet (640px+): 1.5rem (24px)
- Desktop (1024px+): 2rem (32px)

**Usage**:

```tsx
<div className="container-page container-padding">
  {/* Content with responsive padding */}
</div>
```

**Common Pattern**:

```tsx
// Page wrapper with padding and vertical spacing
<div className="container-page container-padding py-8">
  <h1>Page Title</h1>
  <div className="grid-dashboard">
    {/* content */}
  </div>
</div>
```

---

## Migration Guide

### Step 1: Identify Pattern

Look for these common patterns in your component:

**Pattern A: Page Container**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

**Pattern B: Content Container**
```tsx
<div className="max-w-2xl mx-auto">
```

**Pattern C: Dashboard Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
```

**Pattern D: Form Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

### Step 2: Replace with Token

| Old Pattern | New Pattern |
|------------|-------------|
| `max-w-7xl mx-auto` | `.container-page` |
| `max-w-6xl mx-auto` | `.container-wide` |
| `max-w-2xl mx-auto` | `.container-content` |
| `px-4 sm:px-6 lg:px-8` | `.container-padding` |
| `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5` | `.grid-dashboard` |
| `grid grid-cols-1 md:grid-cols-2 gap-6` | `.grid-form` |
| `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5` | `.grid-hero` |

### Step 3: Test Responsive Behavior

After migration, test at all breakpoints:

1. **Mobile** (< 640px): Check single-column layout
2. **Tablet** (768px): Check 2-column layout
3. **Desktop** (1024px+): Check 3+ column layout

### Migration Example

#### Before:

```tsx
export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <StatsCard title="Users" value="1,234" />
        <StatsCard title="Teams" value="56" />
        <StatsCard title="Plays" value="789" />
      </div>
    </div>
  );
}
```

#### After:

```tsx
export default function DashboardPage() {
  return (
    <div className="container-page container-padding py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid-dashboard">
        <StatsCard title="Users" value="1,234" />
        <StatsCard title="Teams" value="56" />
        <StatsCard title="Plays" value="789" />
      </div>
    </div>
  );
}
```

**Lines saved**: 4 → 2 (50% reduction in layout code)

---

## Best Practices

### ✅ DO

**Use semantic utilities for common patterns**

```tsx
// Good
<div className="container-page container-padding">
<div className="grid-dashboard">
```

**Combine with other Tailwind utilities**

```tsx
// Good
<div className="container-page container-padding py-8 space-y-6">
```

**Use for page-level layouts**

```tsx
// Good - Main page container
<PageLayout title="Dashboard">
  <div className="grid-dashboard">
    {/* content */}
  </div>
</PageLayout>
```

**Keep vertical spacing separate**

```tsx
// Good
<div className="container-page container-padding py-8">
```

### ❌ DON'T

**Don't add custom max-width to utility containers**

```tsx
// Bad
<div className="container-page max-w-4xl">  // Conflicts!
```

**Don't mix old and new patterns**

```tsx
// Bad
<div className="max-w-7xl mx-auto container-padding">  // Inconsistent
```

**Don't use for component-level layouts**

```tsx
// Bad - Too granular
<Card>
  <div className="grid-dashboard">  // Use regular Tailwind here
    <CardContent />
  </div>
</Card>
```

**Don't override grid template columns**

```tsx
// Bad
<div className="grid-dashboard grid-cols-4">  // Breaks responsive behavior
```

### When to Use Layout Tokens

✅ **Use for**:
- Page containers
- Main content areas
- Dashboard grids
- Form layouts
- Card grids
- Hero sections

❌ **Don't use for**:
- Component-internal layouts (use regular Tailwind)
- One-off custom grids (use regular Tailwind)
- Complex nested grids (use regular Tailwind)

---

## Safe Zones

### ⚠️ Do NOT Modify These Components

The following components are **off-limits** and should not be modified during layout token migration:

#### **AppHeader**
- **Location**: `src/components/layout/AppHeader.tsx`
- **Reason**: Global search and navigation working perfectly
- **Status**: ✅ Working - Don't touch

#### **Sidebar**
- **Location**: `src/components/layout/Sidebar.tsx`
- **Reason**: Overlay behavior and navigation items working correctly
- **Status**: ✅ Working - Don't touch

#### **Layout (wrapper)**
- **Location**: `src/components/layout/Layout.tsx`
- **Reason**: Main app wrapper integrating AppHeader + Sidebar
- **Status**: ✅ Working - Don't touch

### ✅ Safe to Modify

These components are **safe** to migrate:

- **PageLayout**: Page content wrapper (inside Layout)
- **Dashboard components**: DashboardGrid, ResponsiveDashboardLayout
- **Page components**: All page files in `src/pages/`
- **Form components**: Form layouts and grids
- **Content components**: Anything INSIDE the Layout wrapper

### Testing Checklist

After migration, verify:

- [ ] AppHeader still visible and functional
- [ ] Global search still works
- [ ] Sidebar still toggles correctly
- [ ] Sidebar overlay behavior unchanged
- [ ] Navigation items still clickable
- [ ] Page content displays correctly
- [ ] Responsive breakpoints working
- [ ] No visual regressions

---

## Examples

### Example 1: Dashboard Page

```tsx
import { PageLayout } from '../components/layout/PageLayout';
import { StatsCard } from '../components/dashboard/StatsCard';

export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard" variant="dashboard">
      <div className="grid-dashboard">
        <StatsCard title="Total Users" value="1,234" trend="+12%" />
        <StatsCard title="Active Teams" value="56" trend="+8%" />
        <StatsCard title="Total Plays" value="789" trend="+15%" />
      </div>
    </PageLayout>
  );
}
```

### Example 2: Form Page

```tsx
import { PageLayout } from '../components/layout/PageLayout';
import { FormField } from '../components/forms/FormField';

export default function CreateAccountPage() {
  return (
    <PageLayout title="Create Account" variant="form">
      <div className="container-content">
        <form className="grid-form">
          <FormField label="First Name" name="firstName" />
          <FormField label="Last Name" name="lastName" />
          <FormField label="Email" name="email" className="md:col-span-2" />
          <FormField label="Password" name="password" type="password" />
          <FormField label="Confirm Password" name="confirmPassword" type="password" />
        </form>
      </div>
    </PageLayout>
  );
}
```

### Example 3: Hero Section

```tsx
export default function HomePage() {
  return (
    <div className="container-page container-padding py-12">
      <div className="content-narrow text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to BoxCall</h1>
        <p className="text-xl text-text-secondary">
          The ultimate platform for coaches and teams
        </p>
      </div>
      
      <div className="grid-hero">
        <FeatureTile icon="users" title="Team Management" />
        <FeatureTile icon="calendar" title="Event Planning" />
        <FeatureTile icon="chart" title="Analytics" />
        <FeatureTile icon="trophy" title="Achievements" />
      </div>
    </div>
  );
}
```

### Example 4: Card Grid

```tsx
export default function PlaybookPage() {
  return (
    <PageLayout title="Playbook" variant="list">
      <div className="grid-cards">
        {plays.map(play => (
          <PlayCard key={play.id} play={play} />
        ))}
      </div>
    </PageLayout>
  );
}
```

### Example 5: Wide Dashboard

```tsx
export default function AnalyticsPage() {
  return (
    <div className="container-page container-padding py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      
      {/* Hero tiles */}
      <div className="grid-hero mb-8">
        <MetricTile label="Total Views" value="12,345" />
        <MetricTile label="Engagement" value="78%" />
        <MetricTile label="Conversion" value="4.2%" />
        <MetricTile label="Revenue" value="$45,678" />
      </div>
      
      {/* Charts */}
      <div className="grid-dashboard">
        <ChartCard title="Views Over Time" />
        <ChartCard title="User Demographics" />
        <ChartCard title="Top Pages" />
      </div>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Container not centered

**Problem**: Content appears left-aligned instead of centered.

**Solution**: Ensure you're using a container utility that includes `mx-auto`:

```tsx
// Wrong
<div className="max-w-container-7xl">

// Right
<div className="container-page">  // Includes mx-auto
```

### Issue: No responsive padding

**Problem**: Content touches screen edges on mobile.

**Solution**: Add `.container-padding`:

```tsx
<div className="container-page container-padding">
```

### Issue: Grid not responsive

**Problem**: Grid stays single column on desktop.

**Solution**: Ensure you're using the grid utility, not just `display: grid`:

```tsx
// Wrong
<div className="grid">

// Right
<div className="grid-dashboard">
```

### Issue: Custom column count needed

**Problem**: Need 4 columns but `.grid-dashboard` gives 3.

**Solution**: Use `.grid-dashboard-wide` or regular Tailwind:

```tsx
// Option 1: Use wide variant
<div className="grid-dashboard-wide">

// Option 2: Use regular Tailwind for custom needs
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Issue: Gaps too large/small

**Problem**: Default gaps don't match design.

**Solution**: Override gap with Tailwind utility:

```tsx
<div className="grid-dashboard gap-2">  // Smaller gap
<div className="grid-dashboard gap-8">  // Larger gap
```

### Issue: AppHeader or Sidebar broken after migration

**Problem**: Navigation doesn't work after changes.

**Solution**: **You modified a safe zone component!** Revert changes to:
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Layout.tsx`

Only modify content **inside** the Layout wrapper (PageLayout, page components, etc.).

---

## CSS Variables Reference

For custom styling, you can use the CSS variables directly:

```css
/* Container Widths */
var(--layout-container-xs)     /* 20rem / 320px */
var(--layout-container-sm)     /* 24rem / 384px */
var(--layout-container-md)     /* 28rem / 448px */
var(--layout-container-lg)     /* 32rem / 512px */
var(--layout-container-xl)     /* 36rem / 576px */
var(--layout-container-2xl)    /* 42rem / 672px */
var(--layout-container-3xl)    /* 48rem / 768px */
var(--layout-container-4xl)    /* 56rem / 896px */
var(--layout-container-5xl)    /* 64rem / 1024px */
var(--layout-container-6xl)    /* 72rem / 1152px */
var(--layout-container-7xl)    /* 80rem / 1280px */
var(--layout-container-full)   /* 100% */

/* Semantic Content Widths */
var(--layout-content-narrow)   /* 42rem */
var(--layout-content-medium)   /* 56rem */
var(--layout-content-wide)     /* 72rem */
var(--layout-content-full)     /* 80rem */

/* Grid Gaps */
var(--layout-gap-xs)           /* 0.5rem / 8px */
var(--layout-gap-sm)           /* 0.75rem / 12px */
var(--layout-gap-md)           /* 1rem / 16px */
var(--layout-gap-lg)           /* 1.25rem / 20px */
var(--layout-gap-xl)           /* 1.5rem / 24px */
var(--layout-gap-2xl)          /* 2rem / 32px */

/* Padding */
var(--layout-padding-xs)       /* 0.75rem / 12px */
var(--layout-padding-sm)       /* 1rem / 16px */
var(--layout-padding-md)       /* 1.5rem / 24px */
var(--layout-padding-lg)       /* 2rem / 32px */
```

---

## Additional Resources

- **Design Document**: `docs/LAYOUT_TOKEN_DESIGN.md` - Full design rationale
- **Migration Examples**: See Phase 6 commits for real-world migrations
- **Tailwind Config**: `tailwind.config.js` - Token definitions
- **Plugin Source**: `src/styles/tailwind/layoutTokens.js` - Implementation details

---

## Support

Questions? Issues? Check:

1. This documentation
2. `docs/LAYOUT_TOKEN_DESIGN.md` for design rationale
3. Existing migrations in git history
4. Ask the team in #engineering channel

---

*Last updated: October 6, 2025*  
*Version: 1.0.0*  
*Status: ✅ Production Ready*
