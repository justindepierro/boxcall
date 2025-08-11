-- 014_add_duplicate_key_to_plays.sql
-- Purpose: Introduce duplicate_key column (nullable initially) to support canonical de-duplication.
-- Dry Run: Examine potential duplicate clusters using computeDuplicateKey logic in application layer.
-- Rollback: DROP COLUMN duplicate_key (only safe before unique index creation).

BEGIN;

ALTER TABLE plays
  ADD COLUMN IF NOT EXISTS duplicate_key TEXT;

COMMENT ON COLUMN plays.duplicate_key IS 'Canonical duplicate detection key (lowercased play_name + formation). Nullable until backfill complete.';

-- (Future) After backfill & validation:
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_plays_team_duplicate_key ON plays(team_id, duplicate_key) WHERE duplicate_key IS NOT NULL;

COMMIT;
