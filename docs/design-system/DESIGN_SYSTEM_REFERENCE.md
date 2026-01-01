# BoxCall Design System Reference

**Last Updated**: November 27, 2025  
**Status**: ✅ Fixed and Verified

## 🎨 Color System

### Correct Tailwind Utility Classes

Our design tokens are defined in `tailwind.config.js` and map to CSS variables in `design-tokens-unified.css`. Here's what actually works:

#### Background Colors

```tsx
// ✅ CORRECT - These exist and work
bg-primary      → #ffffff (white)
bg-secondary    → #f8fafc (light gray)
bg-tertiary     → #f1f5f9 (slightly darker gray)
bg-surface      → #ffffff (white)
bg-muted        → #f8fafc (light gray)
bg-subtle       → #f1f5f9 (slightly darker gray)

// ❌ WRONG - These don't exist
bg-surface-base       // Not defined
bg-surface-primary    // Not defined
bg-surface-secondary  // Not defined
bg-bg-primary         // Double prefix - don't use
```

#### Text Colors

```tsx
// ✅ CORRECT
text-primary      → #334155 (navy)
text-secondary    → #475569 (medium gray)
text-tertiary     → #64748b (light gray)
text-muted        → #94a3b8 (very light gray)
text-inverse      → #ffffff (white)
text-accent       → #22c55e (jade)
text-disabled     → #cbd5e1 (extremely light gray)

// ❌ WRONG
text-text-primary     // Double prefix - was in Typography.tsx, now fixed
text-text-secondary   // Double prefix - was everywhere, now fixed
text-text-muted       // Double prefix - was everywhere, now fixed
```

#### Border Colors

```tsx
// ✅ CORRECT
border            → #e2e8f0 (default border)
border-primary    → #e2e8f0 (same as default)
border-secondary  → #cbd5e1 (darker border)
border-accent     → #22c55e (jade)
border-focus      → #3b82f6 (blue)
border-muted      → #f1f5f9 (very light border)

// ❌ WRONG
border-border-primary   // Double prefix
border-border-subtle    // Double prefix
```

### Brand Colors (Full Scales)

These are your vibrant accent colors - use them for stats, badges, buttons, and highlights:

```tsx
// Jade (Primary Brand) - Use for success, active states, primary actions
jade-50   → #f0fdf4
jade-100  → #dcfce7
jade-500  → #22c55e  // Main jade
jade-600  → #16a34a
jade-900  → #14532d

// Navy (Secondary Brand) - Use for headers, important text
navy-50   → #f8fafc
navy-500  → #334155  // Main navy
navy-900  → #0f172a

// Orange - Use for warnings, practice-related items
orange-50  → #fff7ed
orange-500 → #f97316
orange-600 → #ea580c

// Purple - Use for game plans, strategic items
purple-50  → #faf5ff
purple-500 → #a855f7
purple-600 → #9333ea

// Cyan, Pink, Amber, Red, Blue, Lime, Indigo - All available with 50-950 scales
```

## 🎯 Component Patterns

### Card Component

The Card component now uses correct classes:

```tsx
// ✅ CORRECT Usage
<Card variant="default">     // bg-white shadow-md
<Card variant="elevated">    // bg-white shadow-lg (best for main content)
<Card variant="subtle">      // bg-gray-50 shadow-sm
<Card variant="filled">      // bg-gray-100 shadow-none
<Card variant="glass">       // bg-white/80 backdrop-blur
<Card variant="accent">      // bg-gradient jade/gray
<Card variant="floating">    // bg-white shadow-2xl (modals)

// Always use bg-white or vanilla Tailwind in Card variants now
```

### Typography Component

Fixed Typography color prop to work correctly:

```tsx
// ✅ CORRECT - Typography color prop now works
<Typography variant="headline-lg" color="primary">
  // Uses text-primary (#334155)
</Typography>

<Typography variant="body" color="secondary">
  // Uses text-secondary (#475569)
</Typography>

<Typography variant="body" color="muted">
  // Uses text-muted (#94a3b8)
</Typography>

// Or use className for custom colors
<Typography variant="headline-lg" className="text-jade-600">
  Vibrant Headline
</Typography>
```

## 📐 Layout Patterns

### Page Container

```tsx
// Standard page layout
<div className="min-h-screen bg-secondary p-4 md:p-6">
  <div className="max-w-7xl mx-auto space-y-6">{/* Your content */}</div>
</div>
```

### Stats Cards (Dashboard Pattern)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Jade Card */}
  <Card variant="elevated" size="lg" interactive>
    <div className="p-4 bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl">
      <Icon name="layers" className="text-jade-600" />
    </div>
    <Typography variant="headline-md" className="text-primary">
      Playbook
    </Typography>
    <Typography variant="body" className="text-secondary">
      Build your game strategy
    </Typography>
    <span className="bg-jade-500 text-white px-3 py-1.5 rounded-lg">
      Active
    </span>
  </Card>

  {/* Orange Card */}
  <Card variant="elevated" size="lg" interactive>
    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
      <Icon name="calendar" className="text-orange-600" />
    </div>
    {/* ... */}
  </Card>

  {/* Purple Card */}
  <Card variant="elevated" size="lg" interactive>
    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
      <Icon name="target" className="text-purple-600" />
    </div>
    {/* ... */}
  </Card>
</div>
```

## 🚫 Common Mistakes (Now Fixed)

### Issue 1: Double Prefixes

**Problem**: Typography component was using `text-text-primary` instead of `text-primary`  
**Fix**: Updated colorClasses in Typography.tsx + global sed replace  
**Status**: ✅ Fixed in all 200+ files

### Issue 2: Non-existent Classes

**Problem**: Code used `bg-surface-base` which doesn't exist in Tailwind config  
**Fix**: Changed to `bg-secondary` which maps to `var(--color-bg-secondary)`  
**Status**: ✅ Fixed in DashboardPage and Card.tsx

### Issue 3: Card Component Background

**Problem**: Card variants used `bg-surface-primary` (doesn't exist as utility)  
**Fix**: Changed to `bg-white` (vanilla Tailwind)  
**Status**: ✅ Fixed in Card.tsx

## 🎨 Best Practices for Football App Aesthetics

### 1. Use Vibrant Accent Colors

```tsx
// Good - Pops with color
<span className="bg-jade-500 text-white px-3 py-1 rounded-lg">
  Active
</span>

// Bad - Washed out
<span className="bg-gray-200 text-gray-700">
  Active
</span>
```

### 2. Shadow-Based Elevation

```tsx
// Good - Clean elevation
<Card variant="elevated" size="lg">

// Bad - Borders feel dated
<div className="border-2 border-gray-300">
```

### 3. Gradient Backgrounds for Icon Containers

```tsx
// Good - Subtle depth
<div className="bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl p-4">
  <Icon name="trophy" className="text-jade-600" />
</div>

// Bad - Flat
<div className="bg-gray-100 p-4">
  <Icon name="trophy" />
</div>
```

### 4. Always Use Semantic Tokens First

```tsx
// Good - Semantic, consistent
<div className="bg-secondary text-primary">

// Bad - Hardcoded, ESLint blocked
<div className="bg-gray-50 text-gray-900">
```

### 5. Interactive States with Lift

```tsx
// Good - Card has hover lift animation
<Card variant="elevated" interactive onClick={...}>

// Bad - No feedback
<div onClick={...}>
```

## 📊 Token Mapping Reference

| CSS Variable             | Tailwind Class   | Actual Value | Usage                |
| ------------------------ | ---------------- | ------------ | -------------------- |
| `--color-bg-primary`     | `bg-primary`     | #ffffff      | White backgrounds    |
| `--color-bg-secondary`   | `bg-secondary`   | #f8fafc      | Page backgrounds     |
| `--color-bg-muted`       | `bg-muted`       | #f8fafc      | Skeleton loading     |
| `--color-text-primary`   | `text-primary`   | #334155      | Headlines, body text |
| `--color-text-secondary` | `text-secondary` | #475569      | Supporting text      |
| `--color-text-muted`     | `text-muted`     | #94a3b8      | Captions, meta       |
| `--color-border-primary` | `border`         | #e2e8f0      | Default borders      |
| `--color-jade-500`       | `jade-500`       | #22c55e      | Primary brand        |
| `--color-orange-500`     | `orange-500`     | #f97316      | Warning/practice     |
| `--color-purple-500`     | `purple-500`     | #a855f7      | Strategic/game plans |

## 🔍 Verification Commands

```bash
# Check for double prefixes (should return 0)
grep -r "text-text-\|bg-bg-\|border-border-" src/ | wc -l

# Check for non-existent classes
grep -r "bg-surface-base\|bg-surface-primary" src/ | wc -l

# Verify Typography component
grep "colorClasses" src/components/design-system/Typography.tsx

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚀 Next Steps

1. **Build Style Guide Page** - Create `/style-guide` route showing all tokens live
2. **Modernize Remaining Pages** - Apply Dashboard pattern to Playbook, TeamBulletin, Roster
3. **Add Football Flourishes** - Field textures, helmet icons, yard markers
4. **Performance Audit** - Ensure all pages feel fast like Dashboard
5. **Documentation** - Screenshot examples of good vs bad usage

---

**Key Takeaway**: Always use semantic tokens (`text-primary`, `bg-secondary`, `border`) instead of raw Tailwind (`text-gray-900`, `bg-gray-50`) or non-existent double prefixes (`text-text-primary`). The design system is now fixed and working correctly! 🎉
