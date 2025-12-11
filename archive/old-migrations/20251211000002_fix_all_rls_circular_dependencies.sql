-- Migration: Fix ALL RLS policies with team_members circular dependency
-- Date: December 11, 2025
-- Purpose: Fix infinite recursion in RLS policies across multiple tables
--
-- PROBLEM: Many tables have RLS policies that check team_members, 
-- but team_members itself has a policy that checks team_members, causing infinite recursion.
--
-- SOLUTION: For each affected table, rewrite the policy to avoid the circular reference.
-- Use a direct auth.uid() check as the first condition before checking team_members.

-- ============================================================================
-- 1. FIX team_members TABLE (the root of the circular dependency)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;

-- Simple policy: Users can see their own memberships OR memberships of teams they're on
CREATE POLICY "team_members_select_own_and_team" ON team_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 2. FIX formations TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view formations for their teams" ON formations;
DROP POLICY IF EXISTS "formations_select" ON formations;
DROP POLICY IF EXISTS "formations_select_policy" ON formations;

-- Get team access through playbooks (which have team_id)
CREATE POLICY "formations_select_via_playbook" ON formations
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM playbooks 
      WHERE team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================================
-- 3. FIX personnel_configurations TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view personnel for their teams" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configurations_select_policy" ON personnel_configurations;

-- Get team access through playbooks
CREATE POLICY "personnel_configurations_select_via_playbook" ON personnel_configurations
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM playbooks 
      WHERE team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================================
-- 4. FIX activities TABLE  
-- ============================================================================

DROP POLICY IF EXISTS "Users can view activities for their teams" ON activities;
DROP POLICY IF EXISTS "activities_select" ON activities;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;

-- Users can see their own activities OR activities from their teams
CREATE POLICY "activities_select_own_and_team" ON activities
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- 5. FIX game_plan_plays TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view game plan plays for their teams" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select" ON game_plan_plays;
DROP POLICY IF EXISTS "game_plan_plays_select_policy" ON game_plan_plays;

-- Get team access through game_plans
CREATE POLICY "game_plan_plays_select_via_game_plan" ON game_plan_plays
  FOR SELECT USING (
    game_plan_id IN (
      SELECT id FROM game_plans 
      WHERE team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================================
-- GRANT necessary permissions
-- ============================================================================

-- Ensure authenticated users have SELECT on these tables
GRANT SELECT ON team_members TO authenticated;
GRANT SELECT ON formations TO authenticated;
GRANT SELECT ON personnel_configurations TO authenticated;
GRANT SELECT ON activities TO authenticated;
GRANT SELECT ON game_plan_plays TO authenticated;

-- ============================================================================
-- VERIFICATION: Test that the circular dependency is resolved
-- ============================================================================

-- This comment block shows how to test after running:
-- SELECT * FROM team_members WHERE user_id = auth.uid() LIMIT 1;
-- If this returns data without error, the fix worked!
