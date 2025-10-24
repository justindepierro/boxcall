# Design System Audit - Card/Surface Consistency

**Date**: October 24, 2025  
**Status**: In Progress  
**Priority**: High - Visual consistency across entire app

## Executive Summary

**Problem Identified**: Inconsistent card/widget styling throughout the application
- Some components use solid borders only
- Some use drop shadows only
- Some use both borders AND shadows
- No standardized surface elevation system

**User Preference**: Clean environment with shadow-only cards (no borders)

**Solution**: Standardize on shadow-based elevation system, remove border+shadow combinations

---

## Current State Analysis

### ❌ Inconsistencies Found

#### 1. **Border + Shadow Combinations** (REMOVE)
```tsx
// AnnouncementsList.tsx - Line 319
<div className="bg-surface-primary rounded-lg shadow-sm border border-border-subtle">

// AnalyticsDashboard.tsx - Line 471
<div className="border border/40 bg-aurora-shell shadow-md shadow-slate-200/40">

// TeamBulletinHeader.tsx - Line 85
<div className="border border-subtle shadow-card">

// DatabasePerformanceMonitor.tsx - Line 106
<div className="bg-white border-subtle rounded-lg shadow-sm">

// SaveHistoryPanel.tsx - Line 157
<div className="bg-surface-primary border rounded-lg shadow-2xl">
```

#### 2. **Border-Only Cards** (CONVERT TO SHADOW)
```tsx
// PlayerPerformanceDashboard.tsx - Line 167
<div className="border rounded-lg p-4">

// GamePlanningDashboard.tsx - Line 402
<div className="border border-border-medium rounded-lg p-4">

// PracticeScriptPlayList.tsx - Line 59
<div className="border border-subtle rounded-lg p-4">

// FormationHealthDashboard.tsx - Multiple instances
<div className="bg-white rounded-lg border p-6">
```

#### 3. **Hardcoded `bg-white`** (USE DESIGN TOKENS)
```tsx
// Found in 50+ files:
- AnnouncementsList.tsx
- CreateTeam.tsx
- InvitationAcceptPage.tsx
- TeamBulletin.tsx
- FormationHealthDashboard.tsx
- BulkActionToolbar.tsx
- RichTextEditor.tsx
- Many more...
```

#### 4. **Mixed Shadow Classes**
- `shadow-sm` (subtle)
- `shadow-md` (medium)
- `shadow-lg` (large)
- `shadow-xl` (extra large)
- `shadow-2xl` (maximum)
- `shadow-card` (custom token)
- Inconsistent usage across similar components

---

## Proposed Design Language

### ✅ Shadow-Based Elevation System

**Philosophy**: Clean, modern interface with depth created through shadows only

#### Elevation Levels

```typescript
elevation: {
  none: 'shadow-none',           // Flat, no elevation
  subtle: 'shadow-sm',            // Barely perceptible (1px blur)
  card: 'shadow-md',              // Standard cards (4px blur)
  raised: 'shadow-lg',            // Elevated elements (8px blur)
  floating: 'shadow-xl',          // Floating UI (16px blur)
  modal: 'shadow-2xl',            // Modals, overlays (24px blur)
}
```

#### Surface Types

```typescript
surfaces: {
  // Primary surfaces (most content)
  primary: {
    background: 'bg-surface-primary',     // White/dark equivalent
    elevation: 'shadow-md',                // Standard card shadow
    hover: 'hover:shadow-lg',              // Lift on hover
  },
  
  // Secondary surfaces (sidebars, panels)
  secondary: {
    background: 'bg-surface-secondary',    // Gray-50/dark equivalent
    elevation: 'shadow-sm',                // Subtle shadow
    hover: 'hover:shadow-md',              // Slight lift
  },
  
  // Muted surfaces (backgrounds, disabled states)
  muted: {
    background: 'bg-surface-muted',        // Gray-100/dark equivalent
    elevation: 'shadow-none',              // No shadow
    hover: 'hover:shadow-sm',              // Minimal lift
  },
  
  // Interactive surfaces (clickable cards)
  interactive: {
    background: 'bg-surface-primary',
    elevation: 'shadow-md',
    hover: 'hover:shadow-xl hover:-translate-y-0.5', // Pronounced lift
    active: 'active:shadow-lg active:translate-y-0',  // Press effect
  },
}
```

---

## Border Usage Policy

### ✅ When TO Use Borders

1. **Form Inputs** - Borders required for input field definition
   ```tsx
   <input className="border border-border rounded-lg" />
   ```

2. **Dividers** - Separating content within a container
   ```tsx
   <div className="border-t border-border" />
   <div className="border-b border-border-subtle" />
   ```

3. **Outlined Buttons** - Secondary/ghost button variants
   ```tsx
   <button className="border border-border hover:border-brand-primary" />
   ```

4. **Avatars/Badges** - Defining circular/pill shapes
   ```tsx
   <div className="rounded-full border-2 border-white" />
   ```

### ❌ When NOT to Use Borders

1. **Cards** - Use shadows for elevation instead
2. **Panels** - Use shadows for depth
3. **Widgets** - Use shadows for separation
4. **Modals** - Use shadows for overlay effect

---

## Component Mapping

### Card Component Standards

```tsx
// ✅ CORRECT - Shadow only
<Card className="shadow-md hover:shadow-lg">

// ❌ INCORRECT - Border + shadow
<Card className="border shadow-md">

// ❌ INCORRECT - Border only
<Card className="border">

// ✅ CORRECT - Minimal shadow for subtle depth
<Card className="shadow-sm">
```

### Common Component Patterns

#### Announcement/Post Cards
```tsx
// BEFORE (inconsistent)
<div className="border border-subtle shadow-sm">

// AFTER (shadow only)
<div className="bg-surface-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">
```

#### Dashboard Widgets
```tsx
// BEFORE (border + shadow)
<div className="border border-border-medium shadow-lg">

// AFTER (shadow only)
<div className="bg-surface-primary rounded-lg shadow-lg">
```

#### Stat Cards
```tsx
// BEFORE (mixed)
<div className="bg-white border rounded-lg p-6">

// AFTER (shadow + token)
<div className="bg-surface-primary rounded-lg shadow-md p-6">
```

#### Floating Elements (Dropdowns, Tooltips)
```tsx
// BEFORE (border + shadow)
<div className="bg-white border shadow-lg">

// AFTER (strong shadow only)
<div className="bg-surface-primary rounded-lg shadow-xl">
```

---

## Density Standards

### Global Density Scale: 87.5%

**Current Implementation** (from recent changes):
```css
:root {
  font-size: 87.5%; /* 14px base instead of 16px */
}

@media (max-width: 640px) {
  :root {
    font-size: 90%; /* Slightly larger on mobile */
  }
}
```

**Typography Tightening**:
```css
body {
  letter-spacing: -0.01em;
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.02em;
  line-height: 1.3;
}
```

### Spacing Philosophy

- **Compact but breathable**: Use `px-4 py-3` instead of `px-6 py-6`
- **Dense typography**: `text-xs`, `text-sm`, `text-base` (not `text-lg`, `text-xl`)
- **Tight gaps**: `gap-2`, `gap-3` instead of `gap-4`, `gap-6`
- **Small icons**: `h-3.5 w-3.5` instead of `h-4 w-4`

---

## Token Updates Required

### Add to `design-system/tokens.ts`

```typescript
// ============================================================================
// SURFACE & ELEVATION TOKENS
// ============================================================================

export const surfaceTokens = {
  // Surface backgrounds
  primary: 'bg-surface-primary',        // White/dark
  secondary: 'bg-surface-secondary',    // Gray-50/dark
  muted: 'bg-surface-muted',            // Gray-100/dark
  subtle: 'bg-surface-subtle',          // Gray-50/dark
  
  // Elevation shadows (no borders)
  elevation: {
    none: 'shadow-none',
    subtle: 'shadow-sm',         // 1px blur - barely there
    card: 'shadow-md',           // 4px blur - standard cards
    raised: 'shadow-lg',         // 8px blur - prominent elements
    floating: 'shadow-xl',       // 16px blur - dropdowns, tooltips
    modal: 'shadow-2xl',         // 24px blur - overlays, modals
  },
  
  // Interactive states
  hover: {
    subtle: 'hover:shadow-md',
    card: 'hover:shadow-lg',
    raised: 'hover:shadow-xl',
  },
  
  // Rounded corners (consistent)
  rounded: {
    sm: 'rounded-md',      // 6px - small elements
    md: 'rounded-lg',      // 8px - cards, panels
    lg: 'rounded-xl',      // 12px - prominent cards
    full: 'rounded-full',  // Circular
  },
} as const;

// Density scale documentation
export const densityTokens = {
  // Global scale: 87.5% (14px base instead of 16px)
  // Mobile scale: 90% (14.4px base for readability)
  
  spacing: {
    // Card padding (compact)
    card: {
      sm: 'p-3',    // Small cards
      md: 'p-4',    // Standard cards
      lg: 'p-6',    // Large cards
    },
    
    // Inline spacing (tight)
    inline: {
      xs: 'px-2 py-1',   // Badges, tags
      sm: 'px-3 py-2',   // Buttons, inputs
      md: 'px-4 py-3',   // Standard inline
    },
    
    // Gaps (compact)
    gap: {
      xs: 'gap-1',   // 4px - very tight
      sm: 'gap-2',   // 8px - tight
      md: 'gap-3',   // 12px - standard
      lg: 'gap-4',   // 16px - spacious
    },
  },
  
  typography: {
    // Font sizes (scaled down)
    size: {
      xs: 'text-xs',     // 12px (was 12px) - captions
      sm: 'text-sm',     // 14px (was 14px) - body small
      base: 'text-base', // 16px (was 16px) - body standard (scales to 14px)
      lg: 'text-lg',     // 18px (was 18px) - headings (rarely used)
    },
    
    // Line heights (tight)
    leading: {
      tight: 'leading-tight',   // 1.25
      snug: 'leading-snug',     // 1.375
      normal: 'leading-normal', // 1.5
    },
  },
} as const;
```

---

## Migration Plan

### Phase 1: Update Design Tokens ✅
- [x] Add surface and elevation tokens
- [x] Add density documentation
- [ ] Document shadow-only standard

### Phase 2: Update Core Components
- [ ] Update `Card.tsx` to use shadow-only variants
- [ ] Remove border+shadow combinations
- [ ] Use `surfaceTokens` consistently
- [ ] Update all Card variant definitions

### Phase 3: Systematic Component Updates
**Priority: High-visibility pages first**

#### Team Bulletin & Announcements
- [ ] `AnnouncementsList.tsx` - Remove border+shadow
- [ ] `AnnouncementItem.tsx` - Shadow-only cards
- [ ] `AnnouncementComments.tsx` - Consistent shadows
- [ ] `TeamBulletinHeader.tsx` - Remove border

#### Analytics Dashboards
- [ ] `AnalyticsDashboard.tsx` - Shadow-only widgets
- [ ] `TrendAnalyticsDashboard.tsx` - Consistent elevation
- [ ] `GamePlanningDashboard.tsx` - Remove borders
- [ ] `PlayerPerformanceDashboard.tsx` - Shadow cards

#### Forms & Modals
- [ ] `PracticePlannerModal` - Shadow-only panels
- [ ] `AddBlockModal` - Consistent inputs
- [ ] `PracticeScriptModal` - Shadow cards
- [ ] All form inputs - Keep borders (required)

#### Other High-Traffic Pages
- [ ] `RosterPage.tsx` - Consistent cards
- [ ] `PracticePlansPage.tsx` - Shadow widgets
- [ ] `TeamBulletin.tsx` - Stats cards
- [ ] `CreateTeam.tsx` - Form consistency

### Phase 4: Replace Hardcoded Colors
**Target: All `bg-white`, `bg-gray-*` instances**
- [ ] Replace with `bg-surface-primary`
- [ ] Replace with `bg-surface-secondary`
- [ ] Replace with `bg-surface-muted`
- [ ] Use semantic tokens consistently

### Phase 5: Validation
- [ ] Type check all changes
- [ ] Visual regression testing
- [ ] Mobile responsive check
- [ ] Dark mode verification
- [ ] Accessibility audit (contrast, focus states)

---

## Files Requiring Updates

### Immediate Priority (Most Visible)
1. `src/components/team/AnnouncementsList.tsx` - 319, 194
2. `src/components/team/AnnouncementItem.tsx` - Card structure
3. `src/components/team-dashboard/TeamBulletinHeader.tsx` - Line 85
4. `src/components/analytics/AnalyticsDashboard.tsx` - Line 471
5. `src/pages/TeamBulletin.tsx` - Lines 454, 583, 596, 609, 622

### Secondary Priority (Analytics)
6. `src/components/analytics/TrendAnalyticsDashboard.tsx` - Line 137
7. `src/components/analytics/GamePlanningDashboard.tsx` - Line 402
8. `src/components/analytics/PlayerPerformanceDashboard.tsx` - Multiple
9. `src/components/analytics/charts/*` - All chart tooltips

### Tertiary Priority (Modals & Forms)
10. `src/components/practice/PracticePlannerModal/index.tsx` - Line 59
11. `src/components/practice/PracticeScriptModal/index.tsx` - Line 106
12. `src/components/onboarding/TeamOnboardingWizard.tsx` - Line 294
13. `src/components/dev/SaveHistoryPanel.tsx` - Lines 132, 157

### Low Priority (Dev/Admin)
14. `src/components/dev/DevPanel.tsx` - Multiple error displays
15. `src/components/dev/DatabasePerformanceMonitor.tsx` - Line 106
16. `src/pages/AchievementAdminPage.tsx` - Line 269

---

## Expected Impact

### User Experience
- ✅ **Cleaner visual environment** - Less visual noise from borders
- ✅ **Professional SaaS aesthetic** - Modern shadow-based depth
- ✅ **Consistent interactions** - Same hover effects everywhere
- ✅ **Better hierarchy** - Clear depth through shadow levels

### Developer Experience
- ✅ **Single source of truth** - `surfaceTokens` for all surfaces
- ✅ **Clear guidelines** - When to use borders vs shadows
- ✅ **Faster development** - Copy-paste surface patterns
- ✅ **Easier maintenance** - Update tokens, not individual components

### Performance
- ✅ **Smaller CSS** - Remove redundant border+shadow combinations
- ✅ **Better consistency** - Reuse shadow classes
- ✅ **No impact** - Shadow performance is negligible

---

## Design Decision Rationale

### Why Shadow-Only?

1. **Modern SaaS Standard**: Linear, Notion, Figma all use shadow-based depth
2. **Cleaner Aesthetic**: Borders add visual noise, shadows create subtle depth
3. **Better Hover States**: Shadow lift effect feels more natural
4. **Dark Mode Friendly**: Shadows work better than borders in dark themes
5. **Mobile Optimized**: Shadows scale better on small screens

### Why Remove Border+Shadow Combinations?

1. **Visual Redundancy**: Both borders and shadows define edges
2. **Inconsistent Appearance**: Some cards look "heavier" than others
3. **Maintenance Burden**: Two properties to manage instead of one
4. **User Feedback**: "prefer just the drop shadow for a clean environment"

### Why Standardize on Design Tokens?

1. **Single Source of Truth**: Change once, update everywhere
2. **Type Safety**: TypeScript validates token usage
3. **Dark Mode**: Automatic theme adaptation
4. **Consistency**: Impossible to use wrong colors
5. **Documentation**: Tokens self-document usage patterns

---

## Success Metrics

- [ ] 0 instances of `border.*shadow` combinations in components
- [ ] 0 instances of `bg-white` in components (use tokens)
- [ ] 100% of cards use `surfaceTokens` and `elevation` tokens
- [ ] All dashboards have consistent card styling
- [ ] All modals use `shadow-2xl` (not `border`)
- [ ] Visual consistency verified across 10+ key pages

---

## Next Steps

1. **Update tokens.ts** - Add `surfaceTokens`, `densityTokens`
2. **Update Card.tsx** - Shadow-only variants, remove border variants
3. **Systematic updates** - Team Bulletin → Analytics → Forms → Admin
4. **Visual testing** - Compare before/after screenshots
5. **Documentation** - Update component docs with new patterns
6. **Team review** - Get feedback on new standard

---

**Questions? Issues?**
- Slack: #design-system
- Documentation: `/docs/DESIGN_SYSTEM.md`
- Examples: See updated `Card.tsx` and token definitions
