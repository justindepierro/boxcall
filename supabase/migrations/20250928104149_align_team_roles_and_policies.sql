-- Align team role constraint and add insert policies for teams/team_members

-- Update team_members role constraint to include player & family tiers
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_team_role_check;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_team_role_check
  CHECK (team_role IN (
    'head_coach',
    'assistant_coach',
    'coordinator',
    'manager',
    'coach',
    'player',
    'family',
    'alumni'
  ));

-- Ensure capabilities default remains a JSON object for boolean flags
ALTER TABLE public.team_members
  ALTER COLUMN capabilities SET DEFAULT '{
    "can_manage_team": false,
    "can_manage_games": false,
    "can_manage_social": false,
    "can_manage_players": false,
    "can_view_analytics": false,
    "can_manage_playbook": false,
    "can_manage_practice": false,
    "can_manage_equipment": false
  }'::jsonb;

-- Allow authenticated users to create teams (bootstrap flow)
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to join teams themselves or coaches to add members
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT
  WITH CHECK (
    -- allow user to create their own membership (e.g., bootstrap after team creation)
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );
