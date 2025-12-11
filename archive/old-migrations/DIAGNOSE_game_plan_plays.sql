-- Diagnostic queries for game_plan_plays issue
-- Run each section separately to identify the problem

-- 1. Check if table exists and has data
SELECT COUNT(*) as total_rows FROM game_plan_plays;

-- 2. Check if there are any plays in game_plan_plays
SELECT gpp.id, gpp.play_id, gpp.situation_id, gpp.priority
FROM game_plan_plays gpp
LIMIT 5;

-- 3. Test the specific play_id from the error
SELECT COUNT(*) 
FROM game_plan_plays 
WHERE play_id = '2af60f42-2178-41ad-9d5e-8369dc7fd665';

-- 4. Check if the joins work manually (test the RLS policy logic)
SELECT 
  gpp.id,
  gpp.play_id,
  gps.id as situation_id,
  gp.id as game_plan_id,
  gp.team_id,
  tm.user_id
FROM game_plan_plays gpp
JOIN game_plan_situations gps ON gps.id = gpp.situation_id
JOIN game_plans gp ON gp.id = gps.game_plan_id
JOIN team_members tm ON tm.team_id = gp.team_id
WHERE tm.user_id = auth.uid()
  AND tm.status = 'active'
LIMIT 5;

-- 5. Check for any NULL values that might break the joins
SELECT 
  COUNT(*) as total,
  COUNT(situation_id) as has_situation_id,
  COUNT(play_id) as has_play_id
FROM game_plan_plays;

-- 6. Check game_plan_situations for NULL game_plan_id
SELECT 
  COUNT(*) as total,
  COUNT(game_plan_id) as has_game_plan_id
FROM game_plan_situations;

-- 7. Temporarily disable RLS and test (CAUTION: Re-enable after testing!)
ALTER TABLE game_plan_plays DISABLE ROW LEVEL SECURITY;
SELECT COUNT(*) FROM game_plan_plays WHERE play_id = '2af60f42-2178-41ad-9d5e-8369dc7fd665';
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
