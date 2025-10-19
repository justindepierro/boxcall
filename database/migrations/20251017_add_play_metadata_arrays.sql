-- =====================================================
-- Migration: Add Play Metadata Arrays
-- Date: October 17, 2025
-- Purpose: Support unlimited play variations, key positions, and player assignments
-- 
-- User Story:
-- - Tags = Play variations (e.g., "IZ Bubble", "IZ Read", "IZ Screen")
-- - Key Positions = Personnel position mappings (e.g., ["X", "Y", "Z"])
-- - Key Players = Roster player UUIDs (e.g., [uuid1, uuid2])
-- - Flags = Situational markers (e.g., ["Red Zone", "2-Minute"])
-- =====================================================

-- =====================================================
-- STEP 1: Add new array columns to plays table
-- =====================================================

ALTER TABLE plays 
  -- Play variations (unlimited)
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Key positions from personnel (e.g., ["X", "Y", "Z"])
  ADD COLUMN IF NOT EXISTS key_positions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Key players from roster (UUIDs referencing team_players.id)
  ADD COLUMN IF NOT EXISTS key_players UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Situational flags
  ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Migration tracking
  ADD COLUMN IF NOT EXISTS metadata_migrated_at TIMESTAMPTZ;

COMMENT ON COLUMN plays.tags IS 'Play variation tags (e.g., "Bubble", "Read", "Screen") - unlimited';
COMMENT ON COLUMN plays.key_positions IS 'Key positions from personnel config (e.g., ["X", "Y"]) - validated';
COMMENT ON COLUMN plays.key_players IS 'Key player UUIDs from team_players table - for roster assignments';
COMMENT ON COLUMN plays.flags IS 'Situational flags (e.g., "Red Zone", "2-Minute", "Goal Line")';

-- =====================================================
-- STEP 2: Migrate existing p_tag1, p_tag2 data to tags array
-- =====================================================

-- Count plays with existing tags
DO $$
DECLARE
  tag1_count INTEGER;
  tag2_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tag1_count FROM plays WHERE p_tag1 IS NOT NULL;
  SELECT COUNT(*) INTO tag2_count FROM plays WHERE p_tag2 IS NOT NULL;
  
  RAISE NOTICE 'Found % plays with p_tag1, % plays with p_tag2', tag1_count, tag2_count;
END $$;

-- Migrate existing tags to array (remove nulls)
UPDATE plays 
SET 
  tags = ARRAY_REMOVE(ARRAY[p_tag1, p_tag2], NULL),
  metadata_migrated_at = NOW()
WHERE p_tag1 IS NOT NULL OR p_tag2 IS NOT NULL;

-- Verify migration
DO $$
DECLARE
  migrated_count INTEGER;
  total_tags INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    SUM(array_length(tags, 1))
  INTO migrated_count, total_tags
  FROM plays
  WHERE array_length(tags, 1) > 0;
  
  RAISE NOTICE 'Successfully migrated % plays with % total tags', migrated_count, total_tags;
END $$;

-- =====================================================
-- STEP 3: Create GIN indexes for array searching
-- =====================================================

-- Index for tag searches (e.g., find all plays with "Bubble" tag)
CREATE INDEX IF NOT EXISTS idx_plays_tags 
  ON plays USING GIN(tags) 
  WHERE array_length(tags, 1) > 0;

-- Index for key position searches
CREATE INDEX IF NOT EXISTS idx_plays_key_positions 
  ON plays USING GIN(key_positions)
  WHERE array_length(key_positions, 1) > 0;

-- Index for key player searches (e.g., find all plays for player X)
CREATE INDEX IF NOT EXISTS idx_plays_key_players 
  ON plays USING GIN(key_players)
  WHERE array_length(key_players, 1) > 0;

-- Index for flag searches (e.g., find all "Red Zone" plays)
CREATE INDEX IF NOT EXISTS idx_plays_flags 
  ON plays USING GIN(flags)
  WHERE array_length(flags, 1) > 0;

-- =====================================================
-- STEP 4: Add validation trigger for key_players
-- =====================================================
-- Ensures all player UUIDs exist in team_players table

CREATE OR REPLACE FUNCTION validate_key_players()
RETURNS TRIGGER AS $$
DECLARE
  player_id UUID;
  invalid_count INTEGER := 0;
  invalid_ids TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Skip if no key_players
  IF NEW.key_players IS NULL OR array_length(NEW.key_players, 1) IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check each player UUID exists in team_players
  FOREACH player_id IN ARRAY NEW.key_players
  LOOP
    IF NOT EXISTS (SELECT 1 FROM team_players WHERE id = player_id) THEN
      invalid_count := invalid_count + 1;
      invalid_ids := array_append(invalid_ids, player_id::TEXT);
    END IF;
  END LOOP;
  
  -- Reject if any invalid UUIDs found
  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Cannot save play: % invalid player IDs in key_players: %', 
      invalid_count, 
      array_to_string(invalid_ids, ', ');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_key_players ON plays;
CREATE TRIGGER trigger_validate_key_players
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  WHEN (NEW.key_players IS NOT NULL AND array_length(NEW.key_players, 1) > 0)
  EXECUTE FUNCTION validate_key_players();

-- =====================================================
-- STEP 5: Helper functions for tag management
-- =====================================================

-- Add a tag to a play (prevents duplicates)
CREATE OR REPLACE FUNCTION add_play_tag(
  play_id UUID,
  tag TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE plays
  SET tags = array_append(tags, tag)
  WHERE id = play_id
    AND NOT (tag = ANY(tags)); -- Prevent duplicates
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_play_tag IS 'Add a tag to a play (prevents duplicates)';

-- Remove a tag from a play
CREATE OR REPLACE FUNCTION remove_play_tag(
  play_id UUID,
  tag TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE plays
  SET tags = array_remove(tags, tag)
  WHERE id = play_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION remove_play_tag IS 'Remove a tag from a play';

-- Get all unique tags across all plays (for autocomplete/filtering)
CREATE OR REPLACE FUNCTION get_all_play_tags(team_id_param UUID DEFAULT NULL)
RETURNS TABLE(tag TEXT, play_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    unnest(tags) as tag, 
    COUNT(*) as play_count
  FROM plays
  WHERE 
    array_length(tags, 1) > 0
    AND (team_id_param IS NULL OR team_id = team_id_param)
  GROUP BY tag
  ORDER BY play_count DESC, tag;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_all_play_tags IS 'Get all unique tags with play counts (for autocomplete/filtering)';

-- =====================================================
-- STEP 6: Backwards compatibility sync (OPTIONAL)
-- =====================================================
-- Keeps p_tag1, p_tag2 in sync with tags array for legacy code

CREATE OR REPLACE FUNCTION sync_play_tags()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if tags actually changed (for UPDATE) or on INSERT
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.tags IS DISTINCT FROM OLD.tags) THEN
    -- When tags array changes, update p_tag1 and p_tag2
    IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
      NEW.p_tag1 := NEW.tags[1];
      NEW.p_tag2 := CASE WHEN array_length(NEW.tags, 1) > 1 THEN NEW.tags[2] ELSE NULL END;
    ELSE
      NEW.p_tag1 := NULL;
      NEW.p_tag2 := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_play_tags ON plays;
CREATE TRIGGER trigger_sync_play_tags
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION sync_play_tags();

COMMENT ON FUNCTION sync_play_tags IS 'Sync first 2 tags to p_tag1, p_tag2 for backwards compatibility';

-- =====================================================
-- STEP 7: Grant permissions
-- =====================================================

-- Grant usage on new columns to authenticated users
GRANT SELECT, INSERT, UPDATE ON plays TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Summary of migration results
SELECT 
  'tags' as column_name,
  COUNT(*) as total_plays,
  COUNT(*) FILTER (WHERE array_length(tags, 1) > 0) as plays_with_data,
  COALESCE(SUM(array_length(tags, 1)), 0) as total_items,
  ROUND(AVG(array_length(tags, 1)), 2) as avg_per_play
FROM plays

UNION ALL

SELECT 
  'key_positions',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(key_positions, 1) > 0),
  COALESCE(SUM(array_length(key_positions, 1)), 0),
  ROUND(AVG(array_length(key_positions, 1)), 2)
FROM plays

UNION ALL

SELECT 
  'key_players',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(key_players, 1) > 0),
  COALESCE(SUM(array_length(key_players, 1)), 0),
  ROUND(AVG(array_length(key_players, 1)), 2)
FROM plays

UNION ALL

SELECT 
  'flags',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(flags, 1) > 0),
  COALESCE(SUM(array_length(flags, 1)), 0),
  ROUND(AVG(array_length(flags, 1)), 2)
FROM plays;

-- Show sample migrated plays
SELECT 
  id,
  play_name,
  p_tag1 as old_tag1,
  p_tag2 as old_tag2,
  tags as new_tags_array,
  array_length(tags, 1) as tag_count,
  metadata_migrated_at
FROM plays
WHERE array_length(tags, 1) > 0
LIMIT 10;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- DROP TRIGGER IF EXISTS trigger_sync_play_tags ON plays;
-- DROP TRIGGER IF EXISTS trigger_validate_key_players ON plays;
-- DROP FUNCTION IF EXISTS sync_play_tags();
-- DROP FUNCTION IF EXISTS validate_key_players();
-- DROP FUNCTION IF EXISTS add_play_tag(UUID, TEXT);
-- DROP FUNCTION IF EXISTS remove_play_tag(UUID, TEXT);
-- DROP FUNCTION IF EXISTS get_all_play_tags(UUID);
-- DROP INDEX IF EXISTS idx_plays_tags;
-- DROP INDEX IF EXISTS idx_plays_key_positions;
-- DROP INDEX IF EXISTS idx_plays_key_players;
-- DROP INDEX IF EXISTS idx_plays_flags;
-- ALTER TABLE plays DROP COLUMN IF EXISTS tags;
-- ALTER TABLE plays DROP COLUMN IF EXISTS key_positions;
-- ALTER TABLE plays DROP COLUMN IF EXISTS key_players;
-- ALTER TABLE plays DROP COLUMN IF EXISTS flags;
-- ALTER TABLE plays DROP COLUMN IF EXISTS metadata_migrated_at;
