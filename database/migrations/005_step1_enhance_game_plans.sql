-- =============================================================================
-- GAME PLANNING SYSTEM - STEP 1: ADD COLUMNS TO GAME_PLANS
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'STEP 1: Adding Brian Billick methodology columns to game_plans table...';
END;
$$;

-- Add all the new columns to the existing game_plans table
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS scouting_report JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS weather_considerations JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS key_matchups TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS injury_considerations TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS personnel_rotations JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS coaching_points TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS success_metrics JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS preparation_status TEXT DEFAULT 'draft' 
  CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready'));
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS total_situations INTEGER DEFAULT 0;
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS total_plays_assigned INTEGER DEFAULT 0;
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_game_plans_status_team 
  ON game_plans(team_id, preparation_status);

-- Verify the columns were added
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
    AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned', 'scouting_report', 'preparation_status');
  
  RAISE NOTICE 'Successfully added % new columns to game_plans table', col_count;
  
  IF col_count >= 5 THEN
    RAISE NOTICE '✓ STEP 1 COMPLETE: game_plans table enhanced with Brian Billick columns';
  ELSE
    RAISE WARNING '⚠ Some columns may not have been added. Found % columns', col_count;
  END IF;
END;
$$;
