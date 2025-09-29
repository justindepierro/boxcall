-- Fix RLS policies for teams table to allow team creation
-- This script resolves the "new row violates row-level security policy" error

-- First, let's check the current RLS policies on teams table
-- (Run this in Supabase SQL Editor to see current policies)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'teams';

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can only see teams they belong to" ON teams;
DROP POLICY IF EXISTS "Team members can view teams" ON teams;
DROP POLICY IF EXISTS "Only authenticated users can view teams" ON teams;

-- Create comprehensive RLS policies for teams table

-- 1. Allow authenticated users to INSERT teams (for team creation)
CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Allow users to SELECT teams they are members of
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- 3. Allow team owners/admins to UPDATE their teams
CREATE POLICY "Team owners can update teams" ON teams
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND team_role IN ('team_owner', 'head_coach')
      AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND team_role IN ('team_owner', 'head_coach')
      AND status = 'active'
    )
  );

-- 4. Allow team owners to DELETE teams (optional - be careful with this)
CREATE POLICY "Team owners can delete teams" ON teams
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND team_role = 'team_owner'
      AND status = 'active'
    )
  );

-- Ensure RLS is enabled on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Also check team_members table policies (these are usually needed for the above to work)
-- Make sure team_members table allows users to insert themselves as team members

-- Allow authenticated users to insert team memberships (for team creation flow)
DROP POLICY IF EXISTS "Users can create team memberships" ON team_members;
CREATE POLICY "Users can create team memberships" ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own team memberships
DROP POLICY IF EXISTS "Users can view their team memberships" ON team_members;
CREATE POLICY "Users can view their team memberships" ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow team owners/admins to manage team memberships
DROP POLICY IF EXISTS "Team admins can manage memberships" ON team_members;
CREATE POLICY "Team admins can manage memberships" ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND team_role IN ('team_owner', 'head_coach')
      AND status = 'active'
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND team_role IN ('team_owner', 'head_coach')
      AND status = 'active'
    )
  );

-- Ensure RLS is enabled on team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Test the policies work by checking what a user can see
-- (Replace 'your-user-id' with an actual user ID from auth.users)
-- SELECT * FROM teams; -- Should work after creating a team
-- SELECT * FROM team_members WHERE user_id = auth.uid(); -- Should show user's memberships