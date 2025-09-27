-- Update practice_scripts table to match the full interface
-- Migration: 20250926235714_update_practice_scripts_schema

-- Add missing columns to practice_scripts table
ALTER TABLE practice_scripts
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Rename title to name if it exists (for backward compatibility)
UPDATE practice_scripts SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Set default values
UPDATE practice_scripts SET
  name = COALESCE(name, 'Untitled Script'),
  is_template = COALESCE(is_template, FALSE),
  tags = COALESCE(tags, '{}'),
  created_by = COALESCE(created_by, auth.uid());

-- Make name NOT NULL after setting defaults
ALTER TABLE practice_scripts
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN name SET DEFAULT 'Untitled Script';

-- Create practice_script_plays table
CREATE TABLE IF NOT EXISTS practice_script_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT,
  repetitions INTEGER DEFAULT 5,
  estimated_time INTEGER DEFAULT 3, -- minutes
  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(script_id, play_id) -- Prevent duplicate plays in same script
);

-- Enable RLS on practice_script_plays
ALTER TABLE practice_script_plays ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script_id ON practice_script_plays(script_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_play_id ON practice_script_plays(play_id);
CREATE INDEX IF NOT EXISTS idx_practice_scripts_team_id ON practice_scripts(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_scripts_created_by ON practice_scripts(created_by);

-- RLS policies for practice_script_plays
CREATE POLICY "Team members can view practice script plays" ON practice_script_plays
FOR SELECT USING (
  script_id IN (
    SELECT id FROM practice_scripts
    WHERE team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Team coaches can manage practice script plays" ON practice_script_plays
FOR ALL USING (
  script_id IN (
    SELECT id FROM practice_scripts
    WHERE team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  )
);

-- Update the practice_scripts policies to include created_by access
DROP POLICY IF EXISTS "Team coaches can manage practice scripts" ON practice_scripts;
CREATE POLICY "Team coaches can manage practice scripts" ON practice_scripts
FOR ALL USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
  OR created_by = auth.uid()
);

-- Function to update practice script duration when plays are added/removed
CREATE OR REPLACE FUNCTION update_practice_script_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the script's duration based on the sum of estimated_time from its plays
  UPDATE practice_scripts
  SET duration = COALESCE((
    SELECT SUM(estimated_time * repetitions)
    FROM practice_script_plays
    WHERE script_id = COALESCE(NEW.script_id, OLD.script_id)
  ), 0)
  WHERE id = COALESCE(NEW.script_id, OLD.script_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update duration
DROP TRIGGER IF EXISTS trigger_update_practice_script_duration ON practice_script_plays;
CREATE TRIGGER trigger_update_practice_script_duration
  AFTER INSERT OR UPDATE OR DELETE ON practice_script_plays
  FOR EACH ROW EXECUTE FUNCTION update_practice_script_duration();
