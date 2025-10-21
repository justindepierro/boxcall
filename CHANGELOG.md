# Changelog

All notable changes to this project will be documented in this file.

The format is based on https://keepachangelog.com/en/1.1.0/ and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- **Phase 13 Complete: Advanced Analytics** (October 21, 2025)
  - **Coverage-Based Intelligence (13.2)**: Track opponent defensive coverage (Cover 0-6, Man, Zone, Blitz) with success rate analysis
  - **Hash Preference Analysis (13.3)**: Left/Middle/Right hash tracking with best-hash recommendations
  - **Situational Recommendations (13.1)**: Context-aware play suggestions for down/distance/field position
  - **Migration 008**: `opponent_coverage` and `hash_mark` columns with CHECK constraints and performance indexes
  - **ExecutionTrackingService**: `getCoverageStats()` and `getHashStats()` for coverage/hash analytics
  - **SituationalRecommender**: Coverage/hash scoring with smart reasoning ("Excellent vs Cover 2 (100%)", "Best from right hash (85%)")
  - **DownDistanceTracker**: Coverage selector and hash position tracking UI
  - **PlayRecommendations**: Coverage stats display and hash preference grid with visual indicators
- **Database CLI Tools**: Simplified database migration workflow
  - `db-cli.js`: Status checks, migration preview, SQL editor shortcuts
  - `migrate-cli.js`: Migration runner with DDL limitation detection
  - `npm run db:migrate:easy`: 5-second workflow (copy SQL + open browser)
  - Comprehensive `DATABASE_CLI_GUIDE.md` documentation
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

- **Project Organization**: Archived 15 old migration scripts to `scripts/archive/old-migrations/`, moved documentation to `docs/`
- Calendar page decomposed into modular components with barrel exports.
- Updated BOXCALL_DESIGN_LANGUAGE.md with implementation status and page-by-page audit matrix.
- Improved JoinTeam input styling to use semantic text size token (text-3xl) instead of arbitrary value.
- **Increased VitePWA maximumFileSizeToCacheInBytes from 2MB to 3MB to support Storybook build**.

### Fixed

- **All TypeScript errors resolved** (commit 2f4971f4)
- Formatting drift in generated token CSS (elevation multiline & font stack spacing).
- Comment API test expectation alignment.
- Arbitrary text size in JoinTeam.tsx (replaced text-[1.75rem] with text-3xl).

### Documentation

- **Phase 13 Complete Documentation**:
  - `PHASE_13_2_COVERAGE_SCORING_COMPLETE.md` - Coverage-based intelligence implementation (647 lines)
  - `PHASE_13_3_HASH_PREFERENCE_COMPLETE.md` - Hash preference analysis implementation (635 lines)
  - `PHASE_13_2_COVERAGE_TRACKING_UI.md` - Coverage tracking UI guide (375 lines)
  - Updated `BOXCALL_AI_ROADMAP.md` with Phase 13 completion status and deferred items
- **Database CLI Documentation**:
  - `DATABASE_CLI_GUIDE.md` - Complete guide to database migration workflow
  - `scripts/archive/old-migrations/README.md` - Archive documentation explaining migration evolution
- Added UI_AUDIT_OCT5_2025.md - comprehensive design system health assessment with 85/100 score.
- Added VISUAL_INSPECTION_CHECKLIST.md - step-by-step page review process.
- Added QUICK_WINS.md - 15 immediate improvements with code examples.
- Updated BOXCALL_DESIGN_LANGUAGE.md with current implementation status, component inventory (50+), and quick reference guide.
- Documented 9 pages requiring design review (ProfilePage, TeamSettings, PracticePlanner, AnalyticsPage, GamePlansPage, etc.).
- Confirmed 85% token coverage across application with target of 95%.

## [0.0.1] - 2024-01-01

### Added

- Initial project bootstrapping.
