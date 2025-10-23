-- ============================================================================
-- Clean Up Duplicate RLS Policies
-- ============================================================================
-- Date: October 23, 2025
-- Purpose: Remove old duplicate policies that conflict with new helper-based policies
-- This ensures only the helper-function-based policies are active
-- ============================================================================

BEGIN;

-- ============================================================================
-- TEAMS TABLE - Keep only helper-based policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated users to create teams" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated users to view their teams" ON public.teams;
DROP POLICY IF EXISTS "Team coaches can manage teams" ON public.teams;
DROP POLICY IF EXISTS "teams_all_access" ON public.teams;

-- Ensure helper-based policies exist (already created in previous migration)
-- These use is_active_team_member() and is_coaching_team_member()

-- ============================================================================
-- TEAM_MEMBERS TABLE - Keep only helper-based policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated users to join teams" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to view their memberships" ON public.team_members;
DROP POLICY IF EXISTS "team_members_all_access" ON public.team_members;

-- Ensure helper-based policies exist (already created in previous migration)

-- ============================================================================
-- PLAYBOOKS TABLE - Keep only helper-based policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "playbooks_delete_policy" ON public.playbooks;
DROP POLICY IF EXISTS "playbooks_insert_policy" ON public.playbooks;
DROP POLICY IF EXISTS "playbooks_select_policy" ON public.playbooks;
DROP POLICY IF EXISTS "playbooks_update_policy" ON public.playbooks;

-- Ensure helper-based policies exist (already created in previous migration)

-- ============================================================================
-- PLAYS TABLE - Keep only helper-based policies
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Coaches can delete plays" ON public.plays;
DROP POLICY IF EXISTS "Coaches can insert plays" ON public.plays;
DROP POLICY IF EXISTS "Coaches can update plays" ON public.plays;
DROP POLICY IF EXISTS "plays_delete_policy" ON public.plays;
DROP POLICY IF EXISTS "plays_insert_policy" ON public.plays;
DROP POLICY IF EXISTS "plays_select_policy" ON public.plays;
DROP POLICY IF EXISTS "plays_update_policy" ON public.plays;

-- Ensure helper-based policies exist (already created in previous migration)

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count remaining policies for each table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'teams';
  
  RAISE NOTICE 'Teams policies remaining: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'team_members';
  
  RAISE NOTICE 'Team members policies remaining: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'playbooks';
  
  RAISE NOTICE 'Playbooks policies remaining: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'plays';
  
  RAISE NOTICE 'Plays policies remaining: %', policy_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Policy cleanup complete!';
  RAISE NOTICE 'Expected counts:';
  RAISE NOTICE '  - Teams: 2 policies (view, update)';
  RAISE NOTICE '  - Team Members: 2 policies (view, manage)';
  RAISE NOTICE '  - Playbooks: 2 policies (view, manage)';
  RAISE NOTICE '  - Plays: 2 policies (view, manage)';
END $$;
