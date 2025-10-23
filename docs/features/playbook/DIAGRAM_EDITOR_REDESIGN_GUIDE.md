# Diagram Editor Redesign - Implementation Guide

## 🎯 Objective

Convert the Diagram Editor from dark slate theme to Aurora design system for better readability and consistency with the app.

## 📊 Current State

The diagram editor currently uses:

- Dark backgrounds (`bg-slate-900`, `bg-slate-950`)
- Light text on dark (`text-slate-100`, `text-slate-300`)
- Not matching the app's light, glass-morphism design

## 🎨 Target Design System

**Aurora Design Tokens:**

- `surface-primary` - Main surfaces
- `surface-secondary` - Secondary surfaces
- `surface-card` - Card backgrounds with glass effect
- `text-primary` - Main text
- `text-secondary` - Secondary text
- `text-muted` - Muted text
- `border-border` - Standard borders
- `border-subtle` - Subtle borders
- `brand-primary` - Accent color (jade)

## 📝 Changes Needed

### 1. Main Container (DiagramEditor.tsx line ~508)

**Current:**

```tsx
<div className="flex h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
```

**New:**

```tsx
<div className="flex h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
```

### 2. Sidebar (DiagramEditor.tsx line ~511)

**Current:**

```tsx
<aside className="hidden lg:block w-72 border-r border-slate-800/60 bg-slate-900/50 backdrop-blur-xl px-6 py-8 overflow-y-auto">
```

**New:**

```tsx
<aside className="hidden lg:block w-72 border-r border-border bg-surface-primary/80 backdrop-blur-xl px-6 py-8 overflow-y-auto shadow-sm">
```

### 3. Section Cards

**Current Pattern:**

```tsx
<div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
```

**New Pattern:**

```tsx
<div className="rounded-glass border border-subtle surface-card backdrop-blur-sm p-5 shadow-sm">
```

### 4. Text Colors

**Current → New Mappings:**

- `text-slate-100` → `text-text-primary`
- `text-slate-200` → `text-text-primary`
- `text-slate-300` → `text-text-secondary`
- `text-slate-400` → `text-text-muted`

### 5. Interactive Elements

**Checkboxes/Radio Buttons:**

```tsx
// OLD
className =
  "h-4 w-4 text-jade-600 focus:ring-2 focus:ring-jade-500 focus:ring-offset-2 focus:ring-offset-slate-900 border-slate-600 bg-slate-700";

// NEW
className =
  "h-4 w-4 text-brand-primary focus:ring-2 focus:ring-brand-primary/30 border-border bg-surface-secondary";
```

### 6. Buttons (for selection)

**Current:**

```tsx
className =
  "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-jade-600 hover:bg-slate-800/80";
```

**New:**

```tsx
className =
  "border-border-medium surface-muted text-text-secondary hover:border-brand-primary hover:bg-surface-secondary";
```

## 🔧 Files to Update (Priority Order)

1. ✅ **`DiagramEditor.tsx`** - Main wrapper & sidebars
2. **`components/ModernToolPalette.tsx`** - Top toolbar
3. **`components/FootballFieldCanvas.tsx`** - Field rendering
4. **`components/PlayerPropertiesPanel.tsx`** - Right sidebar
5. **`components/RoutePropertiesPanel.tsx`** - Right sidebar
6. **`components/Toolbar.tsx`** - Additional toolbar
7. **`components/PlayerSidebar.tsx`** - Player list sidebar

## ⚠️ Important Notes

1. **Keep the field canvas** colors for now (green field should stay green)
2. **Player circles** and **routes** should maintain their colors for visibility
3. **Focus on UI chrome** (backgrounds, borders, text) not diagram content
4. **Test after each file** to ensure nothing breaks

## 🧪 Testing Checklist

After changes:

- [ ] Run `npm run type-check`
- [ ] Visual check: Can you read all text?
- [ ] Visual check: Is contrast good?
- [ ] Functional check: Can you select players?
- [ ] Functional check: Can you draw routes?
- [ ] Functional check: Do all controls work?

## 💡 Recommendation

**Option A: Iterative Approach** (Safer)

1. Update DiagramEditor.tsx main container
2. Test and verify
3. Update sidebars
4. Test and verify
5. Continue file-by-file

**Option B: Batch Approach** (Faster but riskier)

1. Use find/replace across all files
2. Fix any TypeScript errors
3. Test comprehensively

## 🚀 Next Steps

Would you like me to:

1. **Continue with careful, incremental updates** to DiagramEditor.tsx?
2. **Create a complete refactored version** of DiagramEditor.tsx for you to review?
3. **Focus on just the most visible parts** first (main container, top bar)?

Let me know your preference!
