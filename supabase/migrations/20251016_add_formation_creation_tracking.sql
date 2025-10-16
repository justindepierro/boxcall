-- Formation Creation Source Tracking Migration
-- Adds telemetry fields to track formation creation origin and metadata quality
-- For future AI/predictive features

-- Add creation_source enum type
DO $$ BEGIN
  CREATE TYPE formation_creation_source AS ENUM (
    'play_builder',      -- Created while building a play (AddNewPlayModal)
    'diagram_editor',    -- Created from diagram editor
    'formation_library', -- Created directly in formation library
    'formation_builder', -- Created via FormationBuilderModal
    'bulk_import',       -- Imported from CSV/file
    'api',              -- Created via API
    'migration',        -- Created during data migration
    'unknown'           -- Legacy formations without source tracking
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add creation tracking columns to formations table
ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS creation_source formation_creation_source DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS creation_context JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata_completeness INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata_quality TEXT DEFAULT 'incomplete';

-- Add comments for documentation
COMMENT ON COLUMN formations.creation_source IS 'Where this formation was created from (for telemetry and AI training)';
COMMENT ON COLUMN formations.creation_context IS 'Additional context about creation: {play_id, user_action, incomplete_fields, etc}';
COMMENT ON COLUMN formations.metadata_completeness IS 'Completeness score 0-100% based on: name, type, category, tags, personnel, positions, strength';
COMMENT ON COLUMN formations.metadata_quality IS 'Quality classification: complete (100%), good (75-99%), needs_work (50-74%), incomplete (<50%)';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_formations_creation_source ON formations(creation_source);
CREATE INDEX IF NOT EXISTS idx_formations_metadata_quality ON formations(metadata_quality);
CREATE INDEX IF NOT EXISTS idx_formations_metadata_completeness ON formations(metadata_completeness);

-- Function to calculate metadata completeness score
CREATE OR REPLACE FUNCTION calculate_formation_metadata_completeness(formation_row formations)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 10; -- Total number of metadata fields we track
BEGIN
  -- Name (required, always present)
  IF formation_row.name IS NOT NULL AND formation_row.name != '' THEN
    score := score + 10;
  END IF;

  -- Formation type (10 points)
  IF formation_row.formation_type IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Category (10 points)
  IF formation_row.category IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Tags (10 points if at least 1 tag)
  IF formation_row.tags IS NOT NULL AND array_length(formation_row.tags, 1) > 0 THEN
    score := score + 10;
  END IF;

  -- Personnel (10 points)
  IF formation_row.personnel_name IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Player positions (20 points - critical field)
  IF formation_row.player_positions IS NOT NULL 
     AND jsonb_array_length(formation_row.player_positions) > 0 THEN
    score := score + 20;
  END IF;

  -- Strength player (10 points)
  IF formation_row.strength_player_position IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Description (5 points)
  IF formation_row.description IS NOT NULL AND formation_row.description != '' THEN
    score := score + 5;
  END IF;

  -- Run strength (5 points)
  IF formation_row.run_strength IS NOT NULL AND formation_row.run_strength != 'balanced' THEN
    score := score + 5;
  END IF;

  -- Pass strength (5 points)
  IF formation_row.pass_strength IS NOT NULL AND formation_row.pass_strength != 'balanced' THEN
    score := score + 5;
  END IF;

  -- Directionality type (5 points)
  IF formation_row.directionality_type IS NOT NULL AND formation_row.directionality_type != 'unspecified' THEN
    score := score + 5;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine quality classification
CREATE OR REPLACE FUNCTION get_formation_metadata_quality(completeness_score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF completeness_score = 100 THEN
    RETURN 'complete';
  ELSIF completeness_score >= 75 THEN
    RETURN 'good';
  ELSIF completeness_score >= 50 THEN
    RETURN 'needs_work';
  ELSE
    RETURN 'incomplete';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update metadata completeness on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_formation_metadata_quality()
RETURNS TRIGGER AS $$
DECLARE
  completeness_score INTEGER;
BEGIN
  -- Calculate completeness score
  completeness_score := calculate_formation_metadata_completeness(NEW);
  
  -- Update the fields
  NEW.metadata_completeness := completeness_score;
  NEW.metadata_quality := get_formation_metadata_quality(completeness_score);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_formation_metadata_quality ON formations;
CREATE TRIGGER trigger_update_formation_metadata_quality
  BEFORE INSERT OR UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_formation_metadata_quality();

-- Backfill existing formations with default values
UPDATE formations
SET 
  creation_source = 'unknown',
  creation_context = '{}'::jsonb,
  metadata_completeness = calculate_formation_metadata_completeness(formations.*),
  metadata_quality = get_formation_metadata_quality(calculate_formation_metadata_completeness(formations.*))
WHERE creation_source IS NULL;

-- Create analytics view for formation quality tracking
CREATE OR REPLACE VIEW formation_quality_analytics AS
SELECT 
  creation_source,
  metadata_quality,
  COUNT(*) as formation_count,
  AVG(metadata_completeness) as avg_completeness,
  MIN(metadata_completeness) as min_completeness,
  MAX(metadata_completeness) as max_completeness,
  COUNT(*) FILTER (WHERE player_positions IS NULL OR jsonb_array_length(player_positions) = 0) as missing_diagrams_count
FROM formations
GROUP BY creation_source, metadata_quality
ORDER BY creation_source, metadata_quality;

COMMENT ON VIEW formation_quality_analytics IS 'Analytics view for formation metadata quality tracking (for AI training data quality assessment)';
