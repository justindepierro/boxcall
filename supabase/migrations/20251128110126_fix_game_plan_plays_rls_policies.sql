-- Fix broken RLS policies on game_plan_plays table
-- 
-- PROBLEM: Current policies have incorrect join:
--   JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
--   This joins game_plan_id directly to team_id, which is wrong!
--
-- SOLUTION: Properly join through game_plans table:
--   team_members → teams → game_plans → game_plan_situations → game_plan_plays

-- Drop existing broken policies
DROP POLICY IF EXISTS "Team members can view game plan plays" ON game_plan_plays;
DROP POLICY IF EXISTS "Team coaches can manage game plan plays" ON game_plan_plays;

-- Recreate with correct join path
CREATE POLICY "Team members can view game plan plays" ON game_plan_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
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
      SELECT 1 
      FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      JOIN game_plan_situations gps ON gps.game_plan_id = gp.id
      WHERE gps.id = game_plan_plays.situation_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- Add comment explaining the join path
COMMENT ON POLICY "Team members can view game plan plays" ON game_plan_plays IS 
  'Users can view game plan plays for their team via: team_members → teams → game_plans → game_plan_situations → game_plan_plays';

COMMENT ON POLICY "Team coaches can manage game plan plays" ON game_plan_plays IS 
  'Coaches can manage game plan plays for their team via: team_members → teams → game_plans → game_plan_situations → game_plan_plays';
