# Play Table Write Path Inventory

Last Updated: 2025-08-11

Purpose: Canonicalize all create/update/delete operations for the `plays` table prior to Migration 010 & future NOT NULL / stricter constraints. This file is human curated and complemented by an automated guard script (`writepath:verify:plays`).

## Classification Legend

- CANONICAL: Accepted domain layer entry point (target steady state)
- PARALLEL: Performs writes but duplicates logic; slated to delegate to canonical or be merged
- READ: Read-only access (allowed)
- DEV: Development / diagnostics utilities (allowed, but never used in production builds)
- SCRIPT: Operational / one-off maintenance scripts (outside runtime)

## Inventory

| File                                              | Lines (approx) | Operation Types                       | Classification        | Notes / Action                                                              |
| ------------------------------------------------- | -------------- | ------------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| `src/services/playsService.ts`                    | 200-480        | insert, update, soft-delete (archive) | CANONICAL             | Source of truth; normalization & FK retry logic.                            |
| `src/services/dataSyncService.ts`                 | 100-360        | optimistic cache only (delegated)     | CANONICAL (delegated) | All writes now route via domain/service; no direct Supabase writes.         |
| `src/lib/database-helpers.ts`                     | 100-140        | select                                | READ                  | Consider deprecating in favor of service method for consistency.            |
| `src/hooks/useTeamsData.ts`                       | 60-120         | select                                | READ                  | Demo-only aggregate fetch; OK.                                              |
| `src/components/dev/dev-actions.ts`               | ~110-130       | delete (hard)                         | DEV                   | Bulk test data purge; ensure guarded behind confirmation.                   |
| `src/components/dev/services/DevToolsActions.ts`  | ~220-240       | select                                | DEV                   | Read-only metrics.                                                          |
| `src/components/dev/system-monitor.ts`            | ~40            | select (count head)                   | DEV                   | Read-only count.                                                            |
| `src/utils/create-sample-data.ts`                 | 70-90          | insert                                | DEV                   | Sample/demo seeding; treat as SCRIPT/DEV; consider routing through service. |
| `src/utils/demo-data-check.ts`                    | 40-60          | select                                | DEV                   | Read-only.                                                                  |
| `scripts/backfill_duplicate_key_node.ts`          | n/a            | select/update                         | SCRIPT                | Maintenance migration support.                                              |
| `scripts/duplicate_key_readiness.ts`              | n/a            | select                                | SCRIPT                | Health / readiness metrics.                                                 |
| `scripts/verify_duplicate_key_health.ts`          | n/a            | select                                | SCRIPT                | Health report.                                                              |
| `scripts/auto_archive_duplicate_key_conflicts.ts` | n/a            | update                                | SCRIPT                | Conflict auto-resolution.                                                   |

## Required Actions

1. (Done) Refactor `dataSyncService` write methods to delegate to `playsService`.
2. Route `create-sample-data.ts` seeds through `playsService` (low priority). (Planned)
3. Guard in place; tightened (removed dataSyncService from allowlist). (Done)

## Guard Script

Run: `npm run writepath:verify:plays`

Fails (exit code 1) if violations are detected. Allowlist is embedded in `scripts/verify_canonical_play_writes.ts`.

## Definition of Done (Write Path Consolidation Phase 1)

- [x] Inventory created & categorized
- [x] Guard script in place
- [x] `dataSyncService` delegates to canonical service (create/update/bulk)
- [ ] All seed / sample writers use canonical service
- [ ] CI includes guard in `validate:full` (pending after refactor)

---

Incremental updates should append changes with date-stamped bullet below:

2025-08-11: Initial inventory + guard script added.
2025-08-11: Delegated DataSyncService writes; tightened guard allowlist.
