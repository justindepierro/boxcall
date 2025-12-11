-- Migration: Fix team_members RLS policy circular dependency
-- Date: December 11, 2025
-- Purpose: Allow users to view their OWN team_members rows
--
-- The current policy requires users to already be team members to view team_members,
-- creating a circular dependency. This fix allows users to see their own memberships.

-- Drop the existing overly restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;

-- Create a new policy that allows:
-- 1. Users to view their OWN team_members rows (fixes the circular dependency)
-- 2. Users to view other team members IF they're on the same team
CREATE POLICY "Users can view team members for their teams" ON team_members
  FOR SELECT USING (
    -- Users can always see their own memberships
    user_id = auth.uid()
    OR
    -- Users can see other members of teams they belong to
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );
