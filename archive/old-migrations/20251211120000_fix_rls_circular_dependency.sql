-- ============================================================================
-- BoxCall RLS Policy Fix - December 11, 2025
-- ============================================================================
-- 
-- PROBLEM: "infinite recursion detected in policy for relation team_members"
-- 
-- ROOT CAUSE: RLS policies on multiple tables check team_members, but team_members
-- itself has a policy that creates a circular reference when checking membership.
--
-- SOLUTION: Use a direct auth.uid() check FIRST, then allow team-based access.
-- PostgreSQL evaluates OR conditions left-to-right with short-circuit evaluation,
-- so if the first condition matches, it won't execute the subquery.
--
-- ============================================================================

-- ============================================================================
-- STEP 1: Fix team_members table (the root cause)
-- ============================================================================

-- Drop ALL existing SELECT policies on team_members
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_select_own_and_team" ON team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON team_members;

-- Create a simple, non-recursive policy
-- Key: First check if this is the user's OWN row (no subquery needed)
CREATE POLICY "team_members_select" ON team_members
  FOR SELECT USING (
    -- First: User can always see their own memberships (no recursion)
    user_id = auth.uid()
    OR
    -- Second: User can see teammates (only runs if first check fails)
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
  );

-- ============================================================================
-- STEP 2: Fix tables that reference team_members in their policies
-- ============================================================================

-- FORMATIONS (linked via playbooks)
DROP POLICY IF EXISTS "Users can view formations for their teams" ON formations;
DROP POLICY IF EXISTS "formations_select" ON formations;
DROP POLICY IF EXISTS "formations_select_policy" ON formations;
DROP POLICY IF EXISTS "formations_select_via_playbook" ON formations;
DROP POLICY IF EXISTS "Team members can view formations" ON formations;

CREATE POLICY "formations_select" ON formations
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM playbooks p
      WHERE p.team_id IN (
        SELECT tm.team_id FROM team_members tm
        WHERE tm.user_id = auth.uid() AND tm.status = 'active'
      )
    )
  );

-- PERSONNEL_CONFIGURATIONS (linked via playbooks)
DROP POLICY IF EXISTS "Users can view personnel for their teams" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select_policy" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select_via_playbook" ON personnel_configurations;
DROP POLICY IF EXISTS "Team members can view personnel" ON personnel_configurations;

CREATE POLICY "personnel_configurations_select" ON personnel_configurations
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM playbooks p
      WHERE p.team_id IN (
        SELECT tm.team_id FROM team_members tm
        WHERE tm.user_id = auth.uid() AND tm.status = 'active'
      )
    )
  );

-- ACTIVITIES (has user_id and team_id)
DROP POLICY IF EXISTS "Users can view activities for their teams" ON activities;
DROP POLICY IF EXISTS "activities_select" ON activities;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_select_own_and_team" ON activities;
DROP POLICY IF EXISTS "Team members can view activities" ON activities;

CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (
    -- Own activities first (no recursion)
    user_id = auth.uid()
    OR
    -- Team activities
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- GAME_PLAN_PLAYS (linked via game_plan_situations → game_plans)
-- Note: game_plan_plays has situation_id, NOT game_plan_id directly
DROP POLICY IF EXISTS "Users can view game plan plays for their teams" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select_policy" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select_via_game_plan" ON game_plan_plays;
DROP POLICY IF EXISTS "Team members can view game plan plays" ON game_plan_plays;

CREATE POLICY "game_plan_plays_select" ON game_plan_plays
  FOR SELECT USING (
    situation_id IN (
      SELECT gps.id FROM game_plan_situations gps
      WHERE gps.game_plan_id IN (
        SELECT gp.id FROM game_plans gp
        WHERE gp.team_id IN (
          SELECT tm.team_id FROM team_members tm
          WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
      )
    )
  );

-- ============================================================================
-- STEP 3: Ensure RLS is enabled on all tables
-- ============================================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Grant permissions to authenticated users
-- ============================================================================

GRANT SELECT ON team_members TO authenticated;
GRANT SELECT ON formations TO authenticated;
GRANT SELECT ON personnel_configurations TO authenticated;
GRANT SELECT ON activities TO authenticated;
GRANT SELECT ON game_plan_plays TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (run these after migration to confirm it works)
-- ============================================================================

-- Test 1: Should return your team memberships without error
-- SELECT * FROM team_members WHERE user_id = auth.uid() LIMIT 1;

-- Test 2: Should return formations without error  
-- SELECT * FROM formations LIMIT 1;

-- Test 3: Should return personnel configs without error
-- SELECT * FROM personnel_configurations LIMIT 1;
