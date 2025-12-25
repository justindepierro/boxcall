-- Expand coaching role checks to include 'coach' and app-level 'admin'
--
-- Why:
-- - RLS policies for plays/playbooks rely on public.is_coaching_team_member().
-- - The schema allows team_members.team_role = 'coach', but the helper function
--   historically omitted it, which blocks legitimate coaches from updating.
-- - The app also treats profiles.role in ('super_admin','admin') as global admins.
--
-- Result:
-- - Any active team member with team_role in coaching set can manage team-owned resources.
-- - App-level admins/super_admins can manage content regardless of team_role.

CREATE OR REPLACE FUNCTION public.is_coaching_team_member(
  p_user_id uuid,
  p_team_id uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT (
    -- App-level admins can manage content
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = p_user_id
        AND role IN ('super_admin', 'admin')
    )
    OR
    -- Team-level coaching roles
    EXISTS (
      SELECT 1
      FROM team_members
      WHERE user_id = p_user_id
        AND team_id = p_team_id
        AND status = 'active'
        AND team_role IN (
          'head_coach',
          'assistant_coach',
          'coordinator',
          'manager',
          'coach'
        )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_coaching_team_member(uuid, uuid) TO authenticated, service_role, anon;
