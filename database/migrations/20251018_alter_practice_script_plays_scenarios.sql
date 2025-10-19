-- Migration: Redesign practice_script_plays for game scenarios
-- Date: 2025-10-18
-- Purpose: Replace time-based config with game situation config (hash, front, coverage, blitz)

-- Drop duration_seconds column (not relevant for practice scenarios)
ALTER TABLE practice_script_plays DROP COLUMN IF EXISTS duration_seconds;

-- Add game scenario columns
ALTER TABLE practice_script_plays 
  ADD COLUMN IF NOT EXISTS hash TEXT DEFAULT 'middle' CHECK (hash IN ('left', 'middle', 'right')),
  ADD COLUMN IF NOT EXISTS down_distance TEXT, -- e.g., "1st & 10", "2nd & 7", "3rd & 3"
  ADD COLUMN IF NOT EXISTS field_position TEXT DEFAULT 'plus_territory' CHECK (field_position IN ('plus_territory', 'red_zone', 'backed_up', 'midfield')),
  ADD COLUMN IF NOT EXISTS defensive_front TEXT DEFAULT 'base' CHECK (defensive_front IN ('base', '4-3', '3-4', 'nickel', 'dime', 'bear', 'tite')),
  ADD COLUMN IF NOT EXISTS coverage TEXT DEFAULT 'cover_2' CHECK (coverage IN ('cover_0', 'cover_1', 'cover_2', 'cover_3', 'cover_4', 'cover_6', 'quarters', 'man')),
  ADD COLUMN IF NOT EXISTS blitz TEXT DEFAULT 'none' CHECK (blitz IN ('none', 'edge', 'a_gap', 'b_gap', 'sim_pressure', 'zone_blitz', 'all_out')),
  ADD COLUMN IF NOT EXISTS scenario_notes TEXT; -- Additional context (e.g., "Goal line stand", "Prevent defense")

-- Add comment for clarity
COMMENT ON COLUMN practice_script_plays.hash IS 'Hash mark position (left/middle/right)';
COMMENT ON COLUMN practice_script_plays.down_distance IS 'Down and distance (e.g., "1st & 10", "3rd & 3")';
COMMENT ON COLUMN practice_script_plays.field_position IS 'Field position context (plus_territory, red_zone, backed_up, midfield)';
COMMENT ON COLUMN practice_script_plays.defensive_front IS 'Defensive front to practice against';
COMMENT ON COLUMN practice_script_plays.coverage IS 'Defensive coverage shell';
COMMENT ON COLUMN practice_script_plays.blitz IS 'Blitz package to simulate';
COMMENT ON COLUMN practice_script_plays.scenario_notes IS 'Additional scenario context (e.g., "Goal line stand", "Two-minute drill")';

-- Keep repetitions - it's still relevant (how many times to rep this scenario)
-- Keep coaching_points, segment_name, segment_type - still useful

-- Create index for common scenario queries
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_scenarios 
  ON practice_script_plays(field_position, down_distance, coverage);

COMMENT ON TABLE practice_script_plays IS 'Junction table linking plays to practice scripts with game scenario configuration';
