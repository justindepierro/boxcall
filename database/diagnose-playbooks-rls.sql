-- =====================================================
-- Diagnose Playbooks RLS Issue
-- =====================================================
-- Check why the INSERT is still failing
-- =====================================================

-- 1. Check if policies exist for playbooks
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
ORDER BY cmd, policyname;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'playbooks';

-- 3. Check your user's team memberships and roles
-- Replace 'fafcaafd-0154-4f87-9752-95fbfa2372a0' with your actual user ID
SELECT 
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.team_role,
  t.name as team_name,
  tm.status
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0'::uuid;

-- 4. Check if there are any playbooks
SELECT 
  id,
  name,
  team_id,
  created_by,
  is_active
FROM playbooks
LIMIT 5;

-- 5. Try to manually insert a playbook as a test
-- This will show the exact error
-- Replace team_id with one from query #3 above
-- INSERT INTO playbooks (team_id, name, created_by)
-- VALUES (
--   'YOUR_TEAM_ID_HERE'::uuid,
--   'Test Playbook',
--   'fafcaafd-0154-4f87-9752-95fbfa2372a0'::uuid
-- );

-- =====================================================
-- After running this, share the results so we can see:
-- - If policies exist
-- - What your team_role is
-- - If you're active on a team
-- =====================================================
