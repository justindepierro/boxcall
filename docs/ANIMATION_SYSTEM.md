# Animation System

**Phase 3 Design System** - Standardized animation timing, easing, and scale transforms for consistent motion across BoxCall.

## Overview

The animation system provides semantic tokens for timing, easing, and scale transforms. These tokens ensure consistent motion across all components and interactions.

### Design Principles

1. **Purposeful Motion** - Every animation serves a functional purpose
2. **Consistent Timing** - Predictable speed for similar interactions
3. **Natural Easing** - Smooth, physics-based motion curves
4. **Performance First** - Optimized for 60fps animations
5. **Accessibility** - Respects `prefers-reduced-motion`

---

## Duration Scale

Semantic duration tokens for different animation speeds:

| Token              | Value | Usage                 | Examples                               |
| ------------------ | ----- | --------------------- | -------------------------------------- |
| `duration-instant` | 75ms  | Immediate feedback    | Tooltip shows, loading dots            |
| `duration-fast`    | 150ms | Quick interactions    | Icon button hover, checkbox toggle     |
| `duration-base`    | 200ms | Default speed         | Button hover, card hover, shadows      |
| `duration-medium`  | 300ms | Moderate animations   | Tile lift, overlay fades, glow effects |
| `duration-slow`    | 500ms | Deliberate animations | Progress bars, modal open/close        |
| `duration-slower`  | 700ms | Very slow transitions | Complex state changes                  |

### Usage Examples

```tsx
// Button with default speed
<button className="transition-all duration-base hover:scale-base">
  Click Me
</button>

// Card with medium lift animation
<div className="transition-all duration-medium hover:-translate-y-1">
  Card Content
</div>

// Progress bar with slow fill
<div className="transition-all duration-slow" style={{ width: `${progress}%` }}>
  Progress
</div>
```

---

## Easing Functions

Motion curves for natural, physics-based animations:

| Token         | Curve                                     | Usage                           | Feel                          |
| ------------- | ----------------------------------------- | ------------------------------- | ----------------------------- |
| `ease-linear` | `linear`                                  | Progress indicators, loading    | Mechanical, constant speed    |
| `ease-in`     | `cubic-bezier(0.4, 0, 1, 1)`              | Exits, dismissals               | Accelerating, gaining speed   |
| `ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`              | **Default**, entrances, reveals | Decelerating, natural arrival |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`            | Reversible animations           | Smooth start and end          |
| `ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)`  | Playful interactions            | Bounce effect                 |
| `ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Attention-grabbing              | Spring effect                 |

### Default Easing

Use `ease-out` (default) for most animations:

- Elements entering the screen
- Hover states
- Scale transforms
- Opacity changes

### Usage Examples

```tsx
// Default ease-out (automatic)
<button className="transition-transform duration-base hover:scale-base">
  Standard Button
</button>

// Bounce effect for playful interactions
<button className="transition-all duration-base ease-bounce hover:scale-strong">
  Playful Button
</button>

// Spring effect for attention
<div className="transition-transform duration-medium ease-spring hover:scale-base">
  Spring Animation
</div>
```

---

## Scale Transforms

Semantic scale values for hover and active states:

| Token                | Value | Usage                      | Examples                           |
| -------------------- | ----- | -------------------------- | ---------------------------------- |
| `scale-subtle`       | 1.02  | Subtle card hover          | Play cards, preset cards           |
| `scale-base`         | 1.05  | **Default** button hover   | Standard buttons, tiles            |
| `scale-strong`       | 1.1   | Icon buttons, badges       | Close buttons, notification badges |
| `scale-press`        | 0.95  | **Universal** active press | All interactive elements           |
| `scale-press-strong` | 0.9   | Strong press feedback      | Special interactions               |

### Scale Patterns

#### Standard Button Pattern

```tsx
<button className="transition-transform duration-base hover:scale-base active:scale-press">
  Standard Button
</button>
```

#### Icon Button Pattern

```tsx
<button className="transition-transform duration-base hover:scale-strong active:scale-press">
  <Icon name="x" />
</button>
```

#### Card Hover Pattern

```tsx
<div className="transition-all duration-base hover:scale-subtle">
  Card Content
</div>
```

---

## Opacity Scale

Semantic opacity values for fade effects:

| Token            | Value | Usage                            |
| ---------------- | ----- | -------------------------------- |
| `opacity-0`      | 0     | Hidden elements                  |
| `opacity-faint`  | 0.1   | Very subtle overlays             |
| `opacity-subtle` | 0.3   | Subtle overlays, disabled states |
| `opacity-medium` | 0.5   | Medium overlays, loading states  |
| `opacity-strong` | 0.7   | Strong overlays, modals          |
| `opacity-opaque` | 0.9   | Nearly opaque, glass effects     |
| `opacity-100`    | 1     | Fully visible                    |

### Usage Examples

```tsx
// Fade in effect
<div className="transition-opacity duration-medium opacity-0 group-hover:opacity-strong">
  Overlay Content
</div>

// Loading state
<div className="transition-opacity duration-base opacity-medium animate-pulse">
  Loading...
</div>
```

---

## Translate Scale

Lift and slide effects for spatial animations:

| Token                  | Value | Usage                    |
| ---------------------- | ----- | ------------------------ |
| `translate-lift-sm`    | -2px  | Small lift - cards       |
| `translate-lift-base`  | -4px  | **Default** lift - tiles |
| `translate-lift-lg`    | -8px  | Large lift - modals      |
| `translate-slide-sm`   | 4px   | Small slide - tooltips   |
| `translate-slide-base` | 8px   | Base slide - drawers     |
| `translate-slide-lg`   | 16px  | Large slide - panels     |

### Usage Examples

```tsx
// Card lift on hover
<div className="transition-transform duration-medium hover:-translate-y-1">
  Card lifts 4px
</div>

// Tile lift (using custom value for now)
<button className="transition-all duration-medium hover:-translate-y-1 hover:shadow-xl">
  Aurora Tile
</button>

// Slide-in drawer
<div className="transition-transform duration-slow translate-x-full data-[state=open]:translate-x-0">
  Drawer Content
</div>
```

---

## Built-in Tailwind Animations

Use Tailwind's built-in animations for loading states:

### `animate-spin`

Loading spinners (infinite rotation):

```tsx
<Icon name="loader" className="animate-spin text-brand-primary" />
```

### `animate-pulse`

Skeleton loaders (fade in/out):

```tsx
<div className="animate-pulse bg-surface-muted rounded h-4 w-32" />
```

### `animate-bounce`

Loading dots (bounce effect):

```tsx
<div className="flex gap-1">
  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
</div>
```

---

## Common Patterns

### Interactive Card

```tsx
<div
  className="
  rounded-glass border border-base 
  bg-surface-elevated backdrop-blur-xl 
  shadow-card transition-all duration-base 
  hover:scale-subtle hover:shadow-card-hover
  active:scale-press
"
>
  Card Content
</div>
```

### Glass Button

```tsx
<button
  className="
  rounded-md px-4 py-2 
  bg-interactive-primary text-text-inverse 
  shadow-button transition-all duration-base 
  hover:bg-interactive-primary-hover hover:shadow-button-hover hover:scale-base
  active:scale-press
  focus:outline-none focus:ring-2 focus:ring-border-focus
"
>
  Click Me
</button>
```

### Aurora Tile

```tsx
<button
  className="
  relative flex flex-col gap-3 p-6 
  rounded-glass border border-white/70 
  bg-white/80 backdrop-blur-xl 
  shadow-glass transition-all duration-medium 
  hover:-translate-y-1 hover:shadow-xl
  focus:outline-none focus:ring-4 focus:ring-brand-primary
"
>
  <Icon name="play" className="text-brand-primary" />
  <Typography variant="headline-sm">Tile Title</Typography>
  <Typography variant="body-sm" color="secondary">
    Description
  </Typography>
</button>
```

### Icon Button

```tsx
<button
  className="
  p-2 rounded-md 
  bg-surface-base hover:bg-surface-subtle 
  transition-all duration-base 
  hover:scale-strong 
  active:scale-press
  focus:outline-none focus:ring-2 focus:ring-border-focus
"
>
  <Icon name="x" size="sm" />
</button>
```

---

## Migration Guide

### Before (Hardcoded Values)

```tsx
// ❌ Old pattern - hardcoded durations and scales
<button className="transition-all duration-200 hover:scale-105 active:scale-95">
  Click Me
</button>

<div className="transition-opacity duration-300 hover:opacity-100">
  Overlay
</div>

<div className="transition-transform duration-500 hover:-translate-y-[4px]">
  Card
</div>
```

### After (Semantic Tokens)

```tsx
// ✅ New pattern - semantic animation tokens
<button className="transition-all duration-base hover:scale-base active:scale-press">
  Click Me
</button>

<div className="transition-opacity duration-medium hover:opacity-100">
  Overlay
</div>

<div className="transition-transform duration-slow hover:-translate-y-1">
  Card (uses -4px)
</div>
```

### Common Replacements

| Old Pattern            | New Pattern            | Reasoning                          |
| ---------------------- | ---------------------- | ---------------------------------- |
| `duration-200`         | `duration-base`        | 200ms is our default speed         |
| `duration-300`         | `duration-medium`      | 300ms for moderate animations      |
| `duration-500`         | `duration-slow`        | 500ms for deliberate motion        |
| `hover:scale-105`      | `hover:scale-base`     | 5% is standard button hover        |
| `hover:scale-110`      | `hover:scale-strong`   | 10% for icon buttons               |
| `hover:scale-[1.02]`   | `hover:scale-subtle`   | 2% for subtle card hover           |
| `active:scale-95`      | `active:scale-press`   | Universal press state              |
| `transition-all`       | `transition-all`       | Keep for comprehensive transitions |
| `transition-transform` | `transition-transform` | Use for scale/translate only       |

---

## CSS Custom Properties

All animation tokens are defined in `src/styles/generated-tokens.css`:

```css
/* Duration Scale */
--duration-instant: 75ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-medium: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;

/* Easing Functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Scale Transform */
--scale-subtle: 1.02;
--scale-base: 1.05;
--scale-strong: 1.1;
--scale-press: 0.95;
--scale-press-strong: 0.9;

/* Opacity Scale */
--opacity-invisible: 0;
--opacity-faint: 0.1;
--opacity-subtle: 0.3;
--opacity-medium: 0.5;
--opacity-strong: 0.7;
--opacity-opaque: 0.9;
--opacity-full: 1;

/* Translate Scale */
--translate-lift-sm: -2px;
--translate-lift-base: -4px;
--translate-lift-lg: -8px;
--translate-slide-sm: 4px;
--translate-slide-base: 8px;
--translate-slide-lg: 16px;
```

---

## Accessibility

### Reduced Motion

Always respect `prefers-reduced-motion` for users who prefer minimal animation:

```tsx
// ✅ Good - respects user preferences
<div className="
  transition-all duration-base
  motion-reduce:transition-none
  hover:scale-base motion-reduce:hover:scale-100
">
  Content
</div>

// Or add globally in your CSS
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Management

Animations should not interfere with focus indicators:

```tsx
// ✅ Good - animation complements focus ring
<button
  className="
  transition-all duration-base 
  hover:scale-base 
  focus:outline-none focus:ring-2 focus:ring-border-focus
"
>
  Accessible Button
</button>
```

---

## Performance Tips

### 1. Use `transform` and `opacity`

These properties are GPU-accelerated and don't trigger layout:

```tsx
// ✅ Good - GPU-accelerated
<div className="transition-transform duration-base hover:scale-base" />
<div className="transition-opacity duration-base hover:opacity-strong" />

// ❌ Avoid - triggers layout/paint
<div className="transition-all duration-base hover:w-full hover:h-full" />
```

### 2. Use `will-change` Sparingly

Only for elements that will animate frequently:

```css
/* ⚠️ Use sparingly - memory intensive */
.frequently-animated {
  will-change: transform, opacity;
}
```

### 3. Batch Transitions

Use `transition-all` when multiple properties change:

```tsx
// ✅ Good - one transition for multiple properties
<div className="transition-all duration-base hover:scale-base hover:shadow-lg" />
```

---

## Browser Support

All animation tokens use standard CSS properties with broad browser support:

- **Duration/Timing**: All modern browsers
- **Easing**: All modern browsers (cubic-bezier)
- **Scale**: All modern browsers (transform: scale)
- **Opacity**: All modern browsers
- **Translate**: All modern browsers (transform: translate)

### Fallbacks

For older browsers, provide graceful degradation:

```css
/* Fallback for browsers without custom properties */
.button {
  transition-duration: 200ms; /* Fallback */
  transition-duration: var(--duration-base); /* Modern */
}
```

---

## Related Documentation

- [Border Radius System](./BORDER_RADIUS_SYSTEM.md) - Rounded corners
- [Shadow System](./SHADOW_SYSTEM.md) - Elevation and depth
- [Color Semantic Tokens](./COLOR_SEMANTIC_TOKENS.md) - Color system
- [Aurora Design Language](./ARCHITECTURE.md#aurora-design-language) - Overall design system

---

## Summary

**30 Animation Tokens Defined:**

- 6 duration tokens (instant → slower)
- 6 easing functions (linear → spring)
- 5 scale transforms (subtle → press-strong)
- 7 opacity levels (invisible → full)
- 6 translate values (lift/slide)

**3 Components Migrated:**

- `GlassCard.tsx` - Duration tokens
- `AppIconTile.tsx` - Duration + scale tokens
- `AuroraTile.tsx` - Duration + lift animations

**Common Patterns:**

- Buttons: `duration-base` + `scale-base` + `scale-press`
- Cards: `duration-base` + `scale-subtle`
- Tiles: `duration-medium` + `translate-lift-base`
- Icon Buttons: `duration-base` + `scale-strong`
- Loading: `animate-spin`, `animate-pulse`, `animate-bounce`

**Next Steps:**

- Migrate remaining 40+ components using animation patterns
- Add motion-reduce utilities globally
- Consider animation presets for complex sequences
