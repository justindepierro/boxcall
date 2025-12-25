-- Allow app-level super admins to pass coaching checks
--
-- Motivation:
-- - Some demo/admin accounts have profiles.role = 'super_admin' but a non-coaching
--   team_members.team_role, which blocks updates under RLS (0 rows updated).
-- - This keeps team-based role checks intact, but gives super_admin accounts the
--   ability to manage team-owned resources like plays.

CREATE OR REPLACE FUNCTION public.is_coaching_team_member(
  p_user_id uuid,
  p_team_id uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT (
    -- App-level super admins can manage content
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = p_user_id
        AND role = 'super_admin'
    )
    OR
    -- Team-level coaching roles
    EXISTS (
      SELECT 1
      FROM team_members
      WHERE user_id = p_user_id
        AND team_id = p_team_id
        AND status = 'active'
        AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager')
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_coaching_team_member(uuid, uuid) TO authenticated, service_role, anon;
