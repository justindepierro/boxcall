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

### Changed

- Calendar page decomposed into modular components with barrel exports.

### Fixed

- Formatting drift in generated token CSS (elevation multiline & font stack spacing).
- Comment API test expectation alignment.

## [0.0.1] - 2024-01-01

### Added

- Initial project bootstrapping.
