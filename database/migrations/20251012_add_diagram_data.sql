-- Migration: Add diagram_data JSONB field to plays table
-- Created: October 12, 2025
-- Purpose: Properly store diagram documents as JSONB instead of TEXT

-- ===========================================
-- STEP 1: Add new diagram columns
-- ===========================================

-- Add diagram_data JSONB column for structured diagram storage
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_data JSONB;

-- Add diagram_version for version tracking and migration
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_version INTEGER DEFAULT 2;

-- Add comment for documentation
COMMENT ON COLUMN plays.diagram_data IS 
'JSONB diagram document (version 2+). Contains players array, routes (future), and field settings. Schema: { version: 2, players: [{ id, x, y, label, team, position }], meta: { createdAt, updatedAt } }';

COMMENT ON COLUMN plays.diagram_url IS 
'PNG thumbnail URL (data:image/png or S3/Supabase Storage URL). Generated from diagram_data, not for storing diagram JSON.';

COMMENT ON COLUMN plays.diagram_version IS 
'Diagram document version number. Used for migration compatibility. Current version: 2. Range: 1-10.';

-- ===========================================
-- STEP 2: Create indexes for performance
-- ===========================================

-- GIN index for fast JSON queries (e.g., find plays with specific player positions)
CREATE INDEX IF NOT EXISTS idx_plays_diagram_data 
ON plays USING GIN (diagram_data);

-- Index for diagram version (useful for migration queries)
CREATE INDEX IF NOT EXISTS idx_plays_diagram_version 
ON plays (diagram_version) 
WHERE diagram_data IS NOT NULL;

-- Index for players array within diagram_data
CREATE INDEX IF NOT EXISTS idx_plays_diagram_players 
ON plays USING GIN ((diagram_data->'players'));

-- ===========================================
-- STEP 3: Add validation constraints
-- ===========================================

-- Drop constraints if they exist (for re-running migration)
ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_diagram_version_check;
ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_diagram_requires_version;

-- Ensure diagram_version is within valid range (1-10)
ALTER TABLE plays
ADD CONSTRAINT plays_diagram_version_check 
CHECK (diagram_version BETWEEN 1 AND 10);

-- Ensure if diagram_data exists, diagram_version must be set
ALTER TABLE plays
ADD CONSTRAINT plays_diagram_requires_version
CHECK (
  (diagram_data IS NULL) OR 
  (diagram_data IS NOT NULL AND diagram_version IS NOT NULL)
);

-- ===========================================
-- STEP 4: Migrate existing data
-- ===========================================

-- Migrate existing JSON strings from diagram_url to diagram_data
-- Only migrate if diagram_url looks like JSON (starts with '{')
UPDATE plays
SET 
  diagram_data = diagram_url::jsonb,
  diagram_version = 2
WHERE 
  diagram_url IS NOT NULL
  AND diagram_url LIKE '{%'
  AND diagram_url::jsonb IS NOT NULL
  AND diagram_data IS NULL; -- Don't overwrite if already set

-- Log migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM plays
  WHERE diagram_data IS NOT NULL;
  
  RAISE NOTICE 'Migration complete: % plays now have diagram_data', migrated_count;
END $$;

-- ===========================================
-- STEP 5: Clean up diagram_url field
-- ===========================================

-- Clear diagram_url where it contains JSON (keep only real image URLs)
-- Real image URLs start with 'http', 'https', or 'data:image'
UPDATE plays
SET diagram_url = NULL
WHERE 
  diagram_url IS NOT NULL
  AND diagram_url LIKE '{%'
  AND diagram_data IS NOT NULL;

-- Log cleanup results
DO $$
DECLARE
  remaining_urls INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_urls
  FROM plays
  WHERE diagram_url IS NOT NULL;
  
  RAISE NOTICE 'Cleanup complete: % plays still have diagram_url (actual images)', remaining_urls;
END $$;

-- ===========================================
-- STEP 6: Create helper functions (optional)
-- ===========================================

-- Function to extract player count from diagram
CREATE OR REPLACE FUNCTION get_diagram_player_count(diagram_data JSONB)
RETURNS INTEGER AS $$
BEGIN
  IF diagram_data IS NULL OR diagram_data->'players' IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN jsonb_array_length(diagram_data->'players');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract players by team (offense/defense)
CREATE OR REPLACE FUNCTION get_diagram_players_by_team(diagram_data JSONB, team_name TEXT)
RETURNS JSONB AS $$
BEGIN
  IF diagram_data IS NULL OR diagram_data->'players' IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  RETURN (
    SELECT jsonb_agg(player)
    FROM jsonb_array_elements(diagram_data->'players') AS player
    WHERE player->>'team' = team_name
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Query to verify migration success
-- Run this after migration to check results

-- Check plays with diagram_data
SELECT 
  COUNT(*) as total_plays_with_diagrams,
  COUNT(DISTINCT diagram_version) as unique_versions,
  MIN(diagram_version) as min_version,
  MAX(diagram_version) as max_version
FROM plays
WHERE diagram_data IS NOT NULL;

-- Check plays by diagram version
SELECT 
  diagram_version,
  COUNT(*) as play_count,
  AVG(get_diagram_player_count(diagram_data)) as avg_players_per_diagram
FROM plays
WHERE diagram_data IS NOT NULL
GROUP BY diagram_version
ORDER BY diagram_version;

-- Sample diagram data (first 3 plays)
SELECT 
  id,
  play_name,
  formation,
  diagram_version,
  get_diagram_player_count(diagram_data) as player_count,
  jsonb_pretty(diagram_data) as diagram_structure
FROM plays
WHERE diagram_data IS NOT NULL
LIMIT 3;

-- ===========================================
-- ROLLBACK INSTRUCTIONS
-- ===========================================

-- If you need to rollback this migration:
-- 
-- 1. Drop constraints:
--    ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_diagram_version_check;
--    ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_diagram_requires_version;
--
-- 2. Drop indexes:
--    DROP INDEX IF EXISTS idx_plays_diagram_data;
--    DROP INDEX IF EXISTS idx_plays_diagram_version;
--    DROP INDEX IF EXISTS idx_plays_diagram_players;
--
-- 3. Drop functions:
--    DROP FUNCTION IF EXISTS get_diagram_player_count(JSONB);
--    DROP FUNCTION IF EXISTS get_diagram_players_by_team(JSONB, TEXT);
--
-- 4. Remove columns:
--    ALTER TABLE plays DROP COLUMN IF EXISTS diagram_data;
--    ALTER TABLE plays DROP COLUMN IF EXISTS diagram_version;
