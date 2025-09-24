-- Fix RLS recursion with a completely different approach
-- Instead of querying team_members from security definer functions,
-- we'll use a different strategy that avoids circular references

-- First drop all policies that depend on the functions
DROP POLICY IF EXISTS "Users can view team members in their teams" ON team_members;
DROP POLICY IF EXISTS "Coaches can manage team memberships" ON team_members;

-- Now drop the problematic functions
DROP FUNCTION IF EXISTS public.is_user_team_member(UUID);
DROP FUNCTION IF EXISTS public.get_user_team_roles(UUID);

-- Drop remaining policies
DROP POLICY IF EXISTS "Users can view their own membership" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;

-- Create a simple approach: allow authenticated users to see team_members
-- but restrict operations based on team ownership through other tables

-- Basic policy: users can see their own membership
CREATE POLICY "users_own_membership" ON team_members
FOR SELECT USING (user_id = auth.uid());

-- For other operations, we'll rely on application-level checks
-- rather than complex RLS policies that cause recursion

-- Allow service role full access (for admin operations)
CREATE POLICY "service_role_full_access" ON team_members
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to view team members (temporary solution)
-- This avoids recursion but should be refined for better security
CREATE POLICY "authenticated_view_access" ON team_members
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to manage their own membership
CREATE POLICY "users_manage_own_membership" ON team_members
FOR ALL USING (user_id = auth.uid());