# Border Radius Guidelines

## Overview

BoxCall uses a **semantic token-based system** for border radius to ensure visual consistency across the app. All border radius values are defined as CSS custom properties and mapped to Tailwind utilities.

## Token Scale

### Standard Radii

| Token | CSS Value | Tailwind Class | Use Case |
|-------|-----------|----------------|----------|
| `--radius-none` | `0` | `rounded-none` | Sharp corners, dividers |
| `--radius-sm` | `0.375rem` (6px) | `rounded-sm` | Small badges, tight UI elements |
| `--radius-md` | `0.75rem` (12px) | `rounded-md` | Standard buttons, inputs, small cards |
| `--radius-lg` | `1rem` (16px) | `rounded-lg` | Standard cards, modals, dropdowns |
| `--radius-xl` | `1.5rem` (24px) | `rounded-xl` | Large cards, hero sections |
| `--radius-2xl` | `2rem` (32px) | `rounded-2xl` | Extra large cards, app icons |
| `--radius-3xl` | `2.5rem` (40px) | `rounded-3xl` | Oversized elements, special features |
| `--radius-full` | `9999px` | `rounded-full` | Circular elements, pills, avatars |

### Glass Morphism Radii

| Token | CSS Value | Tailwind Class | Use Case |
|-------|-----------|----------------|----------|
| `--radius-glass-sm` | `var(--radius-lg)` (16px) | `rounded-glass-sm` | Small glass cards |
| `--radius-glass` | `var(--radius-xl)` (24px) | `rounded-glass` | Standard glass cards, Aurora tiles |
| `--radius-glass-lg` | `var(--radius-xl)` (24px) | `rounded-glass-lg` | Large glass overlays, modals |

## Usage Guidelines

### When to Use Each Radius

#### `rounded-sm` (6px)
- **Badges and tags** - Subtle rounding for small UI elements
- **Tight table cells** - Minimal visual polish
- **Icon buttons** - Small interactive elements

```tsx
<Badge variant="success" className="rounded-sm">Active</Badge>
<Skeleton className="w-4 h-4 rounded-sm" />
```

#### `rounded-md` (12px)
- **Standard buttons** - Default button radius
- **Form inputs** - Text fields, selects, textareas
- **Small cards** - Compact list items
- **Dropdown items** - Menu options

```tsx
<Button variant="primary" className="rounded-md">Save</Button>
<input className="px-3 py-2 border rounded-md" />
```

#### `rounded-lg` (16px)
- **Standard cards** - Default card radius
- **Modals** - Dialog boxes, popovers
- **Larger buttons** - CTA buttons
- **Container surfaces** - Section backgrounds

```tsx
<GlassCard variant="elevated" className="rounded-lg">
  <CardContent />
</GlassCard>
```

#### `rounded-xl` (24px)
- **Hero cards** - Featured content
- **Dashboard tiles** - Main dashboard sections
- **Large containers** - Section wrappers

```tsx
<div className="surface-card rounded-xl p-6">
  <DashboardStats />
</div>
```

#### `rounded-2xl` (32px)
- **App icon tiles** - iOS-style app icons
- **Large modal dialogs** - Full-featured modals
- **Hero sections** - Landing page elements

```tsx
<div className="w-32 h-32 rounded-2xl bg-gradient-to-br">
  <AppIcon />
</div>
```

#### `rounded-3xl` (40px)
- **Oversized cards** - Special hero cards
- **Feature callouts** - Marketing elements
- Use sparingly for visual hierarchy

#### `rounded-full` (Circular)
- **Avatars** - User profile pictures
- **Icon buttons** - Floating action buttons
- **Pills and chips** - Tag-style elements
- **Progress indicators** - Circular loaders

```tsx
<UserAvatar size="md" className="rounded-full" />
<button className="w-10 h-10 rounded-full bg-jade-500">+</button>
<span className="px-3 py-1 rounded-full bg-warning-100">New</span>
```

### Glass Morphism Variants

Use these for Aurora Design Language components with `backdrop-blur` effects:

#### `rounded-glass` (24px)
- **GlassCard** - Standard glass cards
- **AuroraTile** - Dashboard tiles
- **Floating toolbars** - Tool palettes

```tsx
<GlassCard variant="glass" className="rounded-glass backdrop-blur-xl">
  <PlayCard />
</GlassCard>
```

#### `rounded-glass-lg` (24px)
- **Large glass modals** - Full-screen overlays
- **Advanced filters** - Floating filter panels
- **Diagram builders** - Canvas containers

```tsx
<div className="rounded-glass-lg backdrop-blur-xl bg-white/90">
  <AdvancedFilters />
</div>
```

## Migration Patterns

### Before (Hardcoded)
```tsx
// ❌ Don't do this
<div className="rounded-[28px] backdrop-blur-xl" />
<Card className="rounded-[20px]" />
<Button className="rounded-[10px]" />
```

### After (Token-based)
```tsx
// ✅ Do this instead
<div className="rounded-glass backdrop-blur-xl" />
<Card className="rounded-glass" />
<Button className="rounded-lg" />
```

## Best Practices

### 1. **Use Semantic Tokens**
Always use the named tokens instead of arbitrary values:
```tsx
// ❌ Bad
className="rounded-[24px]"

// ✅ Good
className="rounded-xl"
```

### 2. **Maintain Visual Hierarchy**
- Smaller elements → smaller radius (`sm`, `md`)
- Standard elements → medium radius (`lg`, `xl`)
- Hero elements → larger radius (`2xl`, `3xl`)

### 3. **Glass Components**
For components with `backdrop-blur`, use the glass variants:
```tsx
<div className="rounded-glass backdrop-blur-xl bg-white/80">
  {/* Glass morphism content */}
</div>
```

### 4. **Responsive Consistency**
Keep the same radius across breakpoints for consistency:
```tsx
// ✅ Good - consistent radius
<Card className="rounded-lg p-4 sm:p-6" />

// ⚠️ Avoid changing radius responsively unless intentional
<Card className="rounded-md sm:rounded-lg lg:rounded-xl" />
```

### 5. **Component Combinations**
Match parent and child radius for cohesive designs:
```tsx
<Card className="rounded-lg">
  <CardHeader className="rounded-t-lg">Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Common Patterns

### Cards
```tsx
// Standard card
<div className="surface-card rounded-lg p-6">...</div>

// Glass card
<GlassCard variant="glass" className="rounded-glass">...</GlassCard>

// Hero card
<div className="surface-card rounded-xl p-8">...</div>
```

### Buttons
```tsx
// Standard button
<Button className="rounded-md">Action</Button>

// Icon button
<button className="w-8 h-8 rounded-lg">
  <Icon name="edit" />
</button>

// FAB
<button className="w-12 h-12 rounded-full">+</button>
```

### Inputs
```tsx
// Text input
<input className="rounded-md border px-3 py-2" />

// Select dropdown
<select className="rounded-md border px-3 py-2" />

// Textarea
<textarea className="rounded-md border px-3 py-2" />
```

### Badges & Pills
```tsx
// Badge
<Badge className="rounded-sm px-2 py-0.5">New</Badge>

// Pill
<span className="rounded-full px-3 py-1">Active</span>
```

## Design Token Architecture

### CSS Custom Properties
```css
/* src/styles/generated-tokens.css */
:root {
  /* Standard scale - 8px grid alignment */
  --radius-none: 0;
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.75rem;    /* 12px */
  --radius-lg: 1rem;       /* 16px */
  --radius-xl: 1.5rem;     /* 24px */
  --radius-2xl: 2rem;      /* 32px */
  --radius-3xl: 2.5rem;    /* 40px */
  --radius-full: 9999px;
  
  /* Glass variants - Aurora Design Language */
  --radius-glass-sm: var(--radius-lg);  /* 16px for small glass cards */
  --radius-glass: var(--radius-xl);     /* 24px for standard glass cards */
  --radius-glass-lg: var(--radius-xl);  /* 24px for large glass overlays */
}
```

### Tailwind Configuration
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
        'glass-sm': 'var(--radius-glass-sm)',
        glass: 'var(--radius-glass)',
        'glass-lg': 'var(--radius-glass-lg)',
      },
    },
  },
};
```

## Related Documentation

- [Aurora Design Language](../product/AURORA_DESIGN.md) - Overall design system
- [GlassCard Component](../components/GLASS_CARD.md) - Glass morphism implementation
- [Design Tokens](./DESIGN_TOKENS.md) - Complete token reference

## Migration History

**Phase 3 - Task #6** (January 2025)
- Migrated 17+ components from hardcoded `rounded-[Xpx]` to semantic tokens
- Established 12-token scale (8 standard + 4 glass variants)
- Achieved 100% token adoption in playbook components

---

**Last Updated:** October 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
