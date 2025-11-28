-- Fix game_plan_plays RLS policies with correct join path
-- Migration: 20251128140000_fix_game_plan_plays_rls_policies.sql
-- 
-- CRITICAL BUG FIX: The existing RLS policies had an invalid join that was
-- causing 500 Internal Server Error when querying game_plan_plays.
-- 
-- The bug: JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
-- This was joining game_plan_id (UUID referencing game_plans.id) to team_id 
-- (UUID referencing teams.id), which are completely different entities.
--
-- Correct relationship chain:
-- team_members.team_id → teams.id
-- game_plans.team_id → teams.id  
-- game_plan_situations.game_plan_id → game_plans.id
-- game_plan_plays.situation_id → game_plan_situations.id

-- Drop the broken policies
DROP POLICY IF EXISTS "Team members can view game plan plays" ON game_plan_plays;
DROP POLICY IF EXISTS "Team coaches can manage game plan plays" ON game_plan_plays;

-- Recreate with correct join path through game_plans table
CREATE POLICY "Team members can view game plan plays" ON game_plan_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      JOIN game_plan_situations gps ON gps.game_plan_id = gp.id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage game plan plays" ON game_plan_plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      JOIN game_plan_situations gps ON gps.game_plan_id = gp.id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Add comment explaining the fix
COMMENT ON POLICY "Team members can view game plan plays" ON game_plan_plays IS 
'Fixed RLS policy to correctly join through game_plans table to get team_id. Previously had invalid join between game_plan_id and team_id.';
