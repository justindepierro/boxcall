-- IMPORTANT: Our migration runner wraps each file in a transaction.
-- Postgres forbids CREATE INDEX CONCURRENTLY inside a transaction (error 25001 encountered).
-- Option A (fast, small table): create non-concurrent index below (will take a brief ACCESS EXCLUSIVE lock while building).
-- Option B (safer for large tables): comment out the non-concurrent statement and run the concurrent form manually:
--   CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_plays_playbook_duplicate_key_active
--     ON plays(playbook_id, duplicate_key)
--     WHERE duplicate_key IS NOT NULL AND is_archived = false;
-- via psql / Supabase SQL editor after ensuring no long-running writes.

CREATE UNIQUE INDEX IF NOT EXISTS idx_plays_playbook_duplicate_key_active
  ON plays(playbook_id, duplicate_key)
  WHERE duplicate_key IS NOT NULL AND is_archived = false;

COMMENT ON INDEX idx_plays_playbook_duplicate_key_active IS 'Ensures one active play per (playbook_id, duplicate_key); archived rows excluded.';
