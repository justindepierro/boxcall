Status: Ready (pending execution)
Date: 2025-08-11

## Objective

## SQL Draft

See `database/migrations/010_migration_play_data_normalization.sql`.

# Migration 010 Plan — Play Data Normalization & duplicate_key Backfill

Status: Ready (pending execution)
Date: 2025-08-11

## Objective

Normalize existing `plays` rows so every active (non-archived) play has a canonical `duplicate_key` and trimmed canonical `play_name` / `formation`, preparing for future `NOT NULL` enforcement and downstream analytics.

## Scope

In-Scope:

- Backfill missing `duplicate_key` values (active plays)
- Trim + normalize simple casing for `play_name` (Title Case) & trim `formation`
- Defensive second pass ensuring no empty duplicate_key
- Idempotent SQL (safe to re-run)

Out-of-Scope (future migrations / scripts):

- Enforcing `NOT NULL` on `duplicate_key`
- Adding additional search / tsvector improvements
- Complex formation normalization beyond trimming

## Preconditions

1. Column `duplicate_key` exists (migration 014).
2. Partial unique index `idx_plays_playbook_duplicate_key_active` exists (migration 015) OR will be created before enforcing NOT NULL.
3. All application write paths route via `PlaysDomainService` (guaranteed canonicalization).
4. Health scripts:
   - `npm run dup:health` → PASS (0 active clusters)
   - `npm run dup:readiness` → READY (0 active nulls)
5. Write path guard: `npm run writepath:verify:plays` passes.

## SQL Draft

See `database/migrations/010_migration_play_data_normalization.sql`.

## Idempotency Notes

- UPDATE statements only touch rows that are out of spec (NULL or mismatched trim/case), so subsequent runs are no-ops.
- No schema changes here; purely data adjustments.

## Verification Steps (Post-Run)

```sql
SELECT COUNT(*) AS active_null_duplicate_key
FROM plays WHERE duplicate_key IS NULL AND is_archived = FALSE; -- expect 0

SELECT playbook_id, duplicate_key, COUNT(*)
FROM plays
WHERE is_archived = FALSE
GROUP BY 1,2
HAVING COUNT(*) > 1; -- expect 0 (index should enforce)
```

Optional quality spot checks:

```sql
SELECT id, play_name FROM plays ORDER BY updated_at DESC LIMIT 10;
SELECT DISTINCT formation FROM plays ORDER BY formation LIMIT 20;
```

## Rollback Strategy

Data normalization only. To revert you would need a pre-migration snapshot / backup. No structural changes introduced here.

## Next Migration(s)

1. Migration 011 (Readiness Confirmation Tag—optional) or proceed directly to NOT NULL.
2. Migration 012: `ALTER TABLE plays ALTER COLUMN duplicate_key SET NOT NULL;`
3. (Optional) Migration 013: Add `CHECK (duplicate_key <> '')` if empty strings were a historical risk.

## Risks & Mitigations

| Risk                                    | Impact                        | Mitigation                                                      |
| --------------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| Title Case normalization unintended     | Minor naming preference shift | Keep simple INITCAP only (no aggressive transforms)             |
| Large table update locks                | Write latency during run      | If size grows, convert to batched script or concurrent approach |
| Hidden legacy writer reintroduces nulls | Future readiness failure      | Guard script + domain enforcement already in place              |

## Definition of Done

- SQL merged & reviewed
- Counts snapshot (`migration_010_counts.json`) committed (baseline)
- Post-run verification queries documented / executed (future when data present)

---

Prepared by automation assistant.
