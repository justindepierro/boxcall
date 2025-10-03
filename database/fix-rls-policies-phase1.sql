-- =====================================================
-- PHASE 1: Rebuild RLS Policies from Ground Up
-- =====================================================
-- Drop ALL existing policies and rebuild with clean, simple rules

-- =====================================================
-- STEP 1: Drop ALL Existing Policies on Plays
-- =====================================================

DROP POLICY IF EXISTS "Team coaches can manage plays" ON plays;
DROP POLICY IF EXISTS "Team members can view plays" ON plays;
DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
DROP POLICY IF EXISTS "Coaches can update plays" ON plays;
DROP POLICY IF EXISTS "Coaches can delete plays" ON plays;

DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
DROP POLICY IF EXISTS "Coaches can update plays" ON plays;
DROP POLICY IF EXISTS "Coaches can delete plays" ON plays;

-- =====================================================
-- STEP 2: Drop ALL Existing Policies on Playbooks
-- =====================================================

DROP POLICY IF EXISTS "Users can create playbooks for their teams" ON playbooks;
DROP POLICY IF EXISTS "Team members can view playbooks" ON playbooks;
DROP POLICY IF EXISTS "Users can view playbooks for their teams" ON playbooks;
DROP POLICY IF EXISTS "Coaches can update playbooks for their teams" ON playbooks;
DROP POLICY IF EXISTS "Head coaches can delete playbooks" ON playbooks;

-- =====================================================
-- STEP 3: Rebuild PLAYS Policies (Clean & Simple)
-- =====================================================

-- Policy 1: Coaches can INSERT plays into their team's playbooks
CREATE POLICY "plays_insert_policy"
  ON plays FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- Policy 2: Team members can SELECT plays from their team's playbooks
CREATE POLICY "plays_select_policy"
  ON plays FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Policy 3: Coaches can UPDATE plays in their team's playbooks
CREATE POLICY "plays_update_policy"
  ON plays FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- Policy 4: Coaches can DELETE plays from their team's playbooks
CREATE POLICY "plays_delete_policy"
  ON plays FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- =====================================================
-- STEP 4: Rebuild PLAYBOOKS Policies (Clean & Simple)
-- =====================================================

-- Policy 1: Coaches can INSERT playbooks for their teams
CREATE POLICY "playbooks_insert_policy"
  ON playbooks FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
    AND created_by = auth.uid()
  );

-- Policy 2: Team members can SELECT playbooks for their teams
CREATE POLICY "playbooks_select_policy"
  ON playbooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Policy 3: Coaches can UPDATE playbooks for their teams
CREATE POLICY "playbooks_update_policy"
  ON playbooks FOR UPDATE
  USING (
    team_id IN (
      SELECT tm.team_id
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- Policy 4: Head coaches can DELETE playbooks
CREATE POLICY "playbooks_delete_policy"
  ON playbooks FOR DELETE
  USING (
    team_id IN (
      SELECT tm.team_id
      FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.team_role = 'head_coach'
        AND tm.status = 'active'
    )
  );

-- =====================================================
-- STEP 5: Verify All Policies
-- =====================================================

-- =====================================================
-- STEP 5: Verify All Policies
-- =====================================================

-- Check plays policies (should have 4 total: INSERT, SELECT, UPDATE, DELETE)
SELECT 
  '🏈 PLAYS POLICIES' as table_name,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN '✓ WITH CHECK'
    WHEN qual IS NOT NULL THEN '✓ USING'
    ELSE '✗ MISSING'
  END as policy_status
FROM pg_policies
WHERE tablename = 'plays'
ORDER BY cmd, policyname;

-- Check playbooks policies (should have 4 total: INSERT, SELECT, UPDATE, DELETE)
SELECT 
  '📘 PLAYBOOKS POLICIES' as table_name,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN '✓ WITH CHECK'
    WHEN qual IS NOT NULL THEN '✓ USING'
    ELSE '✗ MISSING'
  END as policy_status
FROM pg_policies
WHERE tablename = 'playbooks'
ORDER BY cmd, policyname;

-- =====================================================
-- STEP 6: Reload Schema Cache
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- ✅ REBUILD COMPLETE
-- =====================================================
-- 
-- PLAYS TABLE (4 policies):
--   ✓ plays_insert_policy (INSERT) - Coaches can create
--   ✓ plays_select_policy (SELECT) - All team members can view
--   ✓ plays_update_policy (UPDATE) - Coaches can edit
--   ✓ plays_delete_policy (DELETE) - Coaches can delete
--
-- PLAYBOOKS TABLE (4 policies):
--   ✓ playbooks_insert_policy (INSERT) - Coaches can create
--   ✓ playbooks_select_policy (SELECT) - All team members can view
--   ✓ playbooks_update_policy (UPDATE) - Coaches can edit
--   ✓ playbooks_delete_policy (DELETE) - Head coaches only
--
-- ALL POLICIES USE SIMPLE, CONSISTENT NAMING!
-- NO DUPLICATES, NO BROKEN ALL POLICIES!
--
-- Now test play creation in your app! 🚀
-- =====================================================
