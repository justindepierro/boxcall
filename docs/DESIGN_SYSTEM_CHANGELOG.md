# Design System Changelog
**Started:** October 6, 2025  
**Purpose:** Track all design token changes, component updates, and breaking changes

> **Note:** This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format with semantic versioning for major design system releases.

---

## [Unreleased]

### In Progress
- Phase 1: Foundation Solidification (Steps 1-3)
- Spacing audit and standardization
- Typography system standardization
- Color semantic token completion

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
