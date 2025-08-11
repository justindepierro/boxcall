-- 018_play_search_docs.sql
-- Purpose: Introduce play_search_docs auxiliary table + tsvector index & triggers for fast play search.
-- Idempotent: Uses IF NOT EXISTS guards and creates or replaces trigger/functions.
-- Notes: Initial implementation uses 'simple' text search configuration. Adjust to 'english' if stemming desired.

BEGIN;

CREATE TABLE IF NOT EXISTS play_search_docs (
  play_id UUID PRIMARY KEY REFERENCES plays(id) ON DELETE CASCADE,
  search_text TEXT NOT NULL,
  search_vector tsvector NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to build concatenated search text from a plays row
CREATE OR REPLACE FUNCTION build_play_search_text(p plays)
RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT trim(
    regexp_replace(
      COALESCE(p.play_name,'') || ' ' ||
      COALESCE(p.formation,'') || ' ' ||
      COALESCE(p.personnel,'') || ' ' ||
      COALESCE(p.p_type,'') || ' ' ||
      COALESCE(array_to_string(p.tags,' '),''),
      '\s+', ' ', 'g'
    )
  );
$$;

-- Trigger function to refresh doc on INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION refresh_play_search_doc() RETURNS trigger AS $$
DECLARE
  _text TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM play_search_docs WHERE play_id = OLD.id;
    RETURN OLD;
  END IF;

  _text := build_play_search_text(NEW);
  INSERT INTO play_search_docs (play_id, search_text, search_vector, updated_at)
  VALUES (NEW.id, _text, to_tsvector('simple', _text), NOW())
  ON CONFLICT (play_id)
  DO UPDATE SET search_text = EXCLUDED.search_text,
                search_vector = EXCLUDED.search_vector,
                updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop & recreate triggers to ensure latest definition
DROP TRIGGER IF EXISTS trg_play_search_insert ON plays;
DROP TRIGGER IF EXISTS trg_play_search_update ON plays;
DROP TRIGGER IF EXISTS trg_play_search_delete ON plays;

CREATE TRIGGER trg_play_search_insert
AFTER INSERT ON plays
FOR EACH ROW EXECUTE FUNCTION refresh_play_search_doc();

CREATE TRIGGER trg_play_search_update
AFTER UPDATE ON plays
FOR EACH ROW EXECUTE FUNCTION refresh_play_search_doc();

CREATE TRIGGER trg_play_search_delete
AFTER DELETE ON plays
FOR EACH ROW EXECUTE FUNCTION refresh_play_search_doc();

-- Backfill existing rows (upsert pattern)
INSERT INTO play_search_docs (play_id, search_text, search_vector, updated_at)
SELECT p.id,
       build_play_search_text(p) AS search_text,
       to_tsvector('simple', build_play_search_text(p)) AS search_vector,
       NOW()
FROM plays p
ON CONFLICT (play_id) DO UPDATE SET
  search_text = EXCLUDED.search_text,
  search_vector = EXCLUDED.search_vector,
  updated_at = NOW();

-- Index (not using CONCURRENTLY inside transaction; assuming manageable size)
CREATE INDEX IF NOT EXISTS idx_play_search_docs_vector ON play_search_docs USING GIN (search_vector);

-- Simple search function returning play_id + rank
CREATE OR REPLACE FUNCTION search_plays(q TEXT, lim INT DEFAULT 20)
RETURNS TABLE(play_id UUID, rank REAL) LANGUAGE SQL STABLE AS $$
  SELECT psd.play_id,
         ts_rank_cd(psd.search_vector, plainto_tsquery('simple', q)) AS rank
  FROM play_search_docs psd
  WHERE q IS NOT NULL AND q <> ''
    AND psd.search_vector @@ plainto_tsquery('simple', q)
  ORDER BY rank DESC
  LIMIT GREATEST(lim,1);
$$;

COMMIT;

-- Verification queries (manual):
-- SELECT COUNT(*) FROM play_search_docs; -- should match plays count
-- SELECT * FROM search_plays('slant', 10);
