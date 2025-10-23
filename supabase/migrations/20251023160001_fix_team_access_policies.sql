-- Fix team access policies to avoid recursive RLS evaluation
-- Adds helper functions that run as security definer so policies can rely on them safely.

-- Helper function: user is active member of team
CREATE OR REPLACE FUNCTION public.is_active_team_member(
  p_user_id uuid,
  p_team_id uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members
    WHERE user_id = p_user_id
      AND team_id = p_team_id
      AND status = 'active'
  );
$$;

-- Helper function: user is coach/manager level for team
CREATE OR REPLACE FUNCTION public.is_coaching_team_member(
  p_user_id uuid,
  p_team_id uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members
    WHERE user_id = p_user_id
      AND team_id = p_team_id
      AND status = 'active'
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager')
  );
$$;

-- Helper function: users share a team (both active members)
CREATE OR REPLACE FUNCTION public.users_share_active_team(
  p_user_a uuid,
  p_user_b uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members tm1
    JOIN team_members tm2 ON tm2.team_id = tm1.team_id
    WHERE tm1.user_id = p_user_a
      AND tm2.user_id = p_user_b
      AND tm1.status = 'active'
      AND tm2.status = 'active'
  );
$$;

-- Helper function: fetch team_id for a playbook (avoids policy recursion)
CREATE OR REPLACE FUNCTION public.get_playbook_team_id(
  p_playbook_id uuid
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT pb.team_id
  FROM playbooks pb
  WHERE pb.id = p_playbook_id;
$$;

-- Allow authenticated users to execute helper functions
GRANT EXECUTE ON FUNCTION public.is_active_team_member(uuid, uuid) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.is_coaching_team_member(uuid, uuid) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.users_share_active_team(uuid, uuid) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.get_playbook_team_id(uuid) TO authenticated, service_role, anon;

-- Update team policies to use helper functions
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (public.is_active_team_member(auth.uid(), id));

DROP POLICY IF EXISTS "Team coaches can update their teams" ON public.teams;
CREATE POLICY "Team coaches can update their teams" ON public.teams
  FOR UPDATE USING (public.is_coaching_team_member(auth.uid(), id));

-- Update team member policies
DROP POLICY IF EXISTS "Users can view team members for their teams" ON public.team_members;
CREATE POLICY "Users can view team members for their teams" ON public.team_members
  FOR SELECT USING (public.is_active_team_member(auth.uid(), team_members.team_id));

DROP POLICY IF EXISTS "Team coaches can manage team members" ON public.team_members;
CREATE POLICY "Team coaches can manage team members" ON public.team_members
  FOR ALL USING (public.is_coaching_team_member(auth.uid(), team_members.team_id));

-- Update profile policy to use helper function
DROP POLICY IF EXISTS "Users can view profiles of team members" ON public.profiles;
CREATE POLICY "Users can view profiles of team members" ON public.profiles
  FOR SELECT USING (
    profiles.id = auth.uid()
    OR public.users_share_active_team(profiles.id, auth.uid())
  );

-- Update playbook policies
DROP POLICY IF EXISTS "Team members can view playbooks" ON public.playbooks;
CREATE POLICY "Team members can view playbooks" ON public.playbooks
  FOR SELECT USING (public.is_active_team_member(auth.uid(), playbooks.team_id));

DROP POLICY IF EXISTS "Team coaches can manage playbooks" ON public.playbooks;
CREATE POLICY "Team coaches can manage playbooks" ON public.playbooks
  FOR ALL USING (public.is_coaching_team_member(auth.uid(), playbooks.team_id));

-- Update plays policies
DROP POLICY IF EXISTS "Team members can view plays" ON public.plays;
CREATE POLICY "Team members can view plays" ON public.plays
  FOR SELECT USING (
    public.is_active_team_member(
      auth.uid(),
      public.get_playbook_team_id(plays.playbook_id)
    )
  );

DROP POLICY IF EXISTS "Team coaches can manage plays" ON public.plays;
CREATE POLICY "Team coaches can manage plays" ON public.plays
  FOR ALL USING (
    public.is_coaching_team_member(
      auth.uid(),
      public.get_playbook_team_id(plays.playbook_id)
    )
  );

-- Update practice scripts (if they reference team membership)
DROP POLICY IF EXISTS "Team members can view practice scripts" ON public.practice_scripts;
CREATE POLICY "Team members can view practice scripts" ON public.practice_scripts
  FOR SELECT USING (public.is_active_team_member(auth.uid(), practice_scripts.team_id));

DROP POLICY IF EXISTS "Team coaches can manage practice scripts" ON public.practice_scripts;
CREATE POLICY "Team coaches can manage practice scripts" ON public.practice_scripts
  FOR ALL USING (public.is_coaching_team_member(auth.uid(), practice_scripts.team_id));
