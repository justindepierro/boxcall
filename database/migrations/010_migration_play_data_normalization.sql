-- 010_migration_play_data_normalization.sql
-- Goal: Backfill / normalize existing play records to ensure canonical fields & duplicate_key present
--        prior to enforcing NOT NULL and relying on uniqueness guarantees.
BEGIN; -- idempotent data normalization (safe to re-run)

-- 1. Backfill duplicate_key where NULL for non-archived plays.
COMMIT; -- end migration 010

-- Rollback Strategy:
-- 010_migration_play_data_normalization.sql
-- Goal: Backfill / normalize existing play records to ensure canonical fields & duplicate_key present
--        prior to enforcing NOT NULL and relying on uniqueness guarantees.
-- Preconditions:
--  - duplicate_key column exists (014)
--  - unique partial index exists (015) or will be applied shortly
--  - Application write path delegates through PlaysDomainService (canonicalization + duplicate_key)
--  - Health scripts show 0 active duplicate clusters, readiness script green
-- Idempotency: Statements guarded with WHERE clauses / NOT EXISTS checks so re-running is safe.

BEGIN; -- idempotent data normalization (safe to re-run)

-- 1. Backfill duplicate_key where NULL for non-archived plays.
-- (Small batch logic could be applied externally if table large; here do in-place update.)
UPDATE plays p
SET duplicate_key = LOWER(TRIM(p.play_name)) || '::' || LOWER(TRIM(p.formation))
WHERE p.duplicate_key IS NULL
  AND p.is_archived = FALSE;

-- 2. (Optional) Normalize play_name & formation inline (ensure trimming & canonical casing).
-- NOTE: If heavy logic required (e.g., formation normalization), prefer application-level tooling first.
-- Example (lightweight trim only):
UPDATE plays
SET play_name = INITCAP(TRIM(play_name))
WHERE play_name <> INITCAP(TRIM(play_name));

UPDATE plays
SET formation = TRIM(formation)
WHERE formation <> TRIM(formation);

-- 3. Ensure no empty duplicate_key values (defensive) - set to computed form or raise notice.
UPDATE plays
SET duplicate_key = LOWER(TRIM(play_name)) || '::' || LOWER(TRIM(formation))
WHERE (duplicate_key = '' OR duplicate_key IS NULL)
  AND is_archived = FALSE;

-- 4. (Future) Add NOT NULL constraint (executed in separate migration after readiness)
-- ALTER TABLE plays ALTER COLUMN duplicate_key SET NOT NULL;

COMMIT; -- end migration 010

-- Rollback Strategy:
--  - This migration is largely data normalization; rollback not strictly necessary.
--  - To "undo" you would need a snapshot/backup. Otherwise, leave as improved canonical state.
-- Verification Post-Run:
--  SELECT COUNT(*) FROM plays WHERE duplicate_key IS NULL AND is_archived = FALSE;  -- expect 0
--  SELECT playbook_id, duplicate_key, COUNT(*) FROM plays WHERE is_archived = FALSE GROUP BY 1,2 HAVING COUNT(*)>1; -- expect 0 (enforced by index)
