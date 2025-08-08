-- =============================================================================
-- GAME PLANNING SYSTEM - FRESH START: RECREATE GAME_PLANS TABLE
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- This will DROP and RECREATE the game_plans table with all new columns
-- =============================================================================

-- ⚠️  WARNING: This will delete all existing game plan data!
-- Make sure you have a backup if you need to preserve any existing game plans

DO $$
BEGIN
  RAISE NOTICE '🚨 STARTING FRESH RECREATION OF GAME_PLANS TABLE 🚨';
  RAISE NOTICE 'This will delete all existing game plan data!';
END;
$$;

-- Drop the existing game_plans table (this will cascade to related data)
DROP TABLE IF EXISTS game_plans CASCADE;

-- Recreate the game_plans table with ALL columns including Brian Billick methodology
CREATE TABLE game_plans (
  -- Original columns
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  total_plays INTEGER DEFAULT 0,
  
  -- Brian Billick methodology columns
  scouting_report JSONB DEFAULT '{}',
  weather_considerations JSONB DEFAULT '{}',
  key_matchups TEXT[],
  injury_considerations TEXT[],
  personnel_rotations JSONB DEFAULT '{}',
  coaching_points TEXT[],
  success_metrics JSONB DEFAULT '{}',
  preparation_status TEXT DEFAULT 'draft' CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready')),
  total_situations INTEGER DEFAULT 0,
  total_plays_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Recreate the original indexes
CREATE INDEX IF NOT EXISTS idx_game_plans_team_week 
  ON game_plans(team_id, week_number DESC);

-- Add new indexes for Brian Billick methodology
CREATE INDEX IF NOT EXISTS idx_game_plans_status_team 
  ON game_plans(team_id, preparation_status);
CREATE INDEX IF NOT EXISTS idx_game_plans_active 
  ON game_plans(is_active, team_id);

-- Recreate the original trigger for updated_at
-- First check if the function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER trigger_game_plans_updated_at 
      BEFORE UPDATE ON game_plans 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✓ Recreated updated_at trigger';
  ELSE
    RAISE NOTICE '⚠ update_updated_at_column function not found - trigger not created';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠ Could not create updated_at trigger: %', SQLERRM;
END;
$$;

-- Enable RLS on the recreated table
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;

-- Recreate basic RLS policy (you may need to adjust this based on your existing policies)
DROP POLICY IF EXISTS "team_members_game_plans" ON game_plans;
CREATE POLICY "team_members_game_plans" ON game_plans
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    )
  );

-- Verify the table was created correctly
DO $$
DECLARE
  col_count INTEGER;
  total_cols INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cols FROM information_schema.columns WHERE table_name = 'game_plans';
  SELECT COUNT(*) INTO col_count FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
    AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned', 'scouting_report', 'preparation_status');
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ GAME_PLANS TABLE RECREATED SUCCESSFULLY!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total columns: %', total_cols;
  RAISE NOTICE 'Brian Billick columns found: %/5', col_count;
  RAISE NOTICE '';
  
  -- List all columns
  RAISE NOTICE 'All columns in game_plans table:';
  FOR rec IN 
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'game_plans' 
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  - % (%)', rec.column_name, rec.data_type;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to proceed with creating related tables!';
  RAISE NOTICE 'Next: Run Step 2 to create game planning tables';
END;
$$;

-- Add table comment
COMMENT ON TABLE game_plans IS 'Game plans with Brian Billick methodology support - recreated from scratch';
