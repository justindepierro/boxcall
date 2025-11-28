-- Force fix game_plan_plays RLS policies
-- Run this to completely reset the policies

-- Drop ALL existing policies (in case there are multiple)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'game_plan_plays'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON game_plan_plays', pol.policyname);
    END LOOP;
END $$;

-- Recreate with correct join path through game_plans table
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

-- Verify the policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'game_plan_plays';
