-- Migration: Create practice_script_plays table
-- Date: 2025-12-10
-- Description: Creates the join table between practice_scripts and plays
--              to store plays assigned to practice scripts with game scenario configuration

-- ===========================================
-- PRACTICE SCRIPT PLAYS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_script_id UUID NOT NULL REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  
  -- Ordering
  sequence_order INTEGER NOT NULL DEFAULT 1,
  
  -- Repetition & Notes
  repetitions INTEGER DEFAULT 5,
  coaching_points TEXT[], -- Array of coaching points/notes
  duration_minutes INTEGER DEFAULT 10,
  
  -- Game Scenario Configuration
  hash TEXT CHECK (hash IN ('left', 'middle', 'right')) DEFAULT 'middle',
  down_distance TEXT DEFAULT '1st & 10',
  field_position TEXT CHECK (field_position IN ('plus_territory', 'red_zone', 'backed_up', 'midfield')) DEFAULT 'plus_territory',
  defensive_front TEXT CHECK (defensive_front IN ('base', '4-3', '3-4', 'nickel', 'dime', 'bear', 'tite')) DEFAULT 'base',
  coverage TEXT CHECK (coverage IN ('cover_0', 'cover_1', 'cover_2', 'cover_3', 'cover_4', 'cover_6', 'quarters', 'man')) DEFAULT 'cover_2',
  blitz TEXT CHECK (blitz IN ('none', 'edge', 'a_gap', 'b_gap', 'sim_pressure', 'zone_blitz', 'all_out')) DEFAULT 'none',
  scenario_notes TEXT,
  
  -- Segment categorization
  segment_name TEXT DEFAULT 'Drill',
  segment_type TEXT DEFAULT 'drill',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique play per script (can be added multiple times with different scenarios)
  UNIQUE(practice_script_id, play_id, sequence_order)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Primary lookup index for scripts
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script_id 
  ON practice_script_plays(practice_script_id);

-- Play lookup index
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_play_id 
  ON practice_script_plays(play_id);

-- Ordering index
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_order 
  ON practice_script_plays(practice_script_id, sequence_order);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE practice_script_plays ENABLE ROW LEVEL SECURITY;

-- View policy: Team members can view practice script plays
CREATE POLICY "Team members can view practice script plays" 
  ON practice_script_plays
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM practice_scripts ps
      JOIN team_members tm ON tm.team_id = ps.team_id
      WHERE ps.id = practice_script_plays.practice_script_id
      AND tm.user_id = auth.uid()
    )
  );

-- Insert policy: Team coaches can add plays to scripts
CREATE POLICY "Team coaches can add plays to scripts" 
  ON practice_script_plays
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practice_scripts ps
      JOIN team_members tm ON tm.team_id = ps.team_id
      WHERE ps.id = practice_script_plays.practice_script_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Update policy: Team coaches can update plays in scripts
CREATE POLICY "Team coaches can update script plays" 
  ON practice_script_plays
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM practice_scripts ps
      JOIN team_members tm ON tm.team_id = ps.team_id
      WHERE ps.id = practice_script_plays.practice_script_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Delete policy: Team coaches can remove plays from scripts
CREATE POLICY "Team coaches can remove plays from scripts" 
  ON practice_script_plays
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM practice_scripts ps
      JOIN team_members tm ON tm.team_id = ps.team_id
      WHERE ps.id = practice_script_plays.practice_script_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================

CREATE OR REPLACE FUNCTION update_practice_script_plays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS practice_script_plays_updated_at ON practice_script_plays;

CREATE TRIGGER practice_script_plays_updated_at
  BEFORE UPDATE ON practice_script_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_script_plays_updated_at();

-- ===========================================
-- ALSO UPDATE PRACTICE_SCRIPTS SCHEMA
-- ===========================================

-- Add missing columns to practice_scripts if they don't exist
DO $$
BEGIN
  -- Add focus_areas column for tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_scripts' AND column_name = 'focus_areas'
  ) THEN
    ALTER TABLE practice_scripts ADD COLUMN focus_areas TEXT[];
  END IF;

  -- Add is_template column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_scripts' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE practice_scripts ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add is_archived column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_scripts' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE practice_scripts ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add created_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_scripts' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE practice_scripts ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add duration_minutes column (alias for duration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_scripts' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE practice_scripts ADD COLUMN duration_minutes INTEGER;
  END IF;
END $$;
