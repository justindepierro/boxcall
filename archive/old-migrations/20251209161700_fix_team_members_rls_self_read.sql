-- Fix RLS policy on team_members - FIXES INFINITE RECURSION BUG
-- The old policy caused infinite recursion by querying team_members within its own policy
-- Solution: Only allow users to see their OWN memberships directly (no self-referential subquery)

-- Drop ALL existing policies on team_members to start fresh
DROP POLICY IF EXISTS "Users can view team members for their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
DROP POLICY IF EXISTS "team_members_all_access" ON public.team_members;

-- Simple policy: Users can see their own memberships
-- This avoids infinite recursion by not querying team_members within the policy
CREATE POLICY "Users can view own memberships" ON public.team_members
FOR SELECT USING (
  user_id = auth.uid()
);

-- Policy for coaches to manage team members (INSERT, UPDATE, DELETE)
-- Uses a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_team_coach(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = check_team_id
    AND user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND status = 'active'
  );
$$;

-- Coaches can manage (insert/update/delete) team members
CREATE POLICY "Coaches can manage team members" ON public.team_members
FOR ALL USING (
  public.is_team_coach(team_id)
);

-- Allow users to insert themselves into a team (join)
CREATE POLICY "Users can join teams" ON public.team_members
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Add comment explaining the fix
COMMENT ON POLICY "Users can view own memberships" ON public.team_members IS 
'Simple policy that allows users to read their own team memberships without recursion';
