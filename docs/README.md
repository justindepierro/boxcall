# 📚 BoxCall Documentation Index

Single source for active docs. Legacy & superseded material lives in `docs/archive` or `docs/archives` (to consolidate).

## 1. Product & Roadmap

- Unified Roadmap: `product/ROADMAP.md`
- Current Status: `CURRENT_STATUS.md`

## 2. Architecture & Design

- High-Level Architecture: `ARCHITECTURE.md`
- Component System: `COMPONENT_SYSTEM.md`
- Style System Audit: `STYLE_SYSTEM_AUDIT.md`
- Professionalization Plan (legacy): `STYLE_PROFESSIONALIZATION_PLAN.md`

## 3. Database & Migrations

- Integration Overview: `DATABASE_INTEGRATION.md`
- Table Inventory: `DATABASE_TABLE_INVENTORY.md`
- Migration 010 Plan & Counts: `MIGRATION_010_PLAN.md`, `MIGRATION_010_COUNTS.md`
- NOT NULL Readiness: `database/NOT_NULL_duplicate_key_PLAN.md`

## 4. Search & Telemetry

- Play Write Path Inventory: `PLAY_WRITE_PATH_INVENTORY.md`
- Telemetry Schema: `quality/TELEMETRY_SCHEMA.md`

## 5. Performance & Quality

- Performance Status: `PERFORMANCE_OPTIMIZATION_STATUS.md`
- Contrast & Style Policies: `BUTTON_VARIANT_POLICY.md`, `BADGE_TAG_GUIDELINES.md`
- Icon Optimization (archived): `archive/ICON_OPTIMIZATION_COMPLETE.md`

## 6. Development & Setup

- Setup: `SETUP.md`, `SUPABASE_SETUP.md`
- Development Guide: `DEVELOPMENT.md`
- Git Safety: `GIT_SAFETY_GUIDE.md`

## 7. Archived Initiatives

- See `archive/` for historical refactor, optimization, and phase completion docs.

## 8. Pending Cleanup Targets

- (None currently) – keep index lean.

## 9. Standards

New docs must:

1. Start with H1 title.
2. Include Status line (Active / Archived / Draft).
3. Stay ≤300 lines (split otherwise).

## 10. Maintenance

Run `npm run docs:validate` before PR to ensure no empty docs. Allow intentional empties by adding comment: `<!-- allow-empty -->`.

---

Last Updated: 2025-08-11
Owner: Documentation Steward (rotate quarterly)
