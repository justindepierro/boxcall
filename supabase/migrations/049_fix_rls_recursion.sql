-- Fix infinite recursion in RLS policies
-- Create a security definer function to get user team IDs without triggering RLS

CREATE OR REPLACE FUNCTION public.user_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

-- Drop the problematic team_members policies
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;

-- Recreate team_members policies using the security definer function
CREATE POLICY "Users can view team members for their teams" ON team_members
FOR SELECT USING (
  team_id IN (SELECT * FROM public.user_team_ids())
);

CREATE POLICY "Team coaches can manage team members" ON team_members
FOR ALL USING (
  team_id IN (SELECT * FROM public.user_team_ids()) AND
  team_role IN ('head_coach', 'assistant_coach', 'coordinator')
);
