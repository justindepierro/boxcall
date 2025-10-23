# 📚 BoxCall Documentation Index

**Last Updated**: October 17, 2025  
**Status**: ✅ Reorganized (246 root files → 3, all docs in `/docs/`)

Single source for active docs. Legacy & superseded material in `docs/archive/` organized by date.

---

## 🚀 Quick Start

**New to Boxcall?** Start here:

- Setup: [SETUP.md](SETUP.md), [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Development: [DEVELOPMENT.md](DEVELOPMENT.md)
- Quick Start: [guides/QUICK_START_PERSONNEL_FORMATIONS.md](guides/QUICK_START_PERSONNEL_FORMATIONS.md)

---

## ✨ Features (NEW Section!)

### Bulk Operations ⭐ **Latest Feature**

- **[Quick Start](features/BULK_OPERATIONS_QUICK_START.md)** - 5-minute guide, 95-99% time savings!
- **[Architecture](architecture/BULK_OPERATIONS_ARCHITECTURE.md)** - Technical implementation details
- **[Cleanup Guide](features/FORMATION_CLEANUP_GUIDE.md)** - Fix duplicate formations

### Personnel & Playbook

- [Custom Personnel Usage Guide](features/CUSTOM_PERSONNEL_USAGE_GUIDE.md)
- [Bulk Play Import Guide](features/BULK_PLAY_IMPORT_GUIDE.md)
- [Avatar Editor Feature](features/AVATAR_EDITOR_FEATURE.md)

---

## 1. Product & Roadmap

- Unified Roadmap: [product/ROADMAP.md](product/ROADMAP.md)
- Current Status: [CURRENT_STATUS.md](CURRENT_STATUS.md)

## 2. Architecture & Design

### System Architecture

- High-Level Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- **[Bulk Operations Architecture](architecture/BULK_OPERATIONS_ARCHITECTURE.md)** ⭐ NEW
- [FieldCanvas Orchestrator Refactoring](architecture/FIELDCANVAS_ORCHESTRATOR_REFACTORING_GUIDE.md)
- Component System: [COMPONENT_SYSTEM.md](COMPONENT_SYSTEM.md)
- Style System Audit: [STYLE_SYSTEM_AUDIT.md](STYLE_SYSTEM_AUDIT.md)

### Audits & Analysis

- [Database Architecture Analysis](architecture/DATABASE_ARCHITECTURE_ANALYSIS.md)
- [Design Token Audit Report](architecture/DESIGN_TOKEN_AUDIT_REPORT.md)
- [Comprehensive Playbook System Audit](architecture/COMPREHENSIVE_PLAYBOOK_SYSTEM_AUDIT.md)
- [Comprehensive System Audit](architecture/COMPREHENSIVE_SYSTEM_AUDIT.md)

## 3. Database & Migrations

- Integration Overview: [DATABASE_INTEGRATION.md](DATABASE_INTEGRATION.md)
- Table Inventory: [DATABASE_TABLE_INVENTORY.md](DATABASE_TABLE_INVENTORY.md)
- Migration 010 Plan & Counts: [MIGRATION_010_PLAN.md](MIGRATION_010_PLAN.md), [MIGRATION_010_COUNTS.md](MIGRATION_010_COUNTS.md)
- NOT NULL Readiness: [database/NOT_NULL_duplicate_key_PLAN.md](database/NOT_NULL_duplicate_key_PLAN.md)

## 4. Search & Telemetry

- Play Write Path Inventory: [PLAY_WRITE_PATH_INVENTORY.md](PLAY_WRITE_PATH_INVENTORY.md)
- Telemetry Schema: [quality/TELEMETRY_SCHEMA.md](quality/TELEMETRY_SCHEMA.md)

## 5. Performance & Quality

- Performance Status: [PERFORMANCE_OPTIMIZATION_STATUS.md](PERFORMANCE_OPTIMIZATION_STATUS.md)
- Contrast & Style Policies: [BUTTON_VARIANT_POLICY.md](BUTTON_VARIANT_POLICY.md), [BADGE_TAG_GUIDELINES.md](BADGE_TAG_GUIDELINES.md)
- Icon Optimization (archived): [archive/ICON_OPTIMIZATION_COMPLETE.md](archive/ICON_OPTIMIZATION_COMPLETE.md)

## 6. Guides & Setup

### Setup & Configuration

- [Environment Setup](guides/ENVIRONMENT_SETUP.md)
- [Database Setup Diagram](guides/DIAGRAM_DATABASE_SETUP.md)
- [Find Connection String](guides/FIND_CONNECTION_STRING.md)
- [Apply Indexes Guide](guides/APPLY_INDEXES_GUIDE.md)
- Supabase Setup: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Development Guide: [DEVELOPMENT.md](DEVELOPMENT.md)

### Usage Guides

- [Quick Start: Personnel & Formations](guides/QUICK_START_PERSONNEL_FORMATIONS.md)
- Git Safety: [GIT_SAFETY_GUIDE.md](GIT_SAFETY_GUIDE.md)

## 7. Development

- [Codebase Cleanup Plan](development/CODEBASE_CLEANUP_PLAN.md)
- [Database Performance Optimization Plan](development/DATABASE_PERFORMANCE_OPTIMIZATION_PLAN.md)

## 8. Archived Initiatives

**225 historical docs** organized by date in `archive/`:

- **[2025-oct-bulk-ops/](archive/2025-oct-bulk-ops/)** - Bulk operations implementation docs
- **[2025-oct-early/](archive/2025-oct-early/)** - Formation builder, database perf, direction system, bug fixes
- **[2025-q3/](archive/2025-q3/)** - Color enhancements, avatar system, badge system, roster optimization
- **[2024/](archive/2024/)** - Historical documentation

> All completed work preserved for reference. See active docs above for current features.

---

## 📊 Documentation Stats

- **Root Directory**: 3 files (94% reduction! ✨)
  - README.md, CHANGELOG.md, CONTRIBUTING.md
- **Active Docs**: ~27 files (features, architecture, guides, development)
- **Archived Docs**: 225 files (organized by date/topic)
- **Total**: 520+ documentation files

## 9. Finding What You Need

### By Role

- **User**: Start with [Quick Start](#-quick-start) → [Features](#-features-new-section) → [Guides](#6-guides--setup)
- **Developer**: [Architecture](#2-architecture--design) → [Development](#7-development) → [CONTRIBUTING](../CONTRIBUTING.md)
- **Deploying**: [Setup Guides](#6-guides--setup) → [Database Migration](#3-database--migrations)

### By Topic

| Topic               | Docs                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Bulk Operations** | [Quick Start](features/BULK_OPERATIONS_QUICK_START.md), [Architecture](architecture/BULK_OPERATIONS_ARCHITECTURE.md)                 |
| **Formations**      | [Custom Personnel](features/CUSTOM_PERSONNEL_USAGE_GUIDE.md), [Cleanup](features/FORMATION_CLEANUP_GUIDE.md)                         |
| **Database**        | [Architecture](architecture/DATABASE_ARCHITECTURE_ANALYSIS.md), [Performance](development/DATABASE_PERFORMANCE_OPTIMIZATION_PLAN.md) |
| **Setup**           | [Environment](guides/ENVIRONMENT_SETUP.md), [Database](guides/DIAGRAM_DATABASE_SETUP.md)                                             |

---

## 10. Documentation Standards

New docs must:

1. Start with H1 title
2. Include Status line (Active / Archived / Draft)
3. Stay ≤300 lines (split otherwise)
4. Go in `/docs/features/`, `/docs/guides/`, or `/docs/architecture/`
5. Link from this index

Archive completed work to `/docs/archive/YYYY-MM/`

## 11. Maintenance

Run `npm run docs:validate` before PR to ensure no empty docs. Allow intentional empties by adding comment: `<!-- allow-empty -->`.

---

**Last Updated**: October 17, 2025  
**Maintained By**: Documentation Steward  
**Recent Changes**: Reorganized 246 root files → 3, added bulk operations docs
