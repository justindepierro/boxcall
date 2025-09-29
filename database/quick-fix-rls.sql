-- QUICK FIX: Allow authenticated users to create teams
-- Run this in Supabase SQL Editor to immediately fix the team creation issue

-- Allow any authenticated user to create teams
CREATE POLICY "Allow authenticated users to create teams" ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view teams they're members of
CREATE POLICY "Allow users to view their teams" ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to create their own team memberships
CREATE POLICY "Allow users to join teams" ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own memberships
CREATE POLICY "Allow users to view their memberships" ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;