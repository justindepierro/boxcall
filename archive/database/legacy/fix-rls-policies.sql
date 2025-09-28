-- Fix RLS Policies to prevent infinite recursion
-- This script fixes the circular dependency in team_members policies

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;

-- Create a security definer function to check team membership
CREATE OR REPLACE FUNCTION is_user_team_member(team_uuid UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$;

-- Create a security definer function to check if user is team coach
CREATE OR REPLACE FUNCTION is_user_team_coach(team_uuid UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND status = 'active'
  );
END;
$$;

-- Create better RLS policies using the security definer functions
CREATE POLICY "Users can view team members for their teams" ON team_members
  FOR SELECT USING (
    is_user_team_member(team_id)
  );

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    is_user_team_coach(team_id)
  );

-- Also fix the teams policies to avoid recursion
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
DROP POLICY IF EXISTS "Team coaches can manage teams" ON teams;

CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    is_user_team_member(id)
  );

CREATE POLICY "Team coaches can manage teams" ON teams
  FOR ALL USING (
    is_user_team_coach(id)
  );

-- Fix profiles policy to avoid recursion
DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;

CREATE POLICY "Users can view profiles of team members" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = profiles.id
      AND is_user_team_member(tm.team_id)
    )
  );