-- Simplify team_members policies to avoid infinite recursion
-- Drop ALL existing policies on team_members
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own membership" ON team_members;
DROP POLICY IF EXISTS "Coaches can manage team memberships" ON team_members;

-- Create simple policies that don't cause recursion
-- Allow users to see their own membership records
CREATE POLICY "Users can view their own membership" ON team_members
FOR SELECT USING (user_id = auth.uid());

-- Allow authenticated users to see team_members (temporary solution)
-- This avoids recursion but should be refined for better security
CREATE POLICY "Allow authenticated access to team members" ON team_members
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow coaches to manage memberships (simplified)
CREATE POLICY "Coaches can manage memberships" ON team_members
FOR ALL USING (
  team_role IN ('head_coach', 'assistant_coach', 'coordinator')
);
