-- =====================================================
-- Deep Trace: Why is RLS Still Blocking Playbook INSERT?
-- =====================================================

-- Test 1: Check if auth.uid() works in this session
SELECT 
  '🔐 AUTH CHECK' as test,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NO AUTH SESSION'
    WHEN auth.uid() = 'fafcaafd-0154-4f87-9752-95fbfa2372a0' THEN '✅ CORRECT USER'
    ELSE '❌ WRONG USER: ' || auth.uid()::text
  END as status;

-- Test 2: Manually check if YOUR user would pass the INSERT policy
-- This simulates what the policy checks
WITH policy_check AS (
  SELECT 
    'e2b03ad6-1660-487a-aa35-5de132f641b8' as test_team_id, -- Burke Catholic
    'fafcaafd-0154-4f87-9752-95fbfa2372a0' as test_user_id
)
SELECT 
  '🧪 POLICY SIMULATION' as test,
  pc.test_team_id,
  pc.test_user_id,
  -- Check condition 1: team_id IN (SELECT team_id FROM team_members WHERE...)
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = pc.test_team_id
      AND tm.user_id = pc.test_user_id
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
  ) as condition_1_team_check,
  -- Check condition 2: created_by = auth.uid()
  (pc.test_user_id = pc.test_user_id) as condition_2_created_by,
  -- Overall result
  CASE
    WHEN EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = pc.test_team_id
        AND tm.user_id = pc.test_user_id
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    ) AND (pc.test_user_id = pc.test_user_id)
    THEN '✅ SHOULD PASS'
    ELSE '❌ SHOULD FAIL'
  END as policy_result
FROM policy_check pc;

-- Test 3: Check the ACTUAL policy text
SELECT 
  '📜 ACTUAL INSERT POLICY' as test,
  policyname,
  with_check::text as policy_logic
FROM pg_policies
WHERE tablename = 'playbooks'
  AND cmd = 'INSERT';

-- Test 4: Try INSERT with RLS DISABLED to isolate the issue
-- TEMPORARILY disable RLS
ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;

-- Try the INSERT that the app is doing
INSERT INTO playbooks (name, description, team_id, created_by)
VALUES (
  'Test Playbook',
  'Testing RLS',
  'e2b03ad6-1660-487a-aa35-5de132f641b8', -- Burke Catholic
  'fafcaafd-0154-4f87-9752-95fbfa2372a0'  -- Your user
)
RETURNING id, name, team_id, created_by;

-- Clean up test
DELETE FROM playbooks 
WHERE name = 'Test Playbook' 
  AND created_by = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';

-- Re-enable RLS
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

-- Test 5: Try INSERT WITH RLS ENABLED (this should fail with same error as app)
INSERT INTO playbooks (name, description, team_id, created_by)
VALUES (
  'Test Playbook 2',
  'Testing with RLS',
  'e2b03ad6-1660-487a-aa35-5de132f641b8',
  'fafcaafd-0154-4f87-9752-95fbfa2372a0'
)
RETURNING id, name, team_id, created_by;

-- If this succeeds, the issue is auth.uid() in the app context
-- If this fails, the issue is the policy logic itself
