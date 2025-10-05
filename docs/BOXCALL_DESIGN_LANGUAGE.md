# BoxCall Design Language 2025

**Status**: Active Implementation v2.0 — October 5, 2025 \
**Owner**: Design Systems · Product Engineering

> 🎯 **Current Sprint**: Touching up UI, auditing page-by-page implementation \
> 📊 **Token Coverage**: ~85% of components using semantic tokens \
> 🎨 **Design Maturity**: Stabilize phase (weeks 0-4 of roadmap)

---

## Vision & Principles

- **Confident & athletic**: Crisp geometry, bold typography, and decisive color tempo that reflect high-performance football operations.
- **Trustworthy & dependable**: Neutral foundations, predictable spacing, and consistent surfaces signal reliability for coaches and staff.
- **Modern workflow-first**: Layouts favor clarity, speed, and legibility across dense data views, mobile tablets, and shared displays.
- **Accessible by default**: Every token, component, and interaction meets or exceeds WCAG 2.1 AA contrast, focus, and motion guidance.
- **Token-driven**: No ad-hoc values. Components and utilities consume semantic tokens exposed through CSS custom properties and Tailwind extensions.

---

## Core Token Architecture

All primitives live in `src/design-system/tokens.ts` and are generated into CSS variables via `npm run tokens:generate` → `src/styles/generated-tokens.css`.

### Semantic token namespaces

| Namespace                      | Purpose                                         | Example usage                    |
| ------------------------------ | ----------------------------------------------- | -------------------------------- |
| `--color-*`                    | Raw palette values (jade, navy, amber, etc.)    | gradients, diagrams              |
| `--semantic-*`                 | UI-ready semantics (primary, surfaces, borders) | Buttons, cards, nav              |
| `--space-*` & `--spacing-*`    | 8px grid & semantic spacing                     | padding, gaps, layout            |
| `--radius-*`                   | Corner system                                   | buttons, cards, panels           |
| `--shadow-*` & `--elevation-*` | Elevation & state shadows                       | cards, dropdowns, modals         |
| `--duration-*`, `--ease-*`     | Motion curves                                   | transitions & micro-interactions |

### Design contract

1. **Pages** set high-level surfaces, spacing rhythms, and responsive breakpoints.
2. **Layouts** (shell, sidebar, content area) use surface + border tokens.
3. **Components** consume only semantic tokens or Tailwind utilities generated from them.
4. **Variants & states** use focus/hover/active tokens, never manual hex or opacity.
5. **Dark mode** swaps semantic variables; components remain unchanged.

---

## Color System

### Brand hierarchy

| Role              | Light mode                        | Dark mode                             | Tokens                                        |
| ----------------- | --------------------------------- | ------------------------------------- | --------------------------------------------- |
| Primary actions   | `--semantic-primary` → jade 500   | `--semantic-primary` on dark surfaces | `jade` scale, `primaryHover`, `primaryActive` |
| Secondary actions | `--semantic-secondary` → navy 500 | `--semantic-secondary`                | `navy` scale                                  |
| Accent / premium  | `electric-600` pairing with jade  | lighten to `electric-400` on dark     | `purple` / `violet` scales                    |

### Surface + text pairings

| Surface      | Background token                            | Text token                  | Use cases        |
| ------------ | ------------------------------------------- | --------------------------- | ---------------- |
| Base canvas  | `--semantic-bg-primary`                     | `--semantic-text-primary`   | page, dashboards |
| Subtle layer | `--semantic-bg-muted`                       | `--semantic-text-secondary` | section dividers |
| Elevated     | `--semantic-bg-secondary` + `--shadow-card` | `--semantic-text-primary`   | cards, panels    |
| Inverse      | `--semantic-surface-inverse`                | `--semantic-text-inverse`   | toasts, overlays |

### Status semantics

- Success: `--color-success-600` backgrounds with `--color-success-50` overlays.
- Warning: `--color-warning-600` / `--color-warning-bg` pairings.
- Error: `--color-error-600` / `--color-error-bg` pairings.
- Info: adopt `blue` scale (500/600) for messaging and diagrams.

All combinations tested for ≥4.5:1 contrast in both light and dark modes.

---

## Typography

- **Families**: `font-sans` (Inter) for body, `font-display` (Bebas Neue) for major headlines, `font-mono` (JetBrains Mono) for data entry.
- **Scale**: Use Tailwind classes mapped to tokens (`text-xs` → `1rem` line height). Avoid arbitrary `text-[x.xx]` classes.
- **Weights**: `font-medium` for interactive elements, `font-semibold` for titles, `font-bold` reserved for hero messaging.
- **Line rhythm**: Maintain 1.4–1.5 line height for body copy, 1.2 for headings. Use `tracking-wide` only for all caps display moments.

---

## Spacing & Layout

- **Grid**: 8px base grid (`--space-2` = 8px). No `px`, `1.75rem`, or Tailwind decimals. Map to `spacing-*` semantic tokens.
- **Containers**:
  - Page gutters: `var(--spacing-8)` desktop, `var(--spacing-4)` tablet, `var(--spacing-3)` mobile.
  - Section stacking: `var(--spacing-8)` default, `var(--spacing-12)` for hero/summary blocks.
  - Card padding: `var(--spacing-cardPadding)` standard, `var(--spacing-cardPaddingLarge)` for flagship panels.
- **Responsive breakpoints**: use existing Tailwind `md`, `lg`, `xl`. Ensure grid shifts maintain 8px multiples.

---

## Elevation & Radii

- **Cards & surfaces**: `box-shadow: var(--shadow-card)` + `border-radius: var(--radius-card)`.
- **Buttons**: `var(--shadow-button-rest)` on rest, hover/active tokens for state. Border radius `var(--radius-button)`.
- **Modals**: `var(--shadow-modal)`, `var(--radius-modal)`.
- **Glass panels**: `.panel-cupertino` uses panel custom properties; ensure tokens map accordingly.

---

## Component Patterns

### Buttons

- Variants: `primary`, `secondary`, `outline`, `subtle`, `ghost`, `danger`, `success`, `warning`, `link`.
- Sizes: `sm`, `md`, `lg` only (retire `xs`/`xl` for now). Heights: 40 / 48 / 56px via spacing tokens.
- Icon spacing: `gap-2` (16px) standard. Use `var(--spacing-2)` exact values where needed.
- Interaction: focus ring `var(--semantic-focus-ring)` with `focus:ring-2 focus:ring-offset-2`.

### Inputs

- Background `--semantic-bg-secondary`, border `--semantic-border`, text `--semantic-text-primary`.
- Focus state: `border-color: var(--semantic-primary)` + `box-shadow: var(--elevation-focus)`.
- Radius `var(--radius-input)`.

### Cards & Panels

- Background `--semantic-bg-secondary`, border `--semantic-border`, optional header strip using `--semantic-primary` at 4px.
- Padding `var(--spacing-cardPadding)` (desktop) / `var(--spacing-3)` (mobile).
- Use `.elevation-card` utility for hover + active transitions.

### Navigation

- App shell background `--navigation-background` mapped to `--semantic-bg-secondary`.
- Active item uses brand gradient indicator + `nav-item-active` class. Hover uses `--navigation-linkHover` referencing `--semantic-bg-muted`.

### Tables & Data grids

- Header background `var(--semantic-bg-secondary)`.
- Row hover `var(--surface-subtle-hover)`; zebra striping optional via `:nth-child` using tokens.
- Typography: `text-sm`, uppercase header optional with tracking.

### Diagrams & field canvas

- Use semantic diagram tokens (`semanticTokens.diagram`) for players, routes, annotations.
- Maintain consistent stroke widths (2px) tied to spacing scale.

---

## Motion & Interaction

- Durations: `--duration-fast` for hover (150ms), `--duration-base` for primary transitions (200ms).
- Easing: `--ease-out` for hover, `--ease-in-out` for modal transitions.
- Avoid bounce on essential workflows; reserve `--ease-bounce` for celebratory moments (e.g., achievements).
- Haptics: continue medium feedback for primary actions, light for secondary.

---

## Accessibility & Dark Mode

- Dark theme flips surfaces via `.dark` class, reusing semantic tokens—no component overrides allowed.
- Minimum focus target size: 44px (use `min-h-[44px]` or spacing tokens).
- Keyboard: all interactive elements must use visible `focus-ring` utility.
- Motion reduction: respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential animations (`fade-in`, `slide-up`).

---

## Implementation Checklist

1. ✅ Generate fresh tokens: `npm run tokens:generate`.
2. ✅ Wire semantic CSS variables in `src/index.css` (see "Implementation notes").
3. ✅ Update Tailwind theme extension to consume generated tokens.
4. 🚧 Refactor core components (Button, Card, Input, Nav, Table) to align with sizing + token usage - **85% complete**.
5. 🚧 Replace remaining hex/px/rgba values using helper script + manual review - **In progress**.
6. ✅ Verify with `npm run lint`, `npm run type-check`.
7. ⏳ Run Playwright accessibility audit (`npm run test:e2e` or `npm run test:visual`) - **Pending**.

---

## Current UI State Assessment (October 5, 2025)

### Component Library Inventory

We have a robust component library with **50+ UI components** organized in `src/components/ui/`:

#### Layout & Structure ✅

- `Aurora` - Background system with variants (shell, hero, gradient, dashboard, glass)
- `PageLayout` - Consistent page wrapper with title, subtitle, breadcrumbs
- `Card` & `GlassCard` - Surface components with proper elevation
- `Modal` - Dialog system with proper focus management

#### Form Components ✅

- `Button` - 9 variants (primary, secondary, outline, gradient, subtle, ghost, danger, success, warning, link)
- `Input` - Text input with semantic tokens
- `TextArea` - Multi-line input
- `Select` - Dropdown selection
- `Dropdown` - Menu component
- `SegmentedControl` - Toggle group

#### Data Display ✅

- `Table` - Data grid (needs token refinement)
- `Badge` & `MultiBadgeDisplay` - Status indicators
- `RoleBadge` & `PlayMaturityBadge` - Specialized badges
- `UserAvatar` - Profile images
- `EmptyState` - Zero-state patterns

#### Navigation ✅

- `NavBar` & `Sidebar` - Primary navigation
- `Breadcrumb` - Hierarchical navigation
- `Tooltip` - Contextual help

#### Feedback & Loading ✅

- `Toast` - Notification system
- `Skeleton` - Loading states
- `LoadingScreen` - Full-page loading
- `ProgressiveImage` & `OptimizedImage` - Image loading

#### Specialized ✅

- `Icon` & `IconButton` - Icon system
- `Logo` - Brand identity
- `DarkModeToggle` - Theme switcher
- `NotificationBell` - Alert system
- `GlobalSearch` & `UniversalSearch` - Search patterns
- `ConfettiBurst` - Celebration animations

### Page Patterns Analysis

#### ✅ Exemplary Pages (Use as Templates)

1. **DashboardPage** (30 lines)
   - Clean Aurora + PageLayout wrapper
   - Delegates to ResponsiveDashboardLayout
   - Perfect separation of concerns
   ```tsx
   <Aurora variant="shell" fullHeight>
     <PageLayout title="Dashboard" subtitle="..." variant="dashboard">
       <ResponsiveDashboardLayout />
     </PageLayout>
   </Aurora>
   ```

#### ⚠️ Complex Pages (Need Attention)

1. **PlaybookPage** (833 lines)
   - Multiple modals, builders, filters
   - Lazy loads 5+ sub-components
   - Recommendation: Extract to sub-components
   - Good use of context (usePlaybook)
2. **RosterPage** (996 lines)
   - Player management, CSV import, filtering
   - Large form state management
   - Recommendation: Extract form logic to custom hook
   - Extract table to dedicated component

### Design Token Integration Status

#### ✅ Fully Integrated

- Color system: jade, navy, semantic colors
- Spacing system: 8px grid with semantic names
- Elevation system: card, button, modal shadows
- Border radius: button, card, input, modal
- Typography: font families, weights, scales

#### 🚧 Partially Integrated

- **Tables**: Some legacy styles, need semantic token mapping
- **Diagrams**: Has dedicated diagram tokens, needs consistency check
- **Forms**: Mix of token and legacy padding values

#### ⚠️ Legacy Code Found

- `JoinTeam.tsx:280` - Arbitrary text size `text-[1.75rem]`
- `MinimalTooltipTest.tsx` - Inline styles with hex colors (test file, acceptable)
- `CreateCoachAccount.tsx:787` - Inline width style (progress bar, acceptable)

### Design System Metrics

| Metric              | Current  | Target    | Status         |
| ------------------- | -------- | --------- | -------------- |
| Token Coverage      | 85%      | 95%       | 🟡 On Track    |
| Component Library   | 50+      | 60+       | 🟢 Strong      |
| Dark Mode Support   | Yes      | Yes       | 🟢 Complete    |
| Accessibility Score | Est. 80% | 90%+      | 🟡 In Progress |
| Page Performance    | Good     | Excellent | 🟢 Optimized   |
| Storybook Coverage  | ~30%     | 90%       | 🔴 Needs Work  |
| Visual Tests        | 0%       | 80%       | 🔴 Not Started |

---

## Implementation Notes

- Store any component-specific fallbacks in `src/styles/design-language.css` and import after `generated-tokens.css`.
- Remove the hard-coded color objects in `tailwind.config.js`; instead, import `colorTokens` & `semanticTokens` and feed directly into Tailwind.
- Introduce semantic utility classes (e.g., `.bg-surface-elevated`) mapped to CSS variables to eliminate bespoke CSS inside components.
- Use `scripts/suggest-token-replacements.ts` when touching legacy files; commit replacements in focused batches per feature area.
- Keep docs (`docs/BADGE_REPLACEMENT_TEMPLATE.md`) updated when new patterns emerge.

---

## Design Evolution Roadmap

| Horizon           | Timeline    | Strategic Focus                                                                          | Flagship Deliverables                                                                                          | Success Signals                                                                                   |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Stabilize**     | Weeks 0–4   | Finish token adoption, remove visual regressions, harden accessibility                   | Tailwind theme finalized, core UI kit (Button, Input, Card, Tabs, Table) converted, accessibility gating in CI | Zero lint/token drift, Axe + keyboard parity, design QA sign-off                                  |
| **Elevate**       | Weeks 5–10  | Introduce signature visuals, codify motion, unify iconography, expand Storybook coverage | Animation spec, interaction tokens, icon migration plan, visual regression harness                             | Storybook coverage ≥ 90% for shared UI, green visual diff suite, improved NPS feedback on clarity |
| **Differentiate** | Weeks 11–18 | Personalization, theming, cross-platform polish (tablet/offline), design ops tooling     | Theme builder MVP, diagram experience refresh, design token portal, player/fan-facing visual variants          | < 2% theme overrides in code, adoption of designer handoff workflows, positive beta feedback      |

### Key Bets per Horizon

1. **Token Integrity** (Stabilize)

- Finish replacing raw hex/px values outside `src/styles` using automated lint rules.
- Ship token diff dashboard in CI so regressions are flagged alongside tests.
- Pair QA + design systems review on every migration PR.

2. **Expressive Surfaces** (Elevate)

- Craft gradient and noise systems as reusable utilities (w/ light & dark variants).
- Launch motion playbook: entry/exit timelines, haptic pairings, reduced-motion fallbacks.
- Refresh iconography with consistent stroke, weight, optical alignment.

3. **Experience Personalization** (Differentiate)

- Add live theme previewer inside admin/dev tools for real-time token tweaking.
- Bring field diagram and playbook visuals in line with semantic palette (offense, defense, special teams).
- Introduce adaptive density settings (compact/comfortable) controlled via tokens.

### Design Ops Enablers

- **Source of truth**: Publish Storybook “Design System” docs mode with token tables, usage rules, and Figma embed.
- **Quality gates**: Add Vitest visual snapshots + Playwright a11y run to `npm run predev`.
- **Analytics**: Instrument component usage (telemetry) to prioritize upgrades by impact.
- **Education**: Quarterly design/dev pairings, office hours, and lightweight contribution checklist.

---

## Next Steps

### ✅ Completed

- [x] Design token architecture defined (`src/design-system/tokens.ts`)
- [x] Token generation system (`npm run tokens:generate` → `generated-tokens.css`)
- [x] Tailwind integration with semantic tokens
- [x] Core component library (Button, Card, Input, Modal, Aurora, etc.)
- [x] Page layout system with Aurora backgrounds
- [x] Responsive dashboard layouts
- [x] Dark mode foundation with `.dark` class

### 🚧 In Progress (Current Sprint)

- [ ] **Page-by-Page UI Audit** - Reviewing every page for design consistency (Owner: Design Systems · Target: Oct 12)
  - DashboardPage ✅ - Clean, uses Aurora + PageLayout
  - PlaybookPage ⚠️ - Large file (833 lines), needs component extraction
  - RosterPage ⚠️ - Good foundation, needs polish on table styles
  - ProfilePage 🔍 - Needs review
  - TeamSettings 🔍 - Needs review
  - Analytics 🔍 - Needs review
- [ ] **Component Standardization** (Owner: UI Platform · Target: Oct 18)
  - Button variants alignment with token system
  - Card elevation states consistency
  - Input focus states using `--elevation-focus`
  - Table responsive patterns

- [ ] **Token Coverage Expansion** (Owner: Design Systems · Target: Oct 18)
  - Eliminate remaining hardcoded values in pages
  - Replace arbitrary Tailwind classes (e.g., `text-[1.75rem]`)
  - Standardize spacing across all pages

### 📋 Next Quarter (Elevate Phase)

- [ ] Diagram tooling palette + contrast upgrade shipped with playtest feedback loop (Owner: Playbook Team · Target: Nov 8)
- [ ] Motion & accessibility audit applied to top 5 flows (Owner: Experience Lab · Target: Nov 15)
- [ ] Storybook coverage ≥ 90% for shared UI components
- [ ] Visual regression testing with Playwright snapshots
- [ ] Kick off theme builder spike (scoping + prototype) aligning with personalization bet (Owner: Design Systems + Runtime · Target: Nov 22)

---

## Page-by-Page Implementation Status

### Core Pages

| Page                | Status           | Token Usage | Design Notes                                                              | Priority |
| ------------------- | ---------------- | ----------- | ------------------------------------------------------------------------- | -------- |
| **DashboardPage**   | ✅ Excellent     | 95%         | Clean Aurora + PageLayout pattern, responsive grid                        | Low      |
| **PlaybookPage**    | ⚠️ Good          | 85%         | Large component (833 lines), consider splitting. Good use of lazy loading | Medium   |
| **RosterPage**      | ⚠️ Good          | 80%         | Table styles need semantic token alignment                                | Medium   |
| **ProfilePage**     | 🔍 Review Needed | TBD         | Needs comprehensive audit                                                 | High     |
| **TeamSettings**    | 🔍 Review Needed | TBD         | Settings patterns need standardization                                    | High     |
| **AnalyticsPage**   | 🔍 Review Needed | TBD         | Data visualization color scheme review                                    | Medium   |
| **GamePlansPage**   | 🔍 Review Needed | TBD         | Workflow patterns need audit                                              | Medium   |
| **TeamBulletin**    | 🔍 Review Needed | TBD         | Social features styling review                                            | Low      |
| **PracticePlanner** | 🔍 Review Needed | TBD         | Complex interactions need polish                                          | High     |

### Secondary Pages

| Page            | Status           | Notes                                                |
| --------------- | ---------------- | ---------------------------------------------------- |
| **LoginPage**   | ✅ Good          | Auth patterns solid                                  |
| **CreateTeam**  | ⚠️ Review        | Form patterns need standardization                   |
| **JoinTeam**    | ⚠️ Minor Issues  | Has arbitrary text size `text-[1.75rem]` on line 280 |
| **Legal Pages** | ✅ Good          | Typography consistent                                |
| **AwardsPage**  | 🔍 Review Needed | Achievement display patterns                         |

### Admin & Tools

| Page                     | Status           | Notes                    |
| ------------------------ | ---------------- | ------------------------ |
| **CoachManagementPage**  | 🔍 Review Needed | Role management patterns |
| **PlayerDashboardPage**  | 🔍 Review Needed | Player-specific views    |
| **AchievementAdminPage** | 🔍 Review Needed | Admin tooling            |
| **DiagnosticsPage**      | ✅ Good          | Dev tooling              |

---

## Design System Health Check

### Strengths 💪

1. **Token Architecture** - Comprehensive semantic token system in place
2. **Component Library** - Rich set of UI components (~50+ components)
3. **Aurora System** - Beautiful background system with variants (shell, hero, gradient, dashboard)
4. **Layout System** - PageLayout component provides consistency
5. **Responsive Design** - Mobile-first approach with proper breakpoints
6. **Dark Mode Ready** - Token-based theming infrastructure
7. **Accessibility Foundation** - Focus states, ARIA patterns, keyboard navigation
8. **Performance** - Lazy loading, code splitting, optimized images

### Areas for Improvement 🎯

1. **Token Adoption** - Some legacy pages still use arbitrary values
2. **Component Size** - Some page components are very large (800+ lines) and need refactoring
3. **Documentation** - Need Storybook coverage for all components
4. **Visual Testing** - No automated visual regression tests yet
5. **Motion System** - Motion tokens defined but not consistently applied
6. **Icon System** - Need icon standardization audit
7. **Table Components** - Data grid patterns need semantic token alignment

### Risk Areas 🚨

1. **PlaybookPage complexity** - 833 lines, needs architectural review
2. **Hardcoded values** - Found in JoinTeam (line 280), MinimalTooltipTest
3. **Component duplication** - May have similar patterns across different pages
4. **Test coverage** - Need visual regression tests before major refactors

---

## Action Items by Role

### Design Systems Team

1. Complete page-by-page audit (priority: ProfilePage, TeamSettings, PracticePlanner)
2. Document component patterns in Storybook
3. Create token usage lint rules
4. Build token diff dashboard for CI

### UI Platform Team

1. Refactor large page components (PlaybookPage, RosterPage)
2. Standardize table/data grid patterns
3. Audit and fix arbitrary Tailwind values
4. Add visual snapshot tests

### Experience Team

1. Motion system implementation across key flows
2. Accessibility audit on top 5 user journeys
3. Mobile optimization review
4. User feedback integration

---

> This document is the reference truth. Every net-new component or screen must align to these rules, and any deviation requires design systems approval.

---

## Quick Reference for Developers

### Creating a New Page

```tsx
import { Aurora } from "../components/ui/Aurora";
import { PageLayout } from "../components/layout/PageLayout";

export default function MyNewPage() {
  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Page Title"
        subtitle="Optional subtitle"
        variant="default"
      >
        {/* Your content here */}
      </PageLayout>
    </Aurora>
  );
}
```

### Token Usage Examples

#### Colors

```tsx
// ✅ DO: Use semantic tokens
<div className="bg-surface-base text-text-primary border-border">

// ❌ DON'T: Use raw colors
<div className="bg-[#FFFFFF] text-[#000000]">
```

#### Spacing

```tsx
// ✅ DO: Use semantic spacing
<div className="p-card-padding gap-4">

// ❌ DON'T: Use arbitrary values
<div className="p-[24px] gap-[16px]">
```

#### Buttons

```tsx
// ✅ DO: Use Button component with variants
<Button variant="primary" size="md">Action</Button>

// ❌ DON'T: Build custom buttons
<button className="bg-jade-500 px-4 py-2">Action</button>
```

### Common Patterns

#### Card with Content

```tsx
<Card className="p-card-padding">
  <Typography variant="h3" className="mb-4">
    Title
  </Typography>
  <Typography variant="body">Content</Typography>
</Card>
```

#### Form Section

```tsx
<div className="space-y-4">
  <Input label="Field Name" value={value} onChange={setValue} />
  <Button variant="primary">Submit</Button>
</div>
```

#### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Token Reference Cheat Sheet

| Need                | Use This Token               | Tailwind Class                            |
| ------------------- | ---------------------------- | ----------------------------------------- |
| Primary brand color | `--semantic-primary`         | `text-brand-primary` / `bg-brand-primary` |
| Background          | `--semantic-bg-primary`      | `bg-surface-base`                         |
| Card background     | `--semantic-bg-secondary`    | `bg-surface-secondary`                    |
| Border              | `--semantic-border`          | `border-border`                           |
| Text default        | `--semantic-text-primary`    | `text-text-primary`                       |
| Text muted          | `--semantic-text-secondary`  | `text-text-secondary`                     |
| Card padding        | `--spacing-cardPadding`      | `p-card-padding`                          |
| Section gap         | `--spacing-sectionGap`       | `gap-section-gap`                         |
| Button shadow       | `--elevation-button-resting` | `shadow-button`                           |
| Focus ring          | `--semantic-focus-ring`      | `focus-visible:ring-2`                    |

### Debugging Tips

1. **Check token generation**: `npm run tokens:generate`
2. **Verify Tailwind config**: Tokens should be in `tailwind.config.js`
3. **Inspect CSS variables**: Use browser DevTools to check computed `--semantic-*` values
4. **Dark mode testing**: Toggle with `DarkModeToggle` component
5. **Accessibility**: Use browser's accessibility inspector

### Common Pitfalls

❌ **Using raw hex colors**

```tsx
<div style={{ color: '#00A86B' }}>
```

✅ **Use semantic tokens**

```tsx
<div className="text-brand-primary">
```

❌ **Hardcoded spacing**

```tsx
<div style={{ padding: '24px' }}>
```

✅ **Use spacing tokens**

```tsx
<div className="p-6">
```

❌ **Custom shadows**

```tsx
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

✅ **Use elevation tokens**

```tsx
<div className="shadow-card">
```

### Need Help?

- 📖 Full token reference: `src/design-system/tokens.ts`
- 🎨 Component examples: `src/components/ui/`
- 📝 Badge patterns: `docs/BADGE_REPLACEMENT_TEMPLATE.md`
- 🔍 Find token replacements: `scripts/suggest-token-replacements.ts`
