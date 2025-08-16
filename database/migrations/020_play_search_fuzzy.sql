-- 020_play_search_fuzzy.sql
-- Purpose: Add trigram-based fuzzy search fallback for play search.
-- Features:
--  * pg_trgm extension (if not already installed)
--  * Trigram GIN index on play_search_docs.search_text
--  * search_plays_fuzzy function using similarity & optional playbook scope
--  * Does NOT modify existing exact full-text function (search_plays)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_play_search_docs_trgm ON play_search_docs USING GIN (search_text gin_trgm_ops);

CREATE OR REPLACE FUNCTION search_plays_fuzzy(
  q TEXT,
  lim INT DEFAULT 20,
  playbook UUID DEFAULT NULL,
  min_similarity REAL DEFAULT 0.2
) RETURNS TABLE(play_id UUID, similarity REAL) LANGUAGE SQL STABLE AS $$
  SELECT psd.play_id,
         similarity(psd.search_text, q) AS similarity
  FROM play_search_docs psd
  JOIN plays p ON p.id = psd.play_id
  WHERE q IS NOT NULL AND q <> ''
    AND (playbook IS NULL OR psd.playbook_id = playbook)
    AND p.is_archived = FALSE
    AND similarity(psd.search_text, q) >= min_similarity
  ORDER BY similarity DESC
  LIMIT GREATEST(lim,1);
$$;

COMMIT;

-- Verification:
-- SELECT * FROM search_plays_fuzzy('Sooner', 10);
