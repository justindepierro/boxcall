-- Team search RPC for Join Team flow
-- Date: 2025-12-21
-- Purpose: Allow authenticated users to search teams by name/school via a limited, server-side function.

CREATE OR REPLACE FUNCTION public.search_teams(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  school_name TEXT,
  season_year INTEGER,
  member_count INTEGER,
  coach_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.name,
    t.school_name,
    t.season_year,
    (
      SELECT COUNT(*)::INT
      FROM team_members tm
      WHERE tm.team_id = t.id
        AND tm.status = 'active'
    ) AS member_count,
    (
      SELECT COALESCE(p.full_name, '')
      FROM team_members tm2
      JOIN profiles p ON p.id = tm2.user_id
      WHERE tm2.team_id = t.id
        AND tm2.status = 'active'
        AND tm2.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      ORDER BY
        CASE tm2.team_role
          WHEN 'head_coach' THEN 0
          WHEN 'coordinator' THEN 1
          ELSE 2
        END,
        tm2.assigned_at ASC
      LIMIT 1
    ) AS coach_name
  FROM teams t
  WHERE auth.uid() IS NOT NULL
    AND LENGTH(TRIM(p_query)) >= 2
    AND (
      t.name ILIKE '%' || p_query || '%'
      OR COALESCE(t.school_name, '') ILIKE '%' || p_query || '%'
    )
  ORDER BY t.updated_at DESC NULLS LAST, t.created_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 25);
$$;

REVOKE ALL ON FUNCTION public.search_teams(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_teams(TEXT, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.search_teams IS 'Search teams by name/school for Join Team flow (limited fields, authenticated only)';
