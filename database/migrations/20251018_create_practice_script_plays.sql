-- Migration: Create practice_script_plays junction table
-- Date: 2025-10-18
-- Purpose: Link plays to practice scripts with configuration (reps, time, order)

-- Create practice_script_plays table
CREATE TABLE IF NOT EXISTS practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_script_id UUID NOT NULL REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  repetitions INTEGER NOT NULL DEFAULT 5,
  duration_seconds INTEGER NOT NULL DEFAULT 30, -- Time per rep in seconds
  coaching_points TEXT[], -- Array of coaching notes
  segment_name TEXT, -- e.g., "Drill", "Team Period", "Install"
  segment_type TEXT, -- e.g., "drill", "team", "walkthrough"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique play per script (can't add same play twice)
  UNIQUE(practice_script_id, play_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script_id 
  ON practice_script_plays(practice_script_id);
  
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_play_id 
  ON practice_script_plays(play_id);
  
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_order 
  ON practice_script_plays(practice_script_id, sequence_order);

-- Add RLS policies
ALTER TABLE practice_script_plays ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view plays in scripts for their team
CREATE POLICY practice_script_plays_select ON practice_script_plays
  FOR SELECT
  USING (
    practice_script_id IN (
      SELECT id FROM practice_scripts
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can insert plays into scripts for their team
CREATE POLICY practice_script_plays_insert ON practice_script_plays
  FOR INSERT
  WITH CHECK (
    practice_script_id IN (
      SELECT id FROM practice_scripts
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can update plays in scripts for their team
CREATE POLICY practice_script_plays_update ON practice_script_plays
  FOR UPDATE
  USING (
    practice_script_id IN (
      SELECT id FROM practice_scripts
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can delete plays from scripts for their team
CREATE POLICY practice_script_plays_delete ON practice_script_plays
  FOR DELETE
  USING (
    practice_script_id IN (
      SELECT id FROM practice_scripts
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_script_plays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_script_plays_updated_at
  BEFORE UPDATE ON practice_script_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_script_plays_updated_at();

-- Verification queries
-- SELECT COUNT(*) FROM practice_script_plays;
-- SELECT * FROM practice_script_plays LIMIT 5;
