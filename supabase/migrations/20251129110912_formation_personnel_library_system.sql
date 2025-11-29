-- ============================================================================
-- FORMATION & PERSONNEL LIBRARY SYSTEM MIGRATION
-- ============================================================================
-- Date: November 29, 2025
-- Purpose: Add metadata columns to formations table and ensure data compatibility
-- Maintains: All existing formations, personnel configs, and play relationships
-- ============================================================================

-- ===========================================
-- 1. EXPAND FORMATIONS TABLE WITH METADATA
-- ===========================================

-- Add formation_type column (e.g., "3x1", "2x2", "Empty", "I Formation")
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS formation_type TEXT;

-- Add run_strength column (left, right, balanced)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS run_strength TEXT
CHECK (run_strength IN ('left', 'right', 'balanced'));

-- Add pass_strength column (left, right, balanced)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS pass_strength TEXT
CHECK (pass_strength IN ('left', 'right', 'balanced'));

-- Add strength_player_position for tracking which player sets strength
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS strength_player_position TEXT;

-- Add is_standalone flag (formations without opposites)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN DEFAULT false;

-- Add confidence_score for intelligence system (0-100)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0
CHECK (confidence_score >= 0 AND confidence_score <= 100);

-- Add last_analyzed_at for tracking when intelligence was last run
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ;

-- Add analysis_play_count for tracking sample size
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS analysis_play_count INTEGER DEFAULT 0;

-- Note: direction, opposite_formation_id, player_positions, usage_count already exist
-- from migration 20251028000000_fix_database_schema_issues.sql

-- ===========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- Index for formation_type filtering
CREATE INDEX IF NOT EXISTS idx_formations_formation_type
ON formations(formation_type) WHERE formation_type IS NOT NULL;

-- Index for strength filtering
CREATE INDEX IF NOT EXISTS idx_formations_run_strength
ON formations(run_strength) WHERE run_strength IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_formations_pass_strength
ON formations(pass_strength) WHERE pass_strength IS NOT NULL;

-- Index for standalone formations
CREATE INDEX IF NOT EXISTS idx_formations_is_standalone
ON formations(is_standalone) WHERE is_standalone = true;

-- Index for confidence score (high to low)
CREATE INDEX IF NOT EXISTS idx_formations_confidence_score
ON formations(confidence_score DESC) WHERE confidence_score > 0;

-- ===========================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON COLUMN formations.formation_type IS 'Formation type classification: 3x1, 2x2, Empty, I Formation, Singleback, Pistol, Shotgun, etc.';
COMMENT ON COLUMN formations.run_strength IS 'Run strength direction: left, right, balanced. Can be overridden by play-specific back alignment.';
COMMENT ON COLUMN formations.pass_strength IS 'Pass strength direction: left, right, balanced. Based on receiver distribution.';
COMMENT ON COLUMN formations.strength_player_position IS 'Position that sets the strength (e.g., TE, RB, H). Used for determining left/right.';
COMMENT ON COLUMN formations.is_standalone IS 'TRUE if formation has no opposite variant (e.g., Trips, Doubles, Empty). FALSE if part of Left/Right pair.';
COMMENT ON COLUMN formations.confidence_score IS 'Confidence score (0-100) from FormationIntelligenceService. Based on agreement % across plays using this formation.';
COMMENT ON COLUMN formations.last_analyzed_at IS 'Timestamp of last intelligence analysis run. NULL if never analyzed.';
COMMENT ON COLUMN formations.analysis_play_count IS 'Number of plays analyzed to derive formation metadata. Higher = more reliable confidence score.';
COMMENT ON COLUMN formations.opposite_formation_id IS 'UUID of opposite formation variant (e.g., Rip ↔ Liz, Left ↔ Right). NULL for standalone formations.';
COMMENT ON COLUMN formations.direction IS 'Formation direction: left or right. NULL for standalone formations like Doubles, Empty.';
COMMENT ON COLUMN formations.player_positions IS 'JSONB array of player positions with x/y coordinates, labels, roles. Used for diagram rendering.';
COMMENT ON COLUMN formations.usage_count IS 'Number of plays using this formation. Auto-incremented by triggers.';
COMMENT ON COLUMN formations.metadata_quality IS 'Metadata completeness: complete (all fields set), needs_work (partial), incomplete (minimal).';

-- ===========================================
-- 4. VERIFY PERSONNEL_CONFIGURATIONS TABLE
-- ===========================================

-- Ensure personnel_configurations has all necessary columns
-- (Already created in 20251024000000_bulletproof_database_reconstruction.sql)

-- Add confidence_score for personnel intelligence
ALTER TABLE personnel_configurations
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0
CHECK (confidence_score >= 0 AND confidence_score <= 100);

-- Add last_analyzed_at for personnel intelligence
ALTER TABLE personnel_configurations
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ;

-- Add analysis_play_count for personnel intelligence
ALTER TABLE personnel_configurations
ADD COLUMN IF NOT EXISTS analysis_play_count INTEGER DEFAULT 0;

-- Add usage_count for personnel tracking
ALTER TABLE personnel_configurations
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Create index for confidence score
CREATE INDEX IF NOT EXISTS idx_personnel_configurations_confidence_score
ON personnel_configurations(confidence_score DESC) WHERE confidence_score > 0;

-- Create index for usage count
CREATE INDEX IF NOT EXISTS idx_personnel_configurations_usage_count
ON personnel_configurations(usage_count DESC) WHERE usage_count > 0;

COMMENT ON COLUMN personnel_configurations.confidence_score IS 'Confidence score (0-100) from intelligence analysis of plays using this personnel package.';
COMMENT ON COLUMN personnel_configurations.last_analyzed_at IS 'Timestamp of last intelligence analysis. NULL if never analyzed.';
COMMENT ON COLUMN personnel_configurations.analysis_play_count IS 'Number of plays analyzed. Higher = more reliable badge customization.';
COMMENT ON COLUMN personnel_configurations.usage_count IS 'Number of plays using this personnel package.';

-- ===========================================
-- 5. DATA MIGRATION: BACKFILL FROM PLAYS
-- ===========================================

-- Create temporary function to analyze and populate formation metadata from plays
CREATE OR REPLACE FUNCTION backfill_formation_metadata()
RETURNS TABLE (
  formation_name TEXT,
  playbook_id UUID,
  plays_analyzed INTEGER,
  formation_type_derived TEXT,
  run_strength_derived TEXT,
  pass_strength_derived TEXT,
  confidence INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH formation_stats AS (
    SELECT
      f.id AS formation_id,
      f.name AS formation_name,
      f.playbook_id,
      COUNT(p.id) AS play_count,
      -- Most common f_type (formation type)
      MODE() WITHIN GROUP (ORDER BY p.f_type) AS most_common_f_type,
      COUNT(DISTINCT p.f_type) AS f_type_variety,
      -- Most common r_str (run strength)
      MODE() WITHIN GROUP (ORDER BY p.r_str) AS most_common_r_str,
      COUNT(DISTINCT p.r_str) AS r_str_variety,
      -- Most common p_str (pass strength)
      MODE() WITHIN GROUP (ORDER BY p.p_str) AS most_common_p_str,
      COUNT(DISTINCT p.p_str) AS p_str_variety,
      -- Most common personnel
      MODE() WITHIN GROUP (ORDER BY p.personnel) AS most_common_personnel
    FROM formations f
    LEFT JOIN plays p ON p.formation_id = f.id
    WHERE p.id IS NOT NULL -- Only count actual plays
      AND p.is_archived = false
    GROUP BY f.id, f.name, f.playbook_id
  )
  SELECT
    fs.formation_name,
    fs.playbook_id,
    fs.play_count::INTEGER,
    fs.most_common_f_type,
    fs.most_common_r_str,
    fs.most_common_p_str,
    -- Calculate confidence based on agreement
    CASE
      WHEN fs.play_count >= 10 THEN 95
      WHEN fs.play_count >= 5 THEN 85
      WHEN fs.play_count >= 3 THEN 75
      WHEN fs.play_count >= 1 THEN 60
      ELSE 0
    END AS confidence
  FROM formation_stats fs
  WHERE fs.play_count > 0; -- Only formations with plays
END;
$$ LANGUAGE plpgsql;

-- Update formations table with derived metadata (non-destructive)
-- Only updates NULL values - preserves any manually set data
UPDATE formations f
SET
  formation_type = COALESCE(f.formation_type, analysis.formation_type_derived),
  run_strength = COALESCE(f.run_strength, analysis.run_strength_derived),
  pass_strength = COALESCE(f.pass_strength, analysis.pass_strength_derived),
  confidence_score = analysis.confidence,
  last_analyzed_at = NOW(),
  analysis_play_count = analysis.plays_analyzed
FROM backfill_formation_metadata() analysis
WHERE f.name = analysis.formation_name
  AND f.playbook_id = analysis.playbook_id;

-- Drop temporary function
DROP FUNCTION IF EXISTS backfill_formation_metadata();

-- ===========================================
-- 6. UPDATE USAGE COUNTS
-- ===========================================

-- Update formation usage_count based on linked plays
UPDATE formations f
SET usage_count = (
  SELECT COUNT(*)
  FROM plays p
  WHERE p.formation_id = f.id
    AND p.is_archived = false
);

-- Update personnel usage_count based on plays
UPDATE personnel_configurations pc
SET usage_count = (
  SELECT COUNT(*)
  FROM plays p
  WHERE p.personnel = pc.name
    AND p.playbook_id = pc.playbook_id
    AND p.is_archived = false
);

-- ===========================================
-- 7. CREATE HELPER FUNCTIONS FOR INTELLIGENCE
-- ===========================================

-- Function to detect opposite formations by name pattern
CREATE OR REPLACE FUNCTION detect_opposite_formations()
RETURNS TABLE (
  formation_id UUID,
  formation_name TEXT,
  opposite_id UUID,
  opposite_name TEXT,
  match_confidence TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH name_patterns AS (
    SELECT
      f1.id AS id1,
      f1.name AS name1,
      f1.playbook_id,
      f2.id AS id2,
      f2.name AS name2,
      CASE
        -- Exact Rip ↔ Liz pattern
        WHEN f1.name ILIKE '%rip%' AND f2.name ILIKE '%liz%' THEN 'high'
        WHEN f1.name ILIKE '%liz%' AND f2.name ILIKE '%rip%' THEN 'high'
        -- Larry ↔ Ringo pattern
        WHEN f1.name ILIKE '%larry%' AND f2.name ILIKE '%ringo%' THEN 'high'
        WHEN f1.name ILIKE '%ringo%' AND f2.name ILIKE '%larry%' THEN 'high'
        -- Left ↔ Right pattern
        WHEN f1.name ILIKE '%left%' AND f2.name ILIKE '%right%' THEN 'medium'
        WHEN f1.name ILIKE '%right%' AND f2.name ILIKE '%left%' THEN 'medium'
        -- L ↔ R single letter pattern
        WHEN f1.name ILIKE '% L %' AND f2.name ILIKE '% R %' THEN 'medium'
        WHEN f1.name ILIKE '% R %' AND f2.name ILIKE '% L %' THEN 'medium'
        ELSE 'low'
      END AS confidence
    FROM formations f1
    JOIN formations f2 ON f1.playbook_id = f2.playbook_id
      AND f1.id != f2.id
      AND f1.opposite_formation_id IS NULL
      AND f2.opposite_formation_id IS NULL
  )
  SELECT
    np.id1,
    np.name1,
    np.id2,
    np.name2,
    np.confidence
  FROM name_patterns np
  WHERE np.confidence IN ('high', 'medium')
  ORDER BY
    CASE np.confidence WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
    np.name1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_opposite_formations() IS 'Detects opposite formation pairs using name pattern matching (Rip↔Liz, Left↔Right, etc.). Returns high/medium confidence matches.';

-- ===========================================
-- 8. VERIFY DATA INTEGRITY
-- ===========================================

-- Ensure all plays.formation_id references exist
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO orphaned_count
  FROM plays p
  WHERE p.formation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM formations f
      WHERE f.id = p.formation_id
    );

  IF orphaned_count > 0 THEN
    RAISE NOTICE 'Found % plays with orphaned formation_id references. Setting to NULL.', orphaned_count;
    
    UPDATE plays
    SET formation_id = NULL
    WHERE formation_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM formations f
        WHERE f.id = plays.formation_id
      );
  END IF;
END $$;

-- ===========================================
-- 9. MIGRATION SUMMARY
-- ===========================================

DO $$
DECLARE
  total_formations INTEGER;
  formations_with_metadata INTEGER;
  total_personnel INTEGER;
  total_plays INTEGER;
  linked_plays INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_formations FROM formations;
  SELECT COUNT(*) INTO formations_with_metadata FROM formations WHERE formation_type IS NOT NULL;
  SELECT COUNT(*) INTO total_personnel FROM personnel_configurations;
  SELECT COUNT(*) INTO total_plays FROM plays WHERE is_archived = false;
  SELECT COUNT(*) INTO linked_plays FROM plays WHERE formation_id IS NOT NULL AND is_archived = false;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'FORMATION & PERSONNEL LIBRARY MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Formations: % total, % with metadata', total_formations, formations_with_metadata;
  RAISE NOTICE 'Personnel Configs: %', total_personnel;
  RAISE NOTICE 'Plays: % total, % linked to formations', total_plays, linked_plays;
  RAISE NOTICE 'Link Rate: %%%', ROUND((linked_plays::NUMERIC / NULLIF(total_plays, 0)) * 100, 1);
  RAISE NOTICE '============================================';
END $$;
