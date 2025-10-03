# Phase 3: Design System Polish & Consistency

**Estimated Time:** 11 hours  
**Focus:** Design tokens, visual consistency, and reusable patterns  
**Goal:** Create a cohesive, maintainable design system

---

## 📋 Tasks Overview

| #   | Task                                 | Est. Time | Priority | Status     |
| --- | ------------------------------------ | --------- | -------- | ---------- |
| 6   | Standardize Border Radius Tokens     | 2h        | High     | 🔄 Next    |
| 7   | Create Shadow Token System           | 2h        | High     | ⏳ Pending |
| 8   | Map Color Classes to Semantic Tokens | 3h        | High     | ⏳ Pending |
| 9   | Extract Animation Utilities          | 2h        | Medium   | ⏳ Pending |
| 10  | Consolidate Spacing Scale            | 2h        | Medium   | ⏳ Pending |

---

## Task #6: Standardize Border Radius Tokens

**Current Issue:**

- Inconsistent border radius values across components
- Mix of hardcoded values and token usage
- `rounded-xl`, `rounded-2xl`, `rounded-3xl` used inconsistently

**Goal:**
Create a consistent border radius scale aligned with Aurora/Glass design system

### Subtasks:

#### 6.1 Audit Current Usage

- [ ] Scan all components for `rounded-*` classes
- [ ] Document current usage patterns
- [ ] Identify inconsistencies

#### 6.2 Define Token Scale

```css
/* In tokens.css */
:root {
  /* Border Radius Scale */
  --radius-none: 0;
  --radius-sm: 0.375rem; /* 6px - subtle rounding */
  --radius-base: 0.5rem; /* 8px - default */
  --radius-md: 0.75rem; /* 12px - cards */
  --radius-lg: 1rem; /* 16px - modals, panels */
  --radius-xl: 1.5rem; /* 24px - feature cards */
  --radius-2xl: 2rem; /* 32px - hero elements */
  --radius-full: 9999px; /* pill buttons */

  /* Glass-specific radii */
  --radius-glass-sm: var(--radius-md);
  --radius-glass: var(--radius-lg);
  --radius-glass-lg: var(--radius-xl);
}
```

#### 6.3 Create Tailwind Config

```javascript
// tailwind.config.js
borderRadius: {
  'none': 'var(--radius-none)',
  'sm': 'var(--radius-sm)',
  'DEFAULT': 'var(--radius-base)',
  'md': 'var(--radius-md)',
  'lg': 'var(--radius-lg)',
  'xl': 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  'full': 'var(--radius-full)',
  'glass-sm': 'var(--radius-glass-sm)',
  'glass': 'var(--radius-glass)',
  'glass-lg': 'var(--radius-glass-lg)',
}
```

#### 6.4 Update Components

- [ ] GlassCard.tsx - Use `rounded-glass`
- [ ] PlayCard.tsx - Use `rounded-md`
- [ ] Modal components - Use `rounded-lg`
- [ ] Button components - Use semantic tokens
- [ ] Input components - Use `rounded-md`

#### 6.5 Create Usage Guidelines

Document when to use each radius value

**Deliverables:**

- ✅ Border radius tokens defined
- ✅ Tailwind config updated
- ✅ All components migrated
- ✅ Usage documentation

---

## Task #7: Create Shadow Token System

**Current Issue:**

- Inconsistent shadow usage
- Hardcoded shadow values
- No elevation system

**Goal:**
Establish a consistent elevation/shadow system

### Subtasks:

#### 7.1 Define Shadow Scale

```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-base: 0 2px 4px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Glass-specific shadows */
  --shadow-glass:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.1);

  --shadow-glass-hover:
    0 12px 40px 0 rgba(31, 38, 135, 0.2),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);

  /* Interactive shadows */
  --shadow-focus: 0 0 0 3px var(--color-primary-200);
  --shadow-error: 0 0 0 3px var(--color-error-200);
}
```

#### 7.2 Update Tailwind Config

```javascript
boxShadow: {
  'xs': 'var(--shadow-xs)',
  'sm': 'var(--shadow-sm)',
  'DEFAULT': 'var(--shadow-base)',
  'md': 'var(--shadow-md)',
  'lg': 'var(--shadow-lg)',
  'xl': 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  'glass': 'var(--shadow-glass)',
  'glass-hover': 'var(--shadow-glass-hover)',
  'focus': 'var(--shadow-focus)',
  'error': 'var(--shadow-error)',
}
```

#### 7.3 Update Components

- [ ] GlassCard - Use `shadow-glass`
- [ ] PlayCard - Use `shadow-md`
- [ ] Modals - Use `shadow-2xl`
- [ ] Dropdowns - Use `shadow-lg`
- [ ] Focus states - Use `shadow-focus`

**Deliverables:**

- ✅ Shadow tokens defined
- ✅ Elevation system documented
- ✅ Components updated
- ✅ Hover/focus states consistent

---

## Task #8: Map Color Classes to Semantic Tokens

**Current Issue:**

- Direct color references (`text-blue-600`)
- No semantic naming
- Hard to maintain color scheme changes

**Goal:**
Create semantic color tokens that map to design intent

### Subtasks:

#### 8.1 Define Semantic Color System

```css
:root {
  /* Semantic Colors */
  --color-text-primary: var(--slate-900);
  --color-text-secondary: var(--slate-600);
  --color-text-tertiary: var(--slate-400);
  --color-text-disabled: var(--slate-300);

  --color-bg-primary: var(--white);
  --color-bg-secondary: var(--slate-50);
  --color-bg-tertiary: var(--slate-100);

  --color-border-base: var(--slate-200);
  --color-border-strong: var(--slate-300);
  --color-border-subtle: var(--slate-100);

  /* Interactive States */
  --color-interactive-primary: var(--aurora-600);
  --color-interactive-hover: var(--aurora-700);
  --color-interactive-active: var(--aurora-800);

  /* Feedback Colors */
  --color-success: var(--green-600);
  --color-success-bg: var(--green-50);
  --color-warning: var(--amber-600);
  --color-warning-bg: var(--amber-50);
  --color-error: var(--red-600);
  --color-error-bg: var(--red-50);
  --color-info: var(--blue-600);
  --color-info-bg: var(--blue-50);
}

/* Dark mode overrides */
.dark {
  --color-text-primary: var(--slate-50);
  --color-text-secondary: var(--slate-300);
  --color-bg-primary: var(--slate-900);
  --color-bg-secondary: var(--slate-800);
}
```

#### 8.2 Create Tailwind Utilities

```javascript
colors: {
  'text-primary': 'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  'bg-primary': 'var(--color-bg-primary)',
  'interactive': 'var(--color-interactive-primary)',
  // ... etc
}
```

#### 8.3 Migration Strategy

- [ ] Create utility class mappings
- [ ] Update high-traffic components first
- [ ] Batch update similar components
- [ ] Validate in both light/dark modes

**Deliverables:**

- ✅ Semantic color system defined
- ✅ Dark mode support consistent
- ✅ 50%+ of components migrated
- ✅ Color usage guide created

---

## Task #9: Extract Animation Utilities

**Current Issue:**

- Inline animation styles
- No consistent timing/easing
- Duplicate animation definitions

**Goal:**
Centralized animation utilities with consistent timing

### Subtasks:

#### 9.1 Define Animation Tokens

```css
:root {
  /* Timing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;

  /* Common Transitions */
  --transition-base: all var(--duration-base) var(--ease-out);
  --transition-colors:
    color var(--duration-base) var(--ease-out),
    background-color var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out);
  --transition-transform: transform var(--duration-base) var(--ease-spring);
}
```

#### 9.2 Create Animation Classes

```css
/* Utility classes */
.animate-fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-medium) var(--ease-spring);
}

.animate-scale-in {
  animation: scaleIn var(--duration-base) var(--ease-spring);
}

/* Keyframes */
@keyframes fadeIn {
  /* ... */
}
@keyframes slideUp {
  /* ... */
}
@keyframes scaleIn {
  /* ... */
}
```

#### 9.3 Update Components

- [ ] Modal enter/exit animations
- [ ] Button hover/active states
- [ ] Dropdown animations
- [ ] Toast notifications
- [ ] Loading spinners

**Deliverables:**

- ✅ Animation tokens defined
- ✅ Utility classes created
- ✅ Components using consistent timing
- ✅ Reduced animation CSS by 40%

---

## Task #10: Consolidate Spacing Scale

**Current Issue:**

- Inconsistent spacing values
- Custom margins/paddings
- No clear spacing rhythm

**Goal:**
Establish 8px grid system with consistent spacing

### Subtasks:

#### 10.1 Define Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}
```

#### 10.2 Audit & Replace

- [ ] Scan for custom spacing values
- [ ] Replace with scale values
- [ ] Ensure visual consistency maintained

**Deliverables:**

- ✅ Spacing scale defined
- ✅ 90%+ components on scale
- ✅ Visual rhythm improved

---

## 📊 Success Metrics

| Metric                | Target               | Measurement        |
| --------------------- | -------------------- | ------------------ |
| Token usage           | 80%+ components      | Code scan          |
| CSS reduction         | -30%                 | Bundle analysis    |
| Design consistency    | 95%+ adherence       | Visual audit       |
| Dark mode support     | 100% semantic colors | Manual test        |
| Animation performance | 60fps                | DevTools profiling |

---

## 🎨 Design Principles

1. **Consistency** - Same patterns across all components
2. **Maintainability** - Central token source of truth
3. **Flexibility** - Easy theme/brand changes
4. **Performance** - CSS optimization via tokens
5. **Accessibility** - WCAG-compliant colors/contrast

---

## 📝 Documentation Deliverables

- [ ] Design Token Reference Guide
- [ ] Component Styling Guidelines
- [ ] Dark Mode Implementation Guide
- [ ] Animation Best Practices
- [ ] Before/After Visual Comparison

---

## 🚀 Next Steps After Phase 3

**Phase 4 - UX Enhancement** (12 hours):

- Bulk operations UI improvements
- Enhanced accessibility (ARIA, focus management)
- Contextual tooltips
- Keyboard navigation polish
- Empty state illustrations

---

**Ready to start Task #6: Border Radius Standardization?** 🎨
