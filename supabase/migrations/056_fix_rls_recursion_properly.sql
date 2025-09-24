-- Fix RLS recursion by creating proper security definer functions
-- This breaks the circular dependency between team_members and other tables

-- Create a security definer function to check team membership
-- This function runs with elevated privileges and doesn't trigger RLS
CREATE OR REPLACE FUNCTION public.is_user_team_member(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND status = 'active'
  );
$$;

-- Create a function to get user's team roles
CREATE OR REPLACE FUNCTION public.get_user_team_roles(team_uuid UUID)
RETURNS TABLE(team_role TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.team_role
  FROM team_members tm
  WHERE tm.team_id = team_uuid
  AND tm.user_id = auth.uid()
  AND tm.status = 'active';
$$;

-- Re-enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own membership" ON team_members;
DROP POLICY IF EXISTS "Allow authenticated access to team members" ON team_members;
DROP POLICY IF EXISTS "Coaches can manage memberships" ON team_members;

-- Create proper policies that don't cause recursion

-- Users can always see their own membership records
CREATE POLICY "Users can view their own membership" ON team_members
FOR SELECT USING (user_id = auth.uid());

-- Users can see team members for teams they belong to
-- This uses the security definer function to avoid recursion
CREATE POLICY "Users can view team members in their teams" ON team_members
FOR SELECT USING (public.is_user_team_member(team_id));

-- Coaches can manage team memberships for their teams
CREATE POLICY "Coaches can manage team memberships" ON team_members
FOR ALL USING (
  public.is_user_team_member(team_id) AND
  EXISTS (
    SELECT 1 FROM public.get_user_team_roles(team_id) AS roles
    WHERE roles.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);

-- Allow users to insert their own membership (for joining teams)
CREATE POLICY "Users can join teams" ON team_members
FOR INSERT WITH CHECK (user_id = auth.uid());