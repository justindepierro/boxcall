# Spacing System - 8px Grid

**Phase 3 Design System** - Consistent spacing enforcing an 8px base grid for rhythm and alignment across BoxCall.

## Overview

The spacing system provides a consistent scale based on an **8px base grid**. All spacing values are multiples of 4px (0.25rem) or 8px (0.5rem), ensuring visual rhythm and alignment across all components.

### Design Principles

1. **8px Base Grid** - All spacing is based on 8px increments
2. **Consistent Rhythm** - Predictable spacing creates visual harmony
3. **Systematic Scale** - Each step serves a specific purpose
4. **Responsive Friendly** - Grid scales naturally across breakpoints
5. **Component Agnostic** - Same spacing rules apply everywhere

---

## Core Spacing Scale

The **8px grid** uses 16 core values (0→32):

| Token | Value    | Pixels | Usage                         |
| ----- | -------- | ------ | ----------------------------- |
| `0`   | 0px      | 0px    | None - reset spacing          |
| `0.5` | 0.125rem | 2px    | Hairline - ultra-tight (rare) |
| `1`   | 0.25rem  | 4px    | XS - tight spacing            |
| `2`   | 0.5rem   | 8px    | **SM - base minimum** ⭐      |
| `3`   | 0.75rem  | 12px   | MD - compact                  |
| `4`   | 1rem     | 16px   | **Base - comfortable** ⭐     |
| `5`   | 1.25rem  | 20px   | LG - generous                 |
| `6`   | 1.5rem   | 24px   | **XL - spacious** ⭐          |
| `8`   | 2rem     | 32px   | 2XL - section spacing         |
| `10`  | 2.5rem   | 40px   | 3XL - large sections          |
| `12`  | 3rem     | 48px   | 4XL - page spacing            |
| `16`  | 4rem     | 64px   | 5XL - hero spacing            |
| `20`  | 5rem     | 80px   | 6XL - extra large             |
| `24`  | 6rem     | 96px   | 7XL - maximum                 |
| `32`  | 8rem     | 128px  | 8XL - extreme                 |

**Most Common:** `2` (8px), `4` (16px), `6` (24px) - these three cover 80% of spacing needs.

---

## Deprecated Values (Non-8px Grid)

These values are **deprecated** and should be migrated to the nearest 8px multiple:

| Deprecated | Value    | Pixels | **Use Instead** | Reason          |
| ---------- | -------- | ------ | --------------- | --------------- |
| `1.5`      | 0.375rem | 6px    | `2` (8px)       | Not 8px aligned |
| `2.5`      | 0.625rem | 10px   | `3` (12px)      | Not 8px aligned |
| `3.5`      | 0.875rem | 14px   | `4` (16px)      | Not 8px aligned |
| `4.5`      | 1.125rem | 18px   | `5` (20px)      | Not 8px aligned |
| `5.5`      | 1.375rem | 22px   | `6` (24px)      | Not 8px aligned |

**Migration Rule:** Round up to the nearest 8px multiple for better visual consistency.

---

## Usage Guidelines

### Padding (Internal Spacing)

Use padding to create breathing room inside components:

```tsx
// Component padding - common patterns
<div className="p-2">        {/* 8px - compact */}
<div className="p-4">        {/* 16px - comfortable (default) */}
<div className="p-6">        {/* 24px - spacious */}

// Directional padding
<div className="px-4 py-2">  {/* Horizontal: 16px, Vertical: 8px */}
<div className="pt-6 pb-8">  {/* Top: 24px, Bottom: 32px */}

// Glass Card padding variants
<GlassCard padding="sm">     {/* p-4 (16px) */}
<GlassCard padding="md">     {/* p-6 (24px) - default */}
<GlassCard padding="lg">     {/* p-8 (32px) */}
```

### Margin (External Spacing)

Use margin to create space between components:

```tsx
// Stack spacing (vertical)
<div className="space-y-2">  {/* 8px between children */}
<div className="space-y-4">  {/* 16px between children */}
<div className="space-y-6">  {/* 24px between children */}

// Individual margins
<div className="mb-2">       {/* 8px bottom */}
<div className="mt-4">       {/* 16px top */}
<div className="mx-auto">    {/* Horizontal center */}
```

### Gap (Flexbox/Grid Spacing)

Use gap for spacing between flex or grid items:

```tsx
// Flexbox gap
<div className="flex gap-2">         {/* 8px - tight */}
<div className="flex gap-3">         {/* 12px - compact */}
<div className="flex gap-4">         {/* 16px - comfortable */}

// Grid gap
<div className="grid gap-4">         {/* 16px - default */}
<div className="grid gap-6">         {/* 24px - spacious */}
<div className="grid gap-x-4 gap-y-6"> {/* Different x/y */}
```

---

## Common Patterns

### Card Component

```tsx
<div
  className="
  rounded-glass-lg border border-base 
  bg-surface-elevated p-6         {/* 24px padding */}
  space-y-4                       {/* 16px vertical spacing */}
"
>
  <h2 className="mb-2">Title</h2> {/* 8px margin bottom */}
  <p>Content</p>
</div>
```

### Button Row

```tsx
<div className="flex items-center gap-2">
  {" "}
  {/* 8px between buttons */}
  <button className="px-4 py-2">Primary</button>
  <button className="px-4 py-2">Secondary</button>
</div>
```

### Form Field

```tsx
<div className="space-y-2">
  {" "}
  {/* 8px between label/input/error */}
  <label className="block mb-1">Name</label>
  <input className="px-3 py-2" /> {/* 12px horizontal, 8px vertical */}
  <span className="text-xs mt-1">Helper text</span>
</div>
```

### Icon with Text

```tsx
// ❌ Old (non-grid)
<div className="flex items-center gap-1.5">  {/* 6px - deprecated */}
  <Icon name="check" />
  <span>Success</span>
</div>

// ✅ New (8px grid)
<div className="flex items-center gap-2">    {/* 8px - standard */}
  <Icon name="check" />
  <span>Success</span>
</div>
```

### Section Spacing

```tsx
<section className="py-12">
  {" "}
  {/* 48px top/bottom */}
  <h1 className="mb-6">Title</h1> {/* 24px margin bottom */}
  <div className="space-y-8">
    {" "}
    {/* 32px between subsections */}
    <div>Subsection 1</div>
    <div>Subsection 2</div>
  </div>
</section>
```

---

## Responsive Spacing

Use responsive utilities for different breakpoints:

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

// Responsive gaps
<div className="flex gap-2 md:gap-4 lg:gap-6">
  {/* Mobile: 8px, Tablet: 16px, Desktop: 24px */}
</div>

// Responsive margins
<div className="mb-4 md:mb-6 lg:mb-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>
```

---

## Migration Guide

### Before (Non-Grid Values)

```tsx
// ❌ Old pattern - non-8px grid values
<div className="flex items-center gap-1.5">       {/* 6px */}
  <Icon name="edit" className="w-3.5 h-3.5" />   {/* 14px */}
  <span>Edit</span>
</div>

<div className="mb-1.5 px-2.5 py-1.5">           {/* 6px, 10px, 6px */}
  Content
</div>

<div className="space-y-3.5">                    {/* 14px */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### After (8px Grid)

```tsx
// ✅ New pattern - 8px grid aligned
<div className="flex items-center gap-2">        {/* 8px */}
  <Icon name="edit" className="w-4 h-4" />       {/* 16px */}
  <span>Edit</span>
</div>

<div className="mb-2 px-3 py-2">                 {/* 8px, 12px, 8px */}
  Content
</div>

<div className="space-y-4">                      {/* 16px */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Component Migrations

#### IconButton Component

```tsx
// ❌ Before
const sizeStyles = {
  sm: "h-8 w-8 p-1.5 text-xs", // 6px padding
};

// ✅ After
const sizeStyles = {
  sm: "h-8 w-8 p-2 text-xs", // 8px padding
};
```

#### Play Detail Modal

```tsx
// ❌ Before
<div className="flex gap-1.5">          {/* 6px gap */}
  <button>Overview</button>
  <button>Details</button>
</div>

<div className="mb-1.5">Type</div>      {/* 6px margin */}

// ✅ After
<div className="flex gap-2">            {/* 8px gap */}
  <button>Overview</button>
  <button>Details</button>
</div>

<div className="mb-2">Type</div>        {/* 8px margin */}
```

#### Role Badge

```tsx
// ❌ Before
<span className="inline-flex items-center gap-1.5">  {/* 6px gap */}
  <Icon name="crown" />
  <span>Owner</span>
</span>

// ✅ After
<span className="inline-flex items-center gap-2">    {/* 8px gap */}
  <Icon name="crown" />
  <span>Owner</span>
</span>
```

---

## Spacing Decision Tree

When choosing a spacing value, follow this decision tree:

### 1. **What are you spacing?**

- **Icon + Text**: `gap-2` (8px)
- **Buttons in a row**: `gap-2` (8px)
- **Form label + input**: `space-y-2` (8px)
- **Card sections**: `space-y-4` (16px)
- **Page sections**: `space-y-8` (32px)

### 2. **What direction?**

- **Horizontal (x-axis)**: `px-*`, `mx-*`, `gap-x-*`, `space-x-*`
- **Vertical (y-axis)**: `py-*`, `my-*`, `gap-y-*`, `space-y-*`
- **All directions**: `p-*`, `m-*`, `gap-*`

### 3. **How tight or loose?**

- **Very tight**: `1` (4px) - rare
- **Tight**: `2` (8px) - icons, inline elements
- **Comfortable**: `4` (16px) - default choice
- **Spacious**: `6` (24px) - sections, cards
- **Very spacious**: `8` (32px) - major sections
- **Extreme**: `12+` (48px+) - hero elements

---

## CSS Custom Properties

All spacing tokens are defined in `src/styles/generated-tokens.css`:

```css
/* Core 8px Grid Scale */
--space-0: 0px; /* 0px - none */
--space-0\.5: 0.125rem; /* 2px - hairline */
--space-1: 0.25rem; /* 4px - xs tight */
--space-2: 0.5rem; /* 8px - sm minimum */
--space-3: 0.75rem; /* 12px - md compact */
--space-4: 1rem; /* 16px - base comfortable */
--space-5: 1.25rem; /* 20px - lg generous */
--space-6: 1.5rem; /* 24px - xl spacious */
--space-8: 2rem; /* 32px - 2xl section */
--space-10: 2.5rem; /* 40px - 3xl large */
--space-12: 3rem; /* 48px - 4xl page */
--space-16: 4rem; /* 64px - 5xl hero */
--space-20: 5rem; /* 80px - 6xl extra large */
--space-24: 6rem; /* 96px - 7xl maximum */
--space-32: 8rem; /* 128px - 8xl extreme */

/* Deprecated (phase out) */
--space-1\.5: 0.375rem; /* 6px - DEPRECATED: use --space-2 (8px) */
--space-2\.5: 0.625rem; /* 10px - DEPRECATED: use --space-3 (12px) */
--space-3\.5: 0.875rem; /* 14px - DEPRECATED: use --space-4 (16px) */
--space-4\.5: 1.125rem; /* 18px - DEPRECATED: use --space-5 (20px) */
--space-5\.5: 1.375rem; /* 22px - DEPRECATED: use --space-6 (24px) */
```

---

## Tailwind Configuration

Spacing utilities map to CSS custom properties in `tailwind.config.js`:

```javascript
spacing: {
  // Core 8px Grid Scale (preferred)
  0: "var(--space-0)",          // 0px - none
  px: "1px",                     // 1px - hairline borders
  0.5: "var(--space-0\\.5)",    // 2px - ultra-tight
  1: "var(--space-1)",           // 4px - xs tight
  2: "var(--space-2)",           // 8px - sm minimum
  3: "var(--space-3)",           // 12px - md compact
  4: "var(--space-4)",           // 16px - base comfortable
  5: "var(--space-5)",           // 20px - lg generous
  6: "var(--space-6)",           // 24px - xl spacious
  8: "var(--space-8)",           // 32px - 2xl section
  10: "var(--space-10)",         // 40px - 3xl large
  12: "var(--space-12)",         // 48px - 4xl page
  16: "var(--space-16)",         // 64px - 5xl hero
  20: "var(--space-20)",         // 80px - 6xl extra large
  24: "var(--space-24)",         // 96px - 7xl maximum
  32: "var(--space-32)",         // 128px - 8xl extreme

  // Deprecated (phase out these values)
  1.5: "var(--space-1\\.5)",    // 6px - DEPRECATED: use 2 (8px)
  2.5: "var(--space-2\\.5)",    // 10px - DEPRECATED: use 3 (12px)
  3.5: "var(--space-3\\.5)",    // 14px - DEPRECATED: use 4 (16px)
  4.5: "var(--space-4\\.5)",    // 18px - DEPRECATED: use 5 (20px)
  5.5: "var(--space-5\\.5)",    // 22px - DEPRECATED: use 6 (24px)
}
```

---

## Benefits of 8px Grid

### 1. **Visual Consistency**

All spacing follows the same rhythm, creating harmony across the UI.

### 2. **Easier Decisions**

Fewer choices = faster development. Pick from 16 values instead of arbitrary pixels.

### 3. **Scalability**

Grid scales naturally across devices without breaking rhythm.

### 4. **Pixel-Perfect Alignment**

8px grid ensures elements align to pixel boundaries on all screen densities.

### 5. **Design-Dev Handoff**

Designers and developers speak the same language (8px grid).

---

## Common Mistakes

### ❌ Avoid These Patterns

```tsx
// ❌ Bad: Arbitrary pixel values
<div style={{ padding: "13px", gap: "7px" }}>

// ❌ Bad: Non-grid Tailwind values
<div className="p-2.5 gap-1.5 mb-3.5">

// ❌ Bad: Mixing grid and non-grid
<div className="p-4 gap-1.5 mb-2">  {/* Inconsistent */}

// ❌ Bad: Too many different values
<div className="p-2">
  <div className="p-3">
    <div className="p-5">      {/* Too many variations */}
```

### ✅ Use These Patterns

```tsx
// ✅ Good: Consistent 8px grid
<div className="p-4 gap-2 mb-4">

// ✅ Good: Stick to 2-3 values per component
<div className="p-6">              {/* Outer: 24px */}
  <div className="space-y-4">     {/* Sections: 16px */}
    <div className="gap-2">       {/* Items: 8px */}
```

---

## Quick Reference

### Most Common Spacing Values

| Value       | Pixels | Common Use Cases                          |
| ----------- | ------ | ----------------------------------------- |
| `gap-2`     | 8px    | Icon + text, button rows, inline elements |
| `p-4`       | 16px   | Default component padding                 |
| `space-y-4` | 16px   | Stacked sections                          |
| `p-6`       | 24px   | Card padding, modal padding               |
| `space-y-6` | 24px   | Major sections                            |
| `gap-4`     | 16px   | Grid/flex containers                      |
| `mb-2`      | 8px    | Label margins, small gaps                 |
| `py-2`      | 8px    | Button vertical padding                   |
| `px-4`      | 16px   | Button horizontal padding                 |

### Migration Quick Wins

| Old (Deprecated) | New (8px Grid) | Savings             |
| ---------------- | -------------- | ------------------- |
| `gap-1.5`        | `gap-2`        | 2px wider (cleaner) |
| `p-1.5`          | `p-2`          | 2px more padding    |
| `mb-1.5`         | `mb-2`         | 2px more margin     |
| `py-2.5`         | `py-3`         | 4px more padding    |
| `gap-3.5`        | `gap-4`        | 4px wider           |

**Rule of Thumb:** When in doubt, round up to the next 8px multiple.

---

## Related Documentation

- [Border Radius System](./BORDER_RADIUS_SYSTEM.md) - Rounded corners
- [Shadow System](./SHADOW_SYSTEM.md) - Elevation and depth
- [Color Semantic Tokens](./COLOR_SEMANTIC_TOKENS.md) - Color system
- [Animation System](./ANIMATION_SYSTEM.md) - Motion and timing
- [Aurora Design Language](./ARCHITECTURE.md#aurora-design-language) - Overall design system

---

## Summary

**16 Spacing Tokens Defined:**

- Core scale: 0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32 (15 values)
- Most common: `2` (8px), `4` (16px), `6` (24px)

**5 Deprecated Values:**

- 1.5, 2.5, 3.5, 4.5, 5.5 - use nearest 8px multiple

**3 Components Migrated:**

- `PlayDetailModal.tsx` - gap-1.5 → gap-2, mb-1.5 → mb-2
- `IconButton.tsx` - p-1.5 → p-2
- `RoleBadge.tsx` - gap-1.5 → gap-2

**8px Grid Benefits:**

- Visual consistency across all components
- Easier spacing decisions (16 choices vs. infinite)
- Pixel-perfect alignment on all screens
- Scalable rhythm across breakpoints
- Design-dev alignment

**Next Steps:**

- Phase out deprecated values (1.5, 2.5, 3.5, 4.5, 5.5)
- Migrate remaining 100+ components to 8px grid
- Add linting rule to warn on non-grid values
- Update component library examples
