-- ============================================================================
-- BOXCALL RLS FIX - PROPER SOLUTION WITH SECURITY DEFINER FUNCTION
-- ============================================================================
-- 
-- THE PROBLEM:
-- RLS policies on team_members check team_members table, causing infinite recursion.
-- This is a common PostgreSQL RLS anti-pattern.
--
-- THE SOLUTION:
-- Create a SECURITY DEFINER function that bypasses RLS to check team membership.
-- This is the standard PostgreSQL pattern recommended by Supabase.
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- ============================================================================
-- STEP 1: Create helper function that bypasses RLS
-- ============================================================================

-- Drop if exists first (in case of re-run)
DROP FUNCTION IF EXISTS public.get_my_team_ids();

-- This function runs with the privileges of the owner (postgres), bypassing RLS
-- It safely returns the team_ids that a user belongs to
CREATE FUNCTION public.get_my_team_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id 
  FROM team_members 
  WHERE user_id = auth.uid() 
  AND status = 'active'
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_team_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_team_ids() TO anon;

-- ============================================================================
-- STEP 2: Drop ALL existing problematic policies
-- ============================================================================

-- team_members policies
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_select_own_and_team" ON team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON team_members;

-- teams policies  
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "teams_select" ON teams;

-- profiles policies
DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- team_players policies
DROP POLICY IF EXISTS "Team members can view team players" ON team_players;
DROP POLICY IF EXISTS "team_players_select" ON team_players;

-- team_events policies
DROP POLICY IF EXISTS "Team members can view team events" ON team_events;
DROP POLICY IF EXISTS "team_events_select" ON team_events;

-- team_announcements policies
DROP POLICY IF EXISTS "Team members can view announcements" ON team_announcements;
DROP POLICY IF EXISTS "team_announcements_select" ON team_announcements;

-- team_posts policies
DROP POLICY IF EXISTS "Team members can view team posts" ON team_posts;
DROP POLICY IF EXISTS "team_posts_select" ON team_posts;

-- playbooks policies
DROP POLICY IF EXISTS "Team members can view playbooks" ON playbooks;
DROP POLICY IF EXISTS "playbooks_select" ON playbooks;

-- plays policies
DROP POLICY IF EXISTS "Team members can view plays" ON plays;
DROP POLICY IF EXISTS "plays_select" ON plays;

-- formations policies
DROP POLICY IF EXISTS "Users can view formations for their teams" ON formations;
DROP POLICY IF EXISTS "Team members can view formations" ON formations;
DROP POLICY IF EXISTS "formations_select" ON formations;

-- personnel_configurations policies
DROP POLICY IF EXISTS "Users can view personnel for their teams" ON personnel_configurations;
DROP POLICY IF EXISTS "Team members can view personnel" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select" ON personnel_configurations;

-- game_plans policies
DROP POLICY IF EXISTS "Team members can view game plans" ON game_plans;
DROP POLICY IF EXISTS "game_plans_select" ON game_plans;

-- game_plan_situations policies
DROP POLICY IF EXISTS "Team members can view game situations" ON game_plan_situations;
DROP POLICY IF EXISTS "game_plan_situations_select" ON game_plan_situations;

-- game_plan_plays policies
DROP POLICY IF EXISTS "Team members can view game plan plays" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select" ON game_plan_plays;

-- practice_scripts policies
DROP POLICY IF EXISTS "Team members can view practice scripts" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_select" ON practice_scripts;

-- practice_schedules policies
DROP POLICY IF EXISTS "Team members can view practice schedules" ON practice_schedules;
DROP POLICY IF EXISTS "practice_schedules_select" ON practice_schedules;

-- practice_templates policies
DROP POLICY IF EXISTS "Team members can view practice templates" ON practice_templates;
DROP POLICY IF EXISTS "practice_templates_select" ON practice_templates;

-- activities policies
DROP POLICY IF EXISTS "Users can view activities for their teams" ON activities;
DROP POLICY IF EXISTS "Team members can view activities" ON activities;
DROP POLICY IF EXISTS "activities_select" ON activities;

-- ============================================================================
-- STEP 3: Create NEW policies using the SECURITY DEFINER function
-- ============================================================================

-- team_members: Users can see their own row OR rows for teams they belong to
CREATE POLICY "team_members_select" ON team_members
  FOR SELECT USING (
    user_id = auth.uid()  -- Can always see your own membership
    OR 
    team_id IN (SELECT public.get_my_team_ids())  -- Uses SECURITY DEFINER function
  );

-- teams: Users can view teams they belong to
CREATE POLICY "teams_select" ON teams
  FOR SELECT USING (
    id IN (SELECT public.get_my_team_ids())
  );

-- profiles: Users can view their own profile OR profiles of teammates
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    id = auth.uid()  -- Can always see your own profile
    OR
    id IN (
      SELECT tm.user_id FROM team_members tm
      WHERE tm.team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- team_players: Team members can view players on their teams
CREATE POLICY "team_players_select" ON team_players
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- team_events: Team members can view events for their teams
CREATE POLICY "team_events_select" ON team_events
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- team_announcements: Team members can view announcements for their teams
CREATE POLICY "team_announcements_select" ON team_announcements
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- team_posts: Team members can view posts for their teams
CREATE POLICY "team_posts_select" ON team_posts
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- playbooks: Team members can view playbooks for their teams
CREATE POLICY "playbooks_select" ON playbooks
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- plays: Team members can view plays in their team's playbooks
CREATE POLICY "plays_select" ON plays
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM playbooks WHERE team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- formations: Team members can view formations in their team's playbooks
CREATE POLICY "formations_select" ON formations
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM playbooks WHERE team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- personnel_configurations: Team members can view personnel in their team's playbooks
CREATE POLICY "personnel_configurations_select" ON personnel_configurations
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM playbooks WHERE team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- game_plans: Team members can view game plans for their teams
CREATE POLICY "game_plans_select" ON game_plans
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- game_plan_situations: Team members can view situations in their team's game plans
CREATE POLICY "game_plan_situations_select" ON game_plan_situations
  FOR SELECT USING (
    game_plan_id IN (
      SELECT id FROM game_plans WHERE team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- game_plan_plays: Team members can view plays in their team's game plan situations
CREATE POLICY "game_plan_plays_select" ON game_plan_plays
  FOR SELECT USING (
    situation_id IN (
      SELECT id FROM game_plan_situations WHERE game_plan_id IN (
        SELECT id FROM game_plans WHERE team_id IN (SELECT public.get_my_team_ids())
      )
    )
  );

-- practice_scripts: Team members can view practice scripts for their teams
CREATE POLICY "practice_scripts_select" ON practice_scripts
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- practice_schedules: Team members can view practice schedules for their teams
CREATE POLICY "practice_schedules_select" ON practice_schedules
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- practice_templates: Team members can view practice templates for their teams
CREATE POLICY "practice_templates_select" ON practice_templates
  FOR SELECT USING (
    team_id IN (SELECT public.get_my_team_ids())
  );

-- activities: Users can view their own activities OR team activities
CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    team_id IN (SELECT public.get_my_team_ids())
  );

-- ============================================================================
-- STEP 4: Ensure RLS is enabled on all tables
-- ============================================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONE! 
-- The public.get_my_team_ids() function bypasses RLS safely.
-- All policies now use this function instead of recursive EXISTS checks.
-- ============================================================================

SELECT 'SUCCESS: RLS policies fixed with SECURITY DEFINER function!' as result;
