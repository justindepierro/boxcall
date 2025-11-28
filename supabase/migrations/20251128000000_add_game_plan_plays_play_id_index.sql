-- Add index for game_plan_plays.play_id to fix timeout errors
-- This index will dramatically speed up queries filtering by play_id
-- which are made by usePlayStatus hook for every visible play

-- Drop index if it exists (idempotent)
DROP INDEX IF EXISTS idx_game_plan_plays_play_id;

-- Create index on play_id for fast lookups
CREATE INDEX idx_game_plan_plays_play_id 
ON game_plan_plays (play_id);

-- Also add a composite index for the RLS policy join
-- This helps with the team_members → game_plans → game_plan_situations → game_plan_plays chain
DROP INDEX IF EXISTS idx_game_plan_plays_situation_id;
CREATE INDEX idx_game_plan_plays_situation_id 
ON game_plan_plays (situation_id);

-- Analyze the table to update statistics
ANALYZE game_plan_plays;

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'game_plan_plays'
ORDER BY indexname;
