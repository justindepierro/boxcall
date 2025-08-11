-- 019_play_search_docs_enhancements.sql
-- Purpose: Enhance play_search_docs for better relevance & stemming.
-- Changes:
--  * (Revised) Add playbook_id column (denormalized) for scoping & index selectivity (team_id not on plays)
--  * Switch to 'english' config with weighted tsvector segments
--  * Include one_word_play, notes, duplicate_key
--  * Weighting: A=play_name + formation, B=one_word_play + personnel, C=p_type + tags, D=notes
--  * Update trigger + backfill
--  * Update search function to use websearch_to_tsquery for natural queries
-- Safe re-run: Uses IF EXISTS / ADD COLUMN IF NOT EXISTS patterns.

BEGIN;

-- 1. Schema adjustments
ALTER TABLE play_search_docs ADD COLUMN IF NOT EXISTS playbook_id UUID;
CREATE INDEX IF NOT EXISTS idx_play_search_docs_playbook ON play_search_docs(playbook_id);

-- 2. Updated builder function (now returns concatenated raw text still)
CREATE OR REPLACE FUNCTION build_play_search_text(p plays)
RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT trim(
    regexp_replace(
      COALESCE(p.play_name,'') || ' ' ||
      COALESCE(p.formation,'') || ' ' ||
      COALESCE(p.personnel,'') || ' ' ||
      COALESCE(p.p_type,'') || ' ' ||
      COALESCE(p.one_word_play,'') || ' ' ||
      COALESCE(p.duplicate_key,'') || ' ' ||
      COALESCE(p.notes,'') || ' ' ||
      COALESCE(array_to_string(p.tags,' '),''),
      '\s+', ' ', 'g'
    )
  );
$$;

-- 3. Weighted vector builder (separate for clarity)
CREATE OR REPLACE FUNCTION build_play_search_vector(p plays)
RETURNS tsvector LANGUAGE SQL IMMUTABLE AS $$
  SELECT
    setweight(to_tsvector('english', COALESCE(p.play_name,'')), 'A') ||
    setweight(to_tsvector('english', COALESCE(p.formation,'')), 'A') ||
    setweight(to_tsvector('english', COALESCE(p.one_word_play,'')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p.personnel,'')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p.p_type,'')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(p.tags,' '),'')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p.notes,'')), 'D');
$$;

-- 4. Trigger refresh function rewrite
CREATE OR REPLACE FUNCTION refresh_play_search_doc() RETURNS trigger AS $$
DECLARE
  _text TEXT;
  _vec tsvector;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM play_search_docs WHERE play_id = OLD.id;
    RETURN OLD;
  END IF;
  _text := build_play_search_text(NEW);
  _vec := build_play_search_vector(NEW);
  INSERT INTO play_search_docs (play_id, playbook_id, search_text, search_vector, updated_at)
  VALUES (NEW.id, NEW.playbook_id, _text, _vec, NOW())
  ON CONFLICT (play_id)
  DO UPDATE SET playbook_id = EXCLUDED.playbook_id,
                search_text = EXCLUDED.search_text,
                search_vector = EXCLUDED.search_vector,
                updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Rebuild existing docs with new weighting & fields
-- Drop old index to rebuild with new vector content
DROP INDEX IF EXISTS idx_play_search_docs_vector;

INSERT INTO play_search_docs (play_id, playbook_id, search_text, search_vector, updated_at)
SELECT p.id, p.playbook_id, build_play_search_text(p), build_play_search_vector(p), NOW()
FROM plays p
ON CONFLICT (play_id) DO UPDATE SET
  playbook_id = EXCLUDED.playbook_id,
  search_text = EXCLUDED.search_text,
  search_vector = EXCLUDED.search_vector,
  updated_at = NOW();

-- Recreate GIN index
CREATE INDEX IF NOT EXISTS idx_play_search_docs_vector ON play_search_docs USING GIN (search_vector);

-- 6. Replace search function (add team scoping, archived exclusion, natural query parser)
DROP FUNCTION IF EXISTS search_plays(TEXT, INT);
CREATE OR REPLACE FUNCTION search_plays(q TEXT, lim INT DEFAULT 20, playbook UUID DEFAULT NULL)
RETURNS TABLE(play_id UUID, rank REAL) LANGUAGE SQL STABLE AS $$
  SELECT psd.play_id,
         ts_rank_cd(psd.search_vector, websearch_to_tsquery('english', q)) AS rank
  FROM play_search_docs psd
  JOIN plays p ON p.id = psd.play_id
  WHERE q IS NOT NULL AND q <> ''
    AND (playbook IS NULL OR psd.playbook_id = playbook)
    AND p.is_archived = FALSE
    AND psd.search_vector @@ websearch_to_tsquery('english', q)
  ORDER BY rank DESC
  LIMIT GREATEST(lim,1);
$$;

COMMIT;

-- Verification (manual):
-- SELECT play_id, rank FROM search_plays('Sooners', 10); 
-- SELECT play_id, rank FROM search_plays('Sooners Empty', 10);
-- SELECT COUNT(*) FROM play_search_docs WHERE playbook_id IS NULL; -- review any nulls
