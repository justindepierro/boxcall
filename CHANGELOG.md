# Changelog

All notable changes to this project will be documented in this file.

The format is based on https://keepachangelog.com/en/1.1.0/ and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Deterministic token & theme generation with verification scripts.
- React Query Devtools toggle (Ctrl/⌘ + `).
- Zod validation layer for calendar domain (events, RSVPs, comments).
- Snapshot tests for generated styles and accessibility smoke test.
- Lighthouse CI configuration and performance gating scripts.
- Diagnostics page (/dev/diagnostics) for runtime + web vitals (development only).
- Release versioning script (scripts/release-version.ts).
- Comprehensive design system documentation (UI_AUDIT_OCT5_2025.md, VISUAL_INSPECTION_CHECKLIST.md, QUICK_WINS.md).
- Empty state and loading state patterns for better UX.
- Breadcrumb navigation for improved page context (PlaybookPage, RosterPage, TeamSettings).
- Storybook documentation for Aurora background component with 9 comprehensive stories.
- Design review audit for 9 pages (docs/audits/9_PAGES_DESIGN_REVIEW.md).
- **Component-level visual regression testing with Storybook Test Runner (118+ components tested)**.
- **Automated visual testing for all Storybook stories with Playwright integration**.
- **Static Storybook build (316 entries, 11.6 MB) for visual regression testing**.
- **Play metadata arrays display in PlayCard** - tags, key_positions, key_players with chip-based UI.
- **Custom play type creation** - inline input in PlayTypeSection with validation (1-50 chars, alphanumeric).
- **Personnel creation panel** - 384px slide-in panel with 5 common quick-creates (11, 12, 21, 10, 22) and custom form.
- **Database migration for custom play types** - removes CHECK constraint, adds validation trigger (20251017_expand_play_types.sql).

### Changed

- Calendar page decomposed into modular components with barrel exports.
- Updated BOXCALL_DESIGN_LANGUAGE.md with implementation status and page-by-page audit matrix.
- Improved JoinTeam input styling to use semantic text size token (text-3xl) instead of arbitrary value.
- **Increased VitePWA maximumFileSizeToCacheInBytes from 2MB to 3MB to support Storybook build**.

### Fixed

- Formatting drift in generated token CSS (elevation multiline & font stack spacing).
- Comment API test expectation alignment.
- Arbitrary text size in JoinTeam.tsx (replaced text-[1.75rem] with text-3xl).

### Documentation

- Added UI_AUDIT_OCT5_2025.md - comprehensive design system health assessment with 85/100 score.
- Added VISUAL_INSPECTION_CHECKLIST.md - step-by-step page review process.
- Added QUICK_WINS.md - 15 immediate improvements with code examples.
- Updated BOXCALL_DESIGN_LANGUAGE.md with current implementation status, component inventory (50+), and quick reference guide.
- Documented 9 pages requiring design review (ProfilePage, TeamSettings, PracticePlanner, AnalyticsPage, GamePlansPage, etc.).
- Confirmed 85% token coverage across application with target of 95%.

## [0.0.1] - 2024-01-01

### Added

- Initial project bootstrapping.
