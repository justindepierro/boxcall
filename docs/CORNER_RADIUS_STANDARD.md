# BoxCall Corner Radius Standard
**Date:** October 5, 2025  
**Status:** Active Implementation

## Philosophy
iOS/iPad aesthetic with **minimal radius variation** for visual consistency and professional appearance.

## Standard System (2-Tier)

### Tier 1: Interactive Elements
**Value:** `rounded-lg` (10px)  
**Usage:**
- All buttons (primary, secondary, outline)
- All input fields (text, select, textarea)
- Small badges and chips
- Tooltips and popovers
- Small info boxes
- Checkboxes (iOS style)

### Tier 2: Containers & Cards  
**Value:** `rounded-xl` (12px / 16px)  
**Usage:**
- All cards (dashboard, playbook, roster, team)
- Card component with `variant="glass"` for glassmorphism
- Modal dialogs
- Side panels
- Large hero sections
- Data tables
- Content sections

**Note:** The `GlassCard` component has been deprecated and removed in favor of using `<Card variant="glass">` for glassmorphic styling. This consolidates all card styling into a single, consistent component.

### Special Cases (Exceptions)
**App Icon Tiles:** `rounded-2xl` (16px)
- Reason: Mimics iOS home screen app icons
- Files: `AppIconTile.tsx`

**Profile Pictures/Avatars:** `rounded-xl` or `rounded-2xl`  
- Reason: Avatar aesthetics, can be more generous
- Files: `ProfilePage.tsx`, user avatars

## Migration Strategy

### Phase 1: Consolidate Large Glass Cards ✅
- Convert `rounded-3xl` → `rounded-xl`  
- Files: GamePlansPage, PracticePlansPage, TemplatesPage

### Phase 2: Standardize All Cards ⏳
- Ensure ALL card components use `rounded-xl`
- Update GlassCard default
- Audit: DashboardPage, TeamBulletin, ProfilePage

### Phase 3: Verify Interactive Elements ⏳
- Ensure ALL buttons/inputs use `rounded-lg`
- Check: All forms, modals, action bars

### Phase 4: Final Visual Audit ⏳
- Page-by-page verification
- Remove any outliers

## Page Audit Checklist

### Main Application Pages
- [ ] DashboardPage
- [ ] PlaybookPage
- [ ] RosterPage
- [ ] TeamBulletin
- [ ] ProfilePage
- [ ] GamePlansPage
- [ ] PracticePlansPage
- [ ] TemplatesPage
- [ ] CalendarPage
- [ ] AwardsPage

### Form Pages
- [ ] CreateCoachAccount
- [ ] CreateTeam
- [ ] LoginPage

### Legal Pages (Low Priority)
- [ ] AboutPage
- [ ] ContactPage
- [ ] TermsOfService
- [ ] PrivacyPolicy

## Token Reference

```typescript
// From tailwind.config.js
borderRadius: {
  none: "var(--radius-none)",      // 0
  sm: "var(--radius-sm)",           // 6px   ❌ AVOID
  DEFAULT: "var(--radius-button)",  // 10px  
  md: "var(--radius-md)",           // 10px  ❌ AVOID (use rounded-lg)
  lg: "var(--radius-lg)",           // 12px  ✅ TIER 1
  xl: "var(--radius-xl)",           // 16px  ✅ TIER 2
  "2xl": "var(--radius-2xl)",       // 20px  ⚠️  SPECIAL ONLY
  "3xl": "var(--radius-3xl)",       // 24px  ❌ AVOID
  full: "var(--radius-full)",       // 9999px (circles)
}
```

## Rules

### ✅ DO
- Use `rounded-lg` for ALL interactive elements
- Use `rounded-xl` for ALL cards and containers
- Use `<Card variant="glass">` for glassmorphic styling
- Be consistent within a single page
- Use tokens (rounded-lg, rounded-xl) not hardcoded values

### ❌ DON'T
- Mix rounded-lg and rounded-xl on same type of element
- Use `rounded-3xl` for anything (too large)
- Use bare `rounded` or `rounded-md` (deprecated)
- Use custom values like `rounded-[2.25rem]`
- Use the deprecated `GlassCard` component (use Card instead)

## Component Consolidation

### Card Component
The `Card` component is now the single source of truth for all card styling:

```tsx
// Standard card
<Card variant="default">Content</Card>

// Glassmorphic card (replaces GlassCard)
<Card variant="glass">Content</Card>

// Other variants
<Card variant="elevated">Content</Card>
<Card variant="outlined">Content</Card>
<Card variant="filled">Content</Card>
```

**Migration:** Replace all `<GlassCard>` usage with `<Card variant="glass">` for consistency.

## Success Metrics
- **Zero** instances of `rounded-3xl` in cards
- **< 5** instances of `rounded-2xl` (app icons only)
- **Consistent** radius on same element type across all pages
- **Professional** cohesive iOS aesthetic

## Notes
- Profile pictures and avatars can be more generous (rounded-xl/2xl) for visual hierarchy
- App icon tiles are intentionally different to match iOS home screen
- When in doubt, use rounded-xl for containers, rounded-lg for interactives
