-- Migration: Add opponent coverage tracking
-- Phase 13.2: Coverage-Based Recommendations
-- Allows coaches to track opponent defensive coverage and analyze play success by coverage type

-- Add opponent_coverage column to play_executions
ALTER TABLE play_executions 
  ADD COLUMN IF NOT EXISTS opponent_coverage TEXT;

-- Add hash_mark column for field position preference analysis (Phase 13.3)
ALTER TABLE play_executions
  ADD COLUMN IF NOT EXISTS hash_mark TEXT;

-- Add check constraint for valid coverage types
ALTER TABLE play_executions
  DROP CONSTRAINT IF EXISTS check_opponent_coverage;

ALTER TABLE play_executions
  ADD CONSTRAINT check_opponent_coverage 
  CHECK (opponent_coverage IS NULL OR opponent_coverage IN (
    'Cover 0',
    'Cover 1',
    'Cover 2',
    'Cover 3',
    'Cover 4',
    'Cover 6',
    'Man',
    'Zone',
    'Blitz',
    'Unknown'
  ));

-- Add check constraint for valid hash marks
ALTER TABLE play_executions
  DROP CONSTRAINT IF EXISTS check_hash_mark;

ALTER TABLE play_executions
  ADD CONSTRAINT check_hash_mark
  CHECK (hash_mark IS NULL OR hash_mark IN (
    'left',
    'middle',
    'right'
  ));

-- Add indexes for coverage and hash analysis
CREATE INDEX IF NOT EXISTS idx_play_executions_coverage 
  ON play_executions(opponent_coverage) 
  WHERE opponent_coverage IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_play_executions_hash 
  ON play_executions(hash_mark) 
  WHERE hash_mark IS NOT NULL;

-- Add composite index for play + coverage queries
CREATE INDEX IF NOT EXISTS idx_play_executions_play_coverage 
  ON play_executions(play_id, opponent_coverage) 
  WHERE opponent_coverage IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN play_executions.opponent_coverage IS 'Defensive coverage faced (Cover 0, 1, 2, 3, 4, 6, Man, Zone, Blitz)';
COMMENT ON COLUMN play_executions.hash_mark IS 'Field hash position (left, middle, right)';

-- Coverage types reference:
-- Cover 0: Man-to-man with 0 deep safeties (blitz heavy)
-- Cover 1: Man-to-man with 1 deep safety (FS free)
-- Cover 2: 2 deep safeties, 5 underneath zones
-- Cover 3: 3 deep zones, 4 underneath zones
-- Cover 4: 4 deep zones (quarters coverage)
-- Cover 6: Quarter-quarter-half (1 side Cover 2, 1 side Cover 4)
-- Man: Pure man coverage (variant)
-- Zone: Pure zone coverage (variant)
-- Blitz: Pressure package (may not identify specific coverage)
-- Unknown: Coverage not identified
