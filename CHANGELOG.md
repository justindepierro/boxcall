# Changelog

All notable changes to this project will be documented in this file.

The format is based on https://keepachangelog.com/en/1.1.0/ and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Dashboard `ProfileCard` with quick‑edit (avatar, display name, bio) and direct navigation to `/profile`.
- `ProfileEditModal` quick mode with state sync to auth/profile store.
- Unit test covering ProfileCard navigation and quick‑edit behavior.
- Deterministic token & theme generation with verification scripts.
- React Query Devtools toggle (Ctrl/⌘ + `).
- Zod validation layer for calendar domain (events, RSVPs, comments).
- Snapshot tests for generated styles and accessibility smoke test.
- Lighthouse CI configuration and performance gating scripts.
- Diagnostics page (/dev/diagnostics) for runtime + web vitals (development only).
- Release versioning script (scripts/release-version.ts).

### Changed

- Service imports aligned behind `@services` barrel (SSOT); Vite/Vitest/tsconfig aliases updated.
- Telemetry dispatcher decoupled from persistence; console logging gated via a lightweight logger.
- Player dashboard integrates the new `ProfileCard` for consistent profile access.
- Calendar page decomposed into modular components with barrel exports.

### Fixed

- Design-system compliance in ProfileCard (replaced raw buttons; corrected icon color usage).
- Test flakiness in ProfileCard navigation test by unmounting between renders.
- Formatting drift in generated token CSS (elevation multiline & font stack spacing).
- Comment API test expectation alignment.

## [0.0.1] - 2024-01-01

### Added

- Initial project bootstrapping.
