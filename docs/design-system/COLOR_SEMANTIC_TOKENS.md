# Color Semantic Token System

**Phase 3 - Design System Polish**  
**Task #8: Color Classes → Semantic Tokens**

## Overview

The Color Semantic Token System provides named color utilities that map to semantic UI patterns rather than raw color values. This approach ensures consistency across the app, simplifies theming, and makes color usage more maintainable.

**Key Benefits:**
- **Semantic Clarity**: Use `text-brand-primary` instead of `text-jade-600` to communicate intent
- **Theming Support**: CSS custom properties enable runtime theming without rebuilding
- **Consistency**: Enforces uniform color usage across components
- **Maintenance**: Change brand colors in one place, propagate everywhere
- **Dark Mode**: Built-in light/dark variants for seamless theme switching

---

## Token Categories

### 1. Brand Colors

Primary brand identity colors derived from jade (green), electric (purple), and navy (blue).

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `brand-primary` | `--color-brand-primary` | `#047857` (jade-600) | Main brand color for CTAs, icons, highlights |
| `brand-primary-hover` | `--color-brand-primary-hover` | `#065f46` (jade-700) | Hover state for primary actions |
| `brand-primary-active` | `--color-brand-primary-active` | `#064e3b` (jade-800) | Active/pressed state |
| `brand-accent` | `--color-brand-accent` | `#8b5cf6` (electric-500) | Accent highlights (badges, special features) |
| `brand-accent-hover` | `--color-brand-accent-hover` | `#7c3aed` (electric-600) | Accent hover state |
| `brand-secondary` | `--color-brand-secondary` | `#475569` (navy-600) | Secondary brand color |

**Usage Examples:**
```tsx
// Primary action button
<button className="bg-brand-primary hover:bg-brand-primary-hover text-inverse">
  Create Play
</button>

// Brand icon
<Icon name="check" className="text-brand-primary" />

// Accent badge
<span className="bg-brand-accent text-inverse px-2 py-1 rounded-full">
  New
</span>
```

---

### 2. Surface Colors

Background colors for cards, modals, and surfaces with glass morphism support.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `surface-base` | `--color-surface-base` | `#ffffff` | Base white surface |
| `surface-base-dark` | `--color-surface-base-dark` | `rgb(15 23 42 / 0.7)` | Dark mode base |
| `surface-elevated` | `--color-surface-elevated` | `rgb(255 255 255 / 0.8)` | Glass cards (light) |
| `surface-elevated-dark` | `--color-surface-elevated-dark` | `rgb(15 23 42 / 0.9)` | Glass cards (dark) |
| `surface-subtle` | `--color-surface-subtle` | `#f9fafb` (slate-50) | Subtle background |
| `surface-subtle-dark` | `--color-surface-subtle-dark` | `rgb(51 65 85 / 0.5)` | Dark subtle bg |
| `surface-muted` | `--color-surface-muted` | `#f1f5f9` (slate-100) | Muted background |
| `surface-muted-dark` | `--color-surface-muted-dark` | `rgb(30 41 59 / 0.8)` | Dark muted bg |
| `surface-inverse` | `--color-surface-inverse` | `#0f172a` (slate-900) | Inverse surface |

**Usage Examples:**
```tsx
// Glass card
<div className="bg-surface-elevated dark:bg-surface-elevated-dark backdrop-blur-xl">
  Card content
</div>

// Subtle background section
<section className="bg-surface-subtle dark:bg-surface-subtle-dark">
  Section content
</section>

// Muted info panel
<aside className="bg-surface-muted dark:bg-surface-muted-dark">
  Info content
</aside>
```

---

### 3. Text Colors

Typography hierarchy from primary to muted with brand and accent variants.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `text-primary` | `--color-text-primary` | `#0f172a` (slate-900) | Primary text |
| `text-primary-dark` | `--color-text-primary-dark` | `#ffffff` | Dark mode primary |
| `text-secondary` | `--color-text-secondary` | `#475569` (slate-600) | Secondary text |
| `text-secondary-dark` | `--color-text-secondary-dark` | `#cbd5e1` (slate-300) | Dark secondary |
| `text-muted` | `--color-text-muted` | `#64748b` (slate-500) | Muted/disabled text |
| `text-muted-dark` | `--color-text-muted-dark` | `#94a3b8` (slate-400) | Dark muted |
| `text-inverse` | `--color-text-inverse` | `#ffffff` | On dark backgrounds |
| `text-brand` | `--color-text-brand` | `#047857` (jade-600) | Brand-colored text |
| `text-brand-dark` | `--color-text-brand-dark` | `#34d399` (jade-400) | Dark brand text |
| `text-accent` | `--color-text-accent` | `#8b5cf6` (electric-500) | Accent text |
| `text-accent-dark` | `--color-text-accent-dark` | `#a78bfa` (electric-400) | Dark accent |

**Usage Examples:**
```tsx
// Typography hierarchy
<h1 className="text-text-primary dark:text-text-primary-dark">
  Main Heading
</h1>
<p className="text-text-secondary dark:text-text-secondary-dark">
  Body text
</p>
<span className="text-text-muted dark:text-text-muted-dark">
  Footnote
</span>

// Brand link
<a href="#" className="text-brand hover:underline">
  Learn more
</a>

// Accent label
<label className="text-accent dark:text-accent-dark font-semibold">
  Featured
</label>
```

---

### 4. Border Colors

Border and outline colors for cards, inputs, and focus states.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `border-base` | `--color-border-base` | `rgb(255 255 255 / 0.7)` | Glass borders (light) |
| `border-base-dark` | `--color-border-base-dark` | `rgb(51 65 85 / 0.6)` | Glass borders (dark) |
| `border-subtle` | `--color-border-subtle` | `#e2e8f0` (slate-200) | Subtle dividers |
| `border-subtle-dark` | `--color-border-subtle-dark` | `rgb(51 65 85 / 0.5)` | Dark dividers |
| `border-muted` | `--color-border-muted` | `rgb(226 232 240 / 0.4)` | Muted borders |
| `border-muted-dark` | `--color-border-muted-dark` | `rgb(51 65 85 / 0.4)` | Dark muted |
| `border-focus` | `--color-border-focus` | `#047857` (jade-600) | Focus ring |
| `border-error` | `--color-border-error` | `#dc2626` (red-600) | Error border |

**Usage Examples:**
```tsx
// Glass card border
<div className="border border-base dark:border-base-dark">
  Glass card
</div>

// Subtle divider
<hr className="border-t border-subtle dark:border-subtle-dark" />

// Input with focus
<input 
  className="border border-subtle focus:border-focus focus:ring-2 focus:ring-focus"
/>

// Error input
<input className="border-2 border-error" />
```

---

### 5. Interactive States

Button and link states for hover, active, and pressed interactions.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `interactive-primary` | `--color-interactive-primary` | `#047857` (jade-600) | Primary action |
| `interactive-primary-hover` | `--color-interactive-primary-hover` | `#065f46` (jade-700) | Primary hover |
| `interactive-primary-active` | `--color-interactive-primary-active` | `#064e3b` (jade-800) | Primary active |
| `interactive-accent` | `--color-interactive-accent` | `#8b5cf6` (electric-500) | Accent action |
| `interactive-accent-hover` | `--color-interactive-accent-hover` | `#7c3aed` (electric-600) | Accent hover |
| `interactive-accent-active` | `--color-interactive-accent-active` | `#6d28d9` (electric-700) | Accent active |

**Usage Examples:**
```tsx
// Primary button states
<button className="bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active">
  Save
</button>

// Accent button
<button className="bg-interactive-accent hover:bg-interactive-accent-hover">
  Highlight
</button>
```

---

### 6. Status Colors

Feedback colors for success, warning, and error states.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `status-success` | `--color-success` | `#16a34a` (green-600) | Success state |
| `status-success-bg` | `--color-success-bg` | `#dcfce7` (green-100) | Success background |
| `status-success-bg-dark` | `--color-success-bg-dark` | `rgb(22 163 74 / 0.2)` | Dark success bg |
| `status-success-text` | `--color-success-text` | `#15803d` (green-700) | Success text |
| `status-success-text-dark` | `--color-success-text-dark` | `#4ade80` (green-400) | Dark success text |
| `status-warning` | `--color-warning` | `#d97706` (amber-600) | Warning state |
| `status-warning-bg` | `--color-warning-bg` | `#fef3c7` (amber-100) | Warning background |
| `status-warning-bg-dark` | `--color-warning-bg-dark` | `rgb(217 119 6 / 0.2)` | Dark warning bg |
| `status-warning-text` | `--color-warning-text` | `#b45309` (amber-700) | Warning text |
| `status-warning-text-dark` | `--color-warning-text-dark` | `#fbbf24` (amber-400) | Dark warning text |
| `status-error` | `--color-error` | `#dc2626` (red-600) | Error state |
| `status-error-bg` | `--color-error-bg` | `#fee2e2` (red-100) | Error background |
| `status-error-bg-dark` | `--color-error-bg-dark` | `rgb(220 38 38 / 0.2)` | Dark error bg |
| `status-error-text` | `--color-error-text` | `#b91c1c` (red-700) | Error text |
| `status-error-text-dark` | `--color-error-text-dark` | `#f87171` (red-400) | Dark error text |

**Usage Examples:**
```tsx
// Success alert
<div className="bg-status-success-bg dark:bg-status-success-bg-dark border border-status-success rounded-lg p-4">
  <p className="text-status-success-text dark:text-status-success-text-dark">
    ✓ Play saved successfully!
  </p>
</div>

// Warning banner
<div className="bg-status-warning-bg dark:bg-status-warning-bg-dark p-3">
  <span className="text-status-warning-text dark:text-status-warning-text-dark">
    ⚠ Changes not saved
  </span>
</div>

// Error message
<div className="bg-status-error-bg dark:bg-status-error-bg-dark p-2 rounded">
  <p className="text-status-error-text dark:text-status-error-text-dark">
    ✗ Failed to load
  </p>
</div>
```

---

### 7. Gradient Stops

Gradient color stops for common brand gradients.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| `gradient-brand-start` | `--gradient-brand-start` | `#00a86b` (jade-500) | Brand gradient start |
| `gradient-brand-end` | `--gradient-brand-end` | `#10b981` (emerald-500) | Brand gradient end |
| `gradient-accent-start` | `--gradient-accent-start` | `#8b5cf6` (electric-500) | Accent gradient start |
| `gradient-accent-end` | `--gradient-accent-end` | `#a855f7` (purple-500) | Accent gradient end |
| `gradient-secondary-start` | `--gradient-secondary-start` | `#475569` (navy-600) | Secondary gradient start |
| `gradient-secondary-end` | `--gradient-secondary-end` | `#2563eb` (blue-600) | Secondary gradient end |
| `gradient-warning-start` | `--gradient-warning-start` | `#f59e0b` (amber-500) | Warning gradient start |
| `gradient-warning-end` | `--gradient-warning-end` | `#f97316` (orange-500) | Warning gradient end |

**Usage Examples:**
```tsx
// Brand gradient
<div className="bg-gradient-to-r from-gradient-brand-start to-gradient-brand-end">
  Hero section
</div>

// Accent gradient badge
<span className="bg-gradient-to-r from-gradient-accent-start to-gradient-accent-end text-inverse">
  Premium
</span>

// Warning gradient icon
<div className="bg-gradient-to-br from-gradient-warning-start to-gradient-warning-end rounded-full p-3">
  <Icon name="alert" className="text-inverse" />
</div>
```

---

## Migration Patterns

### Before → After Examples

#### 1. Play Type Badges
```tsx
// ❌ Before (hardcoded colors)
return type === "Pass" ? "bg-electric-600 text-white" : "bg-jade-600 text-white";

// ✅ After (semantic tokens)
return type === "Pass" ? "bg-interactive-accent text-inverse" : "bg-brand-primary text-inverse";
```

#### 2. Confidence Indicators
```tsx
// ❌ Before
if (confidence >= 85) return "text-white bg-jade-600";
if (confidence >= 60) return "text-amber-800 bg-amber-100";
return "text-white bg-red-600";

// ✅ After
if (confidence >= 85) return "text-inverse bg-brand-primary";
if (confidence >= 60) return "text-status-warning-text bg-status-warning-bg";
return "text-inverse bg-status-error";
```

#### 3. Selection States
```tsx
// ❌ Before
className={isSelected ? "ring-2 ring-jade-500 border-jade-400" : "border-white/70"}

// ✅ After
className={isSelected ? "ring-2 ring-brand-primary border-brand-primary" : "border-base"}
```

#### 4. Focus Rings
```tsx
// ❌ Before
<input className="focus:ring-2 focus:ring-jade-500 focus:border-jade-600" />

// ✅ After
<input className="focus:ring-2 focus:ring-focus focus:border-focus" />
```

#### 5. Error States
```tsx
// ❌ Before
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200">
  <Icon className="text-red-500 dark:text-red-400" />
</div>

// ✅ After
<div className="bg-status-error-bg dark:bg-status-error-bg-dark border border-status-error">
  <Icon className="text-status-error dark:text-status-error-text-dark" />
</div>
```

#### 6. Brand Icons
```tsx
// ❌ Before
<Icon name="check" className="text-jade-600" />
<Icon name="zap" className="text-electric-500" />

// ✅ After
<Icon name="check" className="text-brand-primary" />
<Icon name="zap" className="text-brand-accent" />
```

---

## Best Practices

### 1. **Use Semantic Over Literal**
Prefer semantic tokens (`text-brand-primary`) over color names (`text-jade-600`) to communicate intent.

### 2. **Combine with Dark Mode**
Always provide dark mode variants when using light colors:
```tsx
className="text-text-primary dark:text-text-primary-dark"
```

### 3. **Interactive States**
Use the full hover/active chain for buttons:
```tsx
<button className="bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active">
  Save
</button>
```

### 4. **Status Feedback**
Use complete status patterns (background + text + border):
```tsx
<div className="bg-status-success-bg border border-status-success">
  <p className="text-status-success-text">Success!</p>
</div>
```

### 5. **Glass Morphism**
Combine surface tokens with borders for Aurora glass effect:
```tsx
<div className="bg-surface-elevated dark:bg-surface-elevated-dark border border-base dark:border-base-dark backdrop-blur-xl">
  Glass card
</div>
```

---

## Common Patterns

### Card Component
```tsx
<div className="
  bg-surface-elevated 
  dark:bg-surface-elevated-dark 
  border border-base 
  dark:border-base-dark 
  rounded-glass 
  shadow-glass
">
  Card content
</div>
```

### Primary Button
```tsx
<button className="
  bg-interactive-primary 
  hover:bg-interactive-primary-hover 
  active:bg-interactive-primary-active 
  text-inverse 
  px-4 py-2 
  rounded-lg 
  shadow-button 
  hover:shadow-button-hover
">
  Action
</button>
```

### Accent Badge
```tsx
<span className="
  bg-brand-accent 
  text-inverse 
  px-2 py-1 
  rounded-full 
  text-sm 
  font-semibold
">
  New Feature
</span>
```

### Success Alert
```tsx
<div className="
  bg-status-success-bg 
  dark:bg-status-success-bg-dark 
  border-l-4 
  border-status-success 
  p-4
">
  <p className="text-status-success-text dark:text-status-success-text-dark">
    ✓ Operation successful
  </p>
</div>
```

### Focus Input
```tsx
<input className="
  border 
  border-subtle 
  dark:border-subtle-dark 
  focus:border-focus 
  focus:ring-2 
  focus:ring-focus 
  rounded-lg 
  px-3 py-2
" />
```

---

## Design Token Architecture

### CSS Custom Properties (generated-tokens.css)
```css
:root {
  /* Brand Colors */
  --color-brand-primary: #047857;
  --color-brand-primary-hover: #065f46;
  
  /* Surface Colors */
  --color-surface-elevated: rgb(255 255 255 / 0.8);
  --color-surface-elevated-dark: rgb(15 23 42 / 0.9);
  
  /* ... more tokens ... */
}
```

### Tailwind Configuration (tailwind.config.js)
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        primary: "var(--color-brand-primary)",
        "primary-hover": "var(--color-brand-primary-hover)",
      },
      surface: {
        elevated: "var(--color-surface-elevated)",
        "elevated-dark": "var(--color-surface-elevated-dark)",
      },
      // ... more mappings ...
    }
  }
}
```

### Component Usage
```tsx
// Utility classes resolve to CSS custom properties at runtime
<div className="bg-brand-primary text-inverse">
  // Compiles to: background-color: var(--color-brand-primary);
</div>
```

---

## Related Documentation

- **Border Radius Guidelines**: [BORDER_RADIUS_GUIDELINES.md](./BORDER_RADIUS_GUIDELINES.md)
- **Shadow & Elevation**: [SHADOW_ELEVATION_GUIDELINES.md](./SHADOW_ELEVATION_GUIDELINES.md)
- **Design System Overview**: [../../README.md](../../README.md)

---

**Last Updated**: Phase 3 - Task #8 (Color Semantic Token System)  
**Status**: ✅ Complete - 90+ semantic color tokens, 3 components migrated, full dark mode support
