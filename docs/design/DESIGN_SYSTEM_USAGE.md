# BoxCall Design System Documentation

## 🎨 Overview

The BoxCall Design System provides a centralized, token-based approach to styling that ensures consistency, maintainability, and professional appearance across the entire application.

## 📁 File Structure

```
src/design-system/
├── tokens.ts          # Central color definitions
├── types.ts           # TypeScript type definitions
└── index.ts           # Design system exports

src/components/design-system/
├── Typography.tsx     # Typography components
├── Spacing.tsx        # Spacing utilities
└── index.ts           # Component system exports

src/styles/
├── tokens.css         # CSS custom properties
└── globals.css        # Global styles
```

## 🎯 Token Usage Patterns

### Primary Brand Colors

Use these for main brand elements, CTAs, and primary actions:

```typescript
// Tailwind Classes
"bg-brand-jade"; // Main brand background
"text-brand-jade"; // Brand text color
"border-brand-jade"; // Brand borders
"hover:bg-interaction-jade"; // Interactive hover states
```

### Surface Colors

Use these for backgrounds, cards, and surface elements:

```typescript
"bg-surface-jade"; // Light brand background
"bg-surface-jade-dark"; // Darker brand background
```

### Navy Colors

Use these for secondary elements, text, and professional contrast:

```typescript
"text-brand-navy-dark"; // Dark text
"bg-brand-navy"; // Navy backgrounds
```

## 🔧 Implementation Examples

### Button Component

```typescript
// ✅ Correct - Using design tokens
const ButtonStyles = {
  primary: "bg-brand-jade hover:bg-interaction-jade text-white",
  secondary: "bg-surface-jade hover:bg-surface-jade-dark text-brand-jade-dark",
};

// ❌ Incorrect - Hardcoded colors
const ButtonStyles = {
  primary: "bg-jade-500 hover:bg-jade-600 text-white",
};
```

### CSS Custom Properties

```css
/* ✅ Correct - Using CSS variables */
.custom-component {
  background: var(--color-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

/* ❌ Incorrect - Hardcoded hex values */
.custom-component {
  background: #00a86b;
  border: 1px solid #e5e7eb;
  color: #374151;
}
```

## 📊 Available Token Classes

### Background Colors

- `bg-brand-jade` - Primary brand background
- `bg-interaction-jade` - Interactive hover background
- `bg-surface-jade` - Light brand surface
- `bg-surface-jade-dark` - Dark brand surface
- `bg-brand-navy` - Navy background
- `bg-brand-navy-dark` - Dark navy background

### Text Colors

- `text-brand-jade` - Primary brand text
- `text-brand-jade-dark` - Dark brand text
- `text-brand-jade-light` - Light brand text
- `text-brand-navy-dark` - Dark navy text
- `text-interaction-jade` - Interactive text

### Border Colors

- `border-brand-jade` - Primary brand borders
- `border-interaction-jade` - Interactive borders
- `border-surface-jade-dark` - Surface borders
- `border-brand-navy-dark` - Navy borders

### Interactive States

- `hover:bg-interaction-jade` - Hover background
- `hover:text-brand-jade` - Hover text
- `focus:border-brand-jade` - Focus border
- `focus:ring-brand-jade` - Focus ring

## 🛠️ Development Guidelines

### 1. Always Use Tokens

Never hardcode color values. Always use the centralized token system.

### 2. Semantic Naming

Use semantic class names that describe the purpose, not the color:

- `bg-brand-jade` (semantic) vs `bg-jade-500` (hardcoded)

### 3. Consistent Patterns

Follow established patterns for hover states, focus states, and interactions.

### 4. CSS Variables for Complex Cases

For complex styling that can't use Tailwind classes, use CSS custom properties:

```css
.gradient-background {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primaryHover) 100%
  );
}
```

## 🎨 Color Psychology

### Jade Green (#00A86B)

- **Psychology**: Growth, trust, stability, success
- **Usage**: Primary CTAs, success states, brand elements
- **Best For**: Action buttons, confirmations, progress indicators

### Navy Blue (#475569)

- **Psychology**: Professional, trustworthy, corporate
- **Usage**: Text, secondary elements, professional contexts
- **Best For**: Body text, headers, navigation, form labels

## 🔍 Debugging & Troubleshooting

### Common Issues

1. **Colors not applying**: Check that Tailwind includes the token classes
2. **Inconsistent hover states**: Verify you're using `interaction-jade` for hovers
3. **Dark mode issues**: Ensure you're using the appropriate dark: variants

### Verification Script

Run the verification script to check for hardcoded colors:

```bash
npm run verify-tokens
```

## 📈 Future Enhancements

- [ ] Add animation tokens
- [ ] Expand typography token system
- [ ] Add spacing tokens
- [ ] Create theme variants (light/dark modes)
- [ ] Add component-specific token categories

---

**🏈 Professional • Consistent • Maintainable**
