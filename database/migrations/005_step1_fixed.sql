-- =============================================================================
-- GAME PLANNING SYSTEM - STEP 1 FIXED: ADD COLUMNS TO GAME_PLANS
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- Fixed version with explicit is_active column handling
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'STEP 1 FIXED: Adding Brian Billick methodology columns to game_plans table...';
END;
$$;

-- Check current state before adding columns
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_plans' AND column_name = 'is_active'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE 'is_active column already exists';
  ELSE
    RAISE NOTICE 'is_active column does not exist - will add it';
  END IF;
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

-- Explicitly try to add is_active column with error handling
DO $$
BEGIN
  -- Try to add the is_active column
  BEGIN
    ALTER TABLE game_plans ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE '✓ Successfully added is_active column';
  EXCEPTION
    WHEN duplicate_column THEN
      RAISE NOTICE '⚠ is_active column already exists';
    WHEN OTHERS THEN
      RAISE NOTICE 'Error adding is_active column: %', SQLERRM;
  END;
END;
$$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_game_plans_status_team 
  ON game_plans(team_id, preparation_status);

-- Detailed verification of all columns
DO $$
DECLARE
  col_count INTEGER;
  missing_cols TEXT := '';
BEGIN
  -- Check each important column individually
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'is_active') THEN
    missing_cols := missing_cols || 'is_active, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'total_situations') THEN
    missing_cols := missing_cols || 'total_situations, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'total_plays_assigned') THEN
    missing_cols := missing_cols || 'total_plays_assigned, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'scouting_report') THEN
    missing_cols := missing_cols || 'scouting_report, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'preparation_status') THEN
    missing_cols := missing_cols || 'preparation_status, ';
  END IF;
  
  -- Count total new columns
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
    AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned', 'scouting_report', 'preparation_status', 'weather_considerations', 'key_matchups', 'injury_considerations', 'personnel_rotations', 'coaching_points', 'success_metrics');
  
  RAISE NOTICE 'Found % new columns in game_plans table', col_count;
  
  IF missing_cols != '' THEN
    RAISE WARNING '⚠ Missing columns: %', RTRIM(missing_cols, ', ');
  END IF;
  
  IF col_count >= 11 THEN
    RAISE NOTICE '✓ STEP 1 COMPLETE: game_plans table enhanced with Brian Billick columns';
  ELSE
    RAISE WARNING '⚠ Only found % out of 11 expected columns', col_count;
  END IF;
END;
$$;

-- Show final table structure
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Current game_plans table columns:';
  PERFORM column_name FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
  ORDER BY ordinal_position;
END;
$$;
