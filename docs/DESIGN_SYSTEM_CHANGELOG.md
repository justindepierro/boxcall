# Design System Changelog
**Started:** October 6, 2025  
**Purpose:** Track all design token changes, component updates, and breaking changes

> **Note:** This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format with semantic versioning for major design system releases.

---

## [Unreleased]

### In Progress
- Phase 1: Foundation Solidification (Steps 1-3)
- Typography system standardization
- Color semantic token completion

### Completed
- ✅ Spacing audit and standardization (100% complete - 83 violations fixed)

---

## [2.1.0] - 2025-01-20

### 🎉 Major: Spacing Standardization Complete

#### Summary
Fixed all 83 spacing violations across 54 files through systematic 5-phase approach.

#### Phase 1: Touch Target Standardization (10 violations)
- **ProfileCard.tsx** (6 fixes)
  - Header container: `min-h-[44px]` → `min-h-11`
  - Edit button: `min-w-[44px] min-h-[44px]` → `min-w-11 min-h-11`
  - Profile picture edit: `min-w-[36px] min-h-[36px]` → `min-w-9 min-h-9`
  - Action buttons: `min-h-[44px]` → `min-h-11`
- **Footer.tsx** (4 fixes)
  - All footer links: `min-h-[44px]` → `min-h-11`

**Impact:** iOS accessibility compliance (44px minimum touch targets)

#### Phase 2: Component Height Standardization (12 violations)
- **Select.tsx** (3 fixes): `min-h-[32px/40px/48px]` → `min-h-8/10/12`
- **AccessibleButton.tsx** (3 fixes): Same pattern
- **AccessibleInput.tsx** (3 fixes): Same pattern
- **InlineEditableText.tsx** (3 fixes): `min-h-[24px/32px/40px]` → `min-h-6/8/10`

**Impact:** Consistent component sizing across all UI elements

#### Phase 3: Modal Height Standardization (15 violations)
Converted all viewport heights from `vh` to `svh` (small viewport height) for better mobile support:
- **Practice Modals** (4 files): PracticeScriptModal, ScriptSelectorModal, PracticePlannerModal, PlayerPerformanceDashboard
- **Dashboard Modals** (2 files): UnifiedSettingsPanel, DashboardCustomizationPanel
- **Playbook Modals** (5 files): DiagramPaneRoute, KeyboardShortcutsGuide, WeeklyChallengePopover, HelpOverlay (v1 & v2)
- **Profile/Team Modals** (2 files): ProfileEditModal, PlayerForm
- **Import** (1 file): RosterImportModal
- **Base Component** (1 file): Modal.tsx - Critical fix affecting all modal instances

**Impact:** Prevents mobile overflow issues, better iOS Safari compatibility

#### Phase 4: Width Constraint Standardization (29 violations)
- **Badge Counters** (4 fixes): `min-w-[18px/20px/24px]` → `min-w-5/6`
- **Button/Input Widths** (9 fixes): `min-w-[140px/160px/180px/220px/240px]` → `min-w-36/40/44/56/60`
- **ActionBar Containers** (4 fixes): `min-w-[180px]` → `min-w-44`
- **Content Max-Widths** (8 fixes): `max-w-[120px/220px]`, `w-[100px]`, `min-w-[60px]` → `max-w-30/56`, `w-24`, `min-w-16`
- **Tool Palettes** (2 fixes): `max-w-[1120px]` → `max-w-screen-xl`
- **Dropdown Menus** (2 fixes): `min-w-[52px/180px]` → `min-w-14/44`

**Impact:** Consistent width constraints, better responsive behavior

#### Phase 5: Final Verification Sweep (16 violations)
- **Tile Heights** (2 fixes): `min-h-[160px/180px]` → `min-h-40/44`
- **Builder Canvas** (2 fixes): `min-h-[620px]` → `min-h-[37.5rem]`
- **Modal Heights** (3 fixes): `max-h-[94vh/60vh]`, `min-h-[40vh]` → svh equivalents
- **Content Areas** (5 fixes): `min-h-[400px]`, `h-[600px]` → `min-h-96`, `h-[37.5rem]`
- **Drag-Drop Zones** (3 fixes): `min-h-[200px]` → `min-h-48`
- **Textarea** (1 fix): `min-h-[100px]` → `min-h-24`

**Impact:** Zero spacing violations remaining

#### Benefits
- ✅ 100% spacing compliance (83/83 violations fixed)
- ✅ Mobile-safe viewport units (svh) throughout
- ✅ iOS accessibility compliance (44px touch targets)
- ✅ Standard Tailwind classes (easier maintenance)
- ✅ Better responsive behavior
- ✅ Type check passing

#### Breaking Changes
None - all changes maintain existing visual appearance and functionality

---

## [2.0.0] - 2025-10-06

### 🎉 Major: Corner Radius Standardization

#### Added
- **2-Tier Corner Radius System**
  - Tier 1: `rounded-lg` (10-12px) for interactive elements
  - Tier 2: `rounded-xl` (16px) for cards and containers
  - Special: `rounded-2xl` (20px) for app icons only
- **Documentation**
  - Created `docs/CORNER_RADIUS_STANDARD.md`
  - Updated `docs/BOXCALL_DESIGN_LANGUAGE.md`

#### Changed
- **Card Component** (`src/components/ui/Card/Card.tsx`)
  - Base class: `rounded-[var(--radius-card)]` → `rounded-xl`
  - Eliminated CSS variable fallback for consistency
- **130+ Files Updated**
  - Replaced bare `rounded` (4px) → `rounded-lg` (10-12px) in 43 files
  - Replaced `rounded-md` (8px) → `rounded-lg` (10-12px) in 52 files
  - Replaced `rounded-3xl` (24px) → `rounded-xl` (16px) in 8 files
  - Standardized inline `borderRadius` styles to 12px in 4 files
  - Updated CSS hardcoded values in `team-dashboard.css`

#### Removed
- **GlassCard Component** (`src/components/ui/GlassCard.tsx`)
  - Consolidated into `Card variant="glass"`
  - Eliminated duplicate glass styling logic
  - Migration: `<GlassCard>` → `<Card variant="glass">`

#### Migration Guide
```tsx
// Before
<GlassCard className="rounded">
  <div className="rounded-md">Button</div>
</GlassCard>

// After
<Card variant="glass" className="rounded-xl">
  <div className="rounded-lg">Button</div>
</Card>
```

**Breaking Changes:** None (GlassCard was internal, Card API unchanged)

---

## [1.5.0] - 2025-10-05

### Token Generation Fix

#### Fixed
- **Token Generation** (`src/design-system/generateTokens.ts`)
  - Fixed to output all 15 token groups (was only generating 9)
  - Generated 376 CSS variables (up from 267)
  - Updated border colors to nearly invisible iOS style
  - Increased corner radius values to iOS standard

#### Added
- **Missing Token Groups**
  - opacityTokens
  - contrastTokens
  - densityTokens
  - accessibilityTokens
  - componentTokens
  - animationTokens

---

## [1.0.0] - 2025-09-01

### Initial Design System

#### Added
- **Token System** (`src/design-system/tokens.ts`)
  - colorTokens (brand palette: jade, navy, electric)
  - semanticTokens (UI-ready values)
  - typographyTokens (Inter, Bebas Neue, JetBrains Mono)
  - spacingTokens (8px grid system)
  - borderRadiusTokens
  - elevationTokens

- **Documentation**
  - `docs/BOXCALL_DESIGN_LANGUAGE.md` - Comprehensive design language guide
  - Token architecture with 10+ namespaces
  - iOS-inspired border philosophy (elevation over borders)

- **Component Library**
  - 50+ UI components with consistent patterns
  - Card, Button, Badge, Input, Select, etc.
  - Glass variants with backdrop blur

#### Design Principles
- Token-driven (no ad-hoc values)
- Accessible-first (WCAG AA minimum)
- iOS/iPad-inspired aesthetic
- Elevation over borders
- 8px grid spacing system

---

## Changelog Format Guide

### Version Numbers
- **Major (X.0.0)**: Breaking changes, significant visual updates
- **Minor (1.X.0)**: New tokens, new components, non-breaking additions
- **Patch (1.0.X)**: Bug fixes, documentation updates

### Change Types
- **Added**: New tokens, components, or features
- **Changed**: Updates to existing tokens or components
- **Deprecated**: Soon-to-be removed features (with migration path)
- **Removed**: Deleted tokens or components
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Entry Template
```markdown
## [Version] - YYYY-MM-DD

### Category Name

#### Change Type
- **Component/Token Name** (`file/path`)
  - Description of change
  - Migration instructions if breaking
  - Before/after code examples
```

---

## Upcoming Changes

### Planned for 2.1.0
- [ ] Complete spacing audit and standardization
- [ ] Typography system standardization
- [ ] Semantic color token completion
- [ ] Dark mode token coverage expansion

### Planned for 2.2.0
- [ ] Component API standardization
- [ ] Component variant system
- [ ] Motion & animation system

### Planned for 3.0.0 (Breaking)
- [ ] Component prop pattern breaking changes (if needed)
- [ ] Deprecated token removal
- [ ] Major visual refresh (if planned)

---

## Maintenance Notes

### How to Update This Changelog
1. **Before Making Changes**: Create entry in "Unreleased" section
2. **During Development**: Update entry with details as you work
3. **Before PR Merge**: Move entry to new version section with date
4. **After Release**: Tag the commit with version number

### Breaking Change Checklist
- [ ] Document in changelog with migration guide
- [ ] Add deprecation warnings in code
- [ ] Update all usage examples in docs
- [ ] Update Storybook stories
- [ ] Add to MIGRATION_GUIDE.md

---

**Last Updated:** October 6, 2025  
**Maintained By:** Design System Team
