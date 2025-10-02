# Shadow & Elevation Guidelines

## Overview

BoxCall uses a **semantic token-based shadow system** to create consistent visual hierarchy and depth across the application. All shadow values are defined as CSS custom properties and mapped to Tailwind utilities for the Aurora Design Language.

## Token Scale

### Standard Elevation Levels

| Token | CSS Value | Tailwind Class | Visual Weight | Use Case |
|-------|-----------|----------------|---------------|----------|
| `--shadow-none` | `none` | `shadow-none` | No elevation | Flat elements, dividers |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` | Minimal | Subtle borders, hover hints |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | `shadow-md` | Low | Standard cards, inputs |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | `shadow-lg` | Medium | Elevated cards, dropdowns |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | `shadow-xl` | High | Modals, popovers |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | `shadow-2xl` | Very High | Large modals, overlays |
| `--shadow-inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` | `shadow-inner` | Inset | Pressed buttons, inputs |

### Glass Morphism Shadows (Aurora Design Language)

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--shadow-glass` | `shadow-glass` | Standard glass cards (light mode) |
| `--shadow-glass-dark` | `shadow-glass-dark` | Standard glass cards (dark mode) |
| `--shadow-glass-elevated` | `shadow-glass-elevated` | Elevated glass surfaces (light) |
| `--shadow-glass-elevated-dark` | `shadow-glass-elevated-dark` | Elevated glass surfaces (dark) |
| `--shadow-glass-subtle` | `shadow-glass-subtle` | Subtle glass elements (light) |
| `--shadow-glass-subtle-dark` | `shadow-glass-subtle-dark` | Subtle glass elements (dark) |

### Interactive State Shadows

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--shadow-hover` | `shadow-hover` | Hover state elevation |
| `--shadow-active` | `shadow-active` | Active/pressed state |
| `--shadow-card` | `shadow-card` | Default card shadow |
| `--shadow-card-hover` | `shadow-card-hover` | Card hover state |

### Component-Specific Shadows

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--shadow-modal` | `shadow-modal` | Modal dialogs |
| `--shadow-dropdown` | `shadow-dropdown` | Dropdown menus |
| `--shadow-button` | `shadow-button` | Button resting state |
| `--shadow-button-hover` | `shadow-button-hover` | Button hover state |

### Colored Accent Shadows

| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--shadow-jade` | `shadow-jade` | Selected/focus state (brand) |
| `--shadow-electric` | `shadow-electric` | CTA/accent state |

---

## Usage Guidelines

### Visual Hierarchy

Shadows communicate depth and importance. Use them strategically:

1. **Base Layer (0-1px)** - `shadow-none` or `shadow-sm`
   - Flat surfaces, dividers, subtle borders
   
2. **Content Layer (2-8px)** - `shadow-md`
   - Standard cards, inputs, buttons
   
3. **Elevated Layer (10-20px)** - `shadow-lg` to `shadow-xl`
   - Dropdowns, tooltips, elevated cards
   
4. **Overlay Layer (25-50px)** - `shadow-2xl`
   - Modals, dialogs, full-page overlays

### When to Use Each Shadow

#### `shadow-none`
- **Use for:** Flat UI elements, dividers, backgrounds
- **Example:** Section separators, page backgrounds

```tsx
<div className="surface-primary shadow-none">
  <Divider />
</div>
```

#### `shadow-sm` (Minimal Elevation)
- **Use for:** Subtle hints, hover previews, badges
- **Example:** Badge outlines, input borders

```tsx
<Badge variant="outline" className="shadow-sm">
  New
</Badge>
```

#### `shadow-md` (Standard Elevation)
- **Use for:** Standard cards, inputs, buttons
- **Example:** Form inputs, default cards

```tsx
<Card className="shadow-md p-6">
  <CardContent />
</Card>
```

#### `shadow-lg` (Medium Elevation)
- **Use for:** Elevated cards, dropdowns, selected states
- **Example:** Dropdown menus, hover cards

```tsx
<Dropdown className="shadow-lg rounded-lg">
  <DropdownItem />
</Dropdown>
```

#### `shadow-xl` (High Elevation)
- **Use for:** Modals, popovers, important overlays
- **Example:** Modal dialogs, tooltips

```tsx
<Modal className="shadow-xl rounded-2xl">
  <ModalContent />
</Modal>
```

#### `shadow-2xl` (Very High Elevation)
- **Use for:** Large modals, full-page overlays
- **Example:** Confirmation dialogs, image lightboxes

```tsx
<LightboxModal className="shadow-2xl">
  <LightboxImage />
</LightboxModal>
```

#### `shadow-inner` (Inset Shadow)
- **Use for:** Pressed buttons, active inputs, recessed elements
- **Example:** Active button state, input focus

```tsx
<button className="active:shadow-inner">
  Click Me
</button>
```

### Glass Morphism Variants

Use glass shadows for Aurora Design Language components with `backdrop-blur`:

#### `shadow-glass` / `shadow-glass-dark`
- **Standard glass cards** with backdrop blur
- Default elevation for glass surfaces

```tsx
<GlassCard variant="default" className="shadow-glass dark:shadow-glass-dark">
  <PlayCard />
</GlassCard>
```

#### `shadow-glass-elevated` / `shadow-glass-elevated-dark`
- **Elevated glass surfaces** that need more prominence
- Floating toolbars, advanced filters

```tsx
<div className="rounded-glass backdrop-blur-xl shadow-glass-elevated dark:shadow-glass-elevated-dark">
  <AdvancedFilters />
</div>
```

#### `shadow-glass-subtle` / `shadow-glass-subtle-dark`
- **Subtle glass elements** that blend more with background
- Secondary cards, background panels

```tsx
<div className="rounded-glass-sm backdrop-blur-sm shadow-glass-subtle dark:shadow-glass-subtle-dark">
  <InfoPanel />
</div>
```

### Interactive State Shadows

#### Hover States
```tsx
// Card with hover elevation
<Card className="shadow-card hover:shadow-card-hover transition-shadow">
  <CardContent />
</Card>

// Button with hover shadow
<Button className="shadow-button hover:shadow-button-hover">
  Save
</Button>
```

#### Active/Selected States
```tsx
// Selected card with colored shadow
<Card 
  className={isSelected 
    ? "shadow-jade border-jade-400" 
    : "shadow-card"
  }
>
  <CardContent />
</Card>

// Pressed button
<button className="shadow-button active:shadow-inner">
  Submit
</button>
```

### Colored Accent Shadows

Use sparingly for emphasis on interactive or selected elements:

#### `shadow-jade` (Brand Color)
```tsx
// Selected state
<Card className="shadow-jade border-jade-500">
  <SelectedContent />
</Card>

// Focus ring with shadow
<input className="focus:ring-2 focus:ring-jade-500 focus:shadow-jade" />
```

#### `shadow-electric` (Accent Color)
```tsx
// CTA button
<Button variant="electric" className="shadow-electric">
  Get Started
</Button>

// Highlighted element
<div className="border-electric-500 shadow-electric">
  <Feature />
</div>
```

---

## Migration Patterns

### Before (Hardcoded)
```tsx
// ❌ Don't do this
<div className="shadow-[0_20px_45px_-24px_rgba(15,23,42,0.56)]" />
<Card className="shadow-[0_8px_16px_-8px_rgba(15,23,42,0.3)]" />
<Button className="hover:shadow-[0_12px_20px_-8px_rgba(15,23,42,0.4)]" />
```

### After (Token-based)
```tsx
// ✅ Do this instead
<div className="shadow-glass dark:shadow-glass-dark" />
<Card className="shadow-card hover:shadow-card-hover" />
<Button className="shadow-button hover:shadow-button-hover" />
```

---

## Best Practices

### 1. **Use Semantic Tokens**
Always use named tokens instead of arbitrary values:
```tsx
// ❌ Bad
className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]"

// ✅ Good
className="shadow-md"
```

### 2. **Consider Dark Mode**
Glass shadows have separate light/dark variants:
```tsx
// ✅ Good - explicit dark mode support
<div className="shadow-glass dark:shadow-glass-dark" />

// ⚠️ Acceptable - Tailwind handles standard shadows in dark mode
<Card className="shadow-md" />
```

### 3. **Match Shadow to Elevation**
Combine shadows with transforms for realistic depth:
```tsx
<Card className="shadow-md hover:-translate-y-1 hover:shadow-lg transition-all">
  <CardContent />
</Card>
```

### 4. **Don't Over-Elevate**
Use restraint - not everything needs a shadow:
```tsx
// ❌ Too many elevated elements
<div className="shadow-xl">
  <Card className="shadow-2xl">
    <Button className="shadow-lg" />
  </Card>
</div>

// ✅ Clear hierarchy
<div className="shadow-none">
  <Card className="shadow-md">
    <Button className="shadow-button" />
  </Card>
</div>
```

### 5. **Transition Shadows Smoothly**
Always animate shadow changes:
```tsx
<Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
  <CardContent />
</Card>
```

---

## Common Patterns

### Cards
```tsx
// Standard card
<Card className="shadow-md p-6">
  <CardContent />
</Card>

// Elevated card on hover
<Card className="shadow-md hover:shadow-lg transition-shadow">
  <CardContent />
</Card>

// Glass card (Aurora Design Language)
<GlassCard variant="default" className="shadow-glass dark:shadow-glass-dark">
  <CardContent />
</GlassCard>
```

### Buttons
```tsx
// Standard button
<Button className="shadow-button hover:shadow-button-hover">
  Action
</Button>

// Pressed state
<button className="shadow-button active:shadow-inner">
  Submit
</button>

// CTA with accent shadow
<Button variant="electric" className="shadow-electric">
  Get Started
</Button>
```

### Modals
```tsx
// Small modal
<Modal className="shadow-xl rounded-lg">
  <ModalContent />
</Modal>

// Large overlay modal
<Modal className="shadow-2xl rounded-2xl">
  <FullScreenContent />
</Modal>

// Glass modal
<Modal className="shadow-glass-elevated dark:shadow-glass-elevated-dark backdrop-blur-xl">
  <GlassModalContent />
</Modal>
```

### Dropdowns
```tsx
// Standard dropdown
<Dropdown className="shadow-dropdown rounded-lg">
  <DropdownItem />
</Dropdown>

// Glass dropdown
<Dropdown className="shadow-glass backdrop-blur-xl">
  <DropdownItem />
</Dropdown>
```

### Selected/Interactive States
```tsx
// Selected card
<Card 
  className={isSelected 
    ? "shadow-jade border-jade-500" 
    : "shadow-card"
  }
>
  <CardContent />
</Card>

// Hover with elevation
<div className="shadow-card hover:-translate-y-1 hover:shadow-lg transition-all">
  <InteractiveElement />
</div>
```

---

## Design Token Architecture

### CSS Custom Properties
```css
/* src/styles/generated-tokens.css */
:root {
  /* Standard Elevation */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  
  /* Glass Morphism (Aurora Design Language) */
  --shadow-glass: 0 20px 45px -24px rgba(15, 23, 42, 0.56);
  --shadow-glass-dark: 0 20px 45px -20px rgba(0, 0, 0, 0.75);
  --shadow-glass-elevated: 0 25px 50px -20px rgba(15, 23, 42, 0.7);
  --shadow-glass-elevated-dark: 0 25px 50px -15px rgba(0, 0, 0, 0.85);
  --shadow-glass-subtle: 0 10px 25px -10px rgba(15, 23, 42, 0.3);
  --shadow-glass-subtle-dark: 0 10px 25px -8px rgba(0, 0, 0, 0.5);
  
  /* Interactive States */
  --shadow-hover: 0 12px 20px -8px rgba(15, 23, 42, 0.4);
  --shadow-active: 0 8px 16px -8px rgba(15, 23, 42, 0.3);
  
  /* Component-Specific */
  --shadow-card: 0 8px 16px -8px rgba(15, 23, 42, 0.3);
  --shadow-card-hover: 0 12px 20px -8px rgba(15, 23, 42, 0.4);
  --shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-dropdown: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-button: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-button-hover: 0 2px 4px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  
  /* Colored Accents */
  --shadow-jade: 0 4px 12px 0 rgba(4, 120, 87, 0.2);
  --shadow-electric: 0 4px 12px 0 rgba(139, 92, 246, 0.2);
}
```

### Tailwind Configuration
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        // Standard elevation
        none: 'var(--shadow-none)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        
        // Glass morphism
        glass: 'var(--shadow-glass)',
        'glass-dark': 'var(--shadow-glass-dark)',
        'glass-elevated': 'var(--shadow-glass-elevated)',
        'glass-elevated-dark': 'var(--shadow-glass-elevated-dark)',
        'glass-subtle': 'var(--shadow-glass-subtle)',
        'glass-subtle-dark': 'var(--shadow-glass-subtle-dark)',
        
        // Interactive
        hover: 'var(--shadow-hover)',
        active: 'var(--shadow-active)',
        
        // Components
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
        dropdown: 'var(--shadow-dropdown)',
        button: 'var(--shadow-button)',
        'button-hover': 'var(--shadow-button-hover)',
        
        // Accents
        jade: 'var(--shadow-jade)',
        electric: 'var(--shadow-electric)',
      },
    },
  },
};
```

---

## Related Documentation

- [Aurora Design Language](../product/AURORA_DESIGN.md) - Overall design system
- [Border Radius Guidelines](./BORDER_RADIUS_GUIDELINES.md) - Complementary token system
- [GlassCard Component](../components/GLASS_CARD.md) - Glass morphism implementation
- [Design Tokens](./DESIGN_TOKENS.md) - Complete token reference

---

## Migration History

**Phase 3 - Task #7** (October 2025)
- Migrated 3 core components from hardcoded shadows to semantic tokens
- Established 20+ shadow tokens (standard, glass, interactive, component-specific, colored)
- Achieved consistent elevation system across Aurora Design Language
- Built-in dark mode support for glass shadows

---

**Last Updated:** October 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
