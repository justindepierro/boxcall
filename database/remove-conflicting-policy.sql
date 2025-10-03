-- =====================================================
-- Remove Conflicting ALL Policy
-- =====================================================
-- The "Team coaches can manage playbooks" policy with
-- operation ALL is blocking INSERTs because it has no
-- with_check clause
-- =====================================================

-- Drop the conflicting ALL policy
DROP POLICY "Team coaches can manage playbooks" ON playbooks;

-- Verify it's gone
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
ORDER BY cmd, policyname;

-- Should now have 5 policies instead of 6:
-- DELETE: Head coaches can delete playbooks
-- INSERT: Users can create playbooks for their teams
-- SELECT: Team members can view playbooks (2 policies)
-- UPDATE: Coaches can update playbooks for their teams

-- =====================================================
-- After running this:
-- 1. Hard refresh your app (Cmd + Shift + R)
-- 2. Try creating a play
--
-- Expected: ✅ Play creation works!
-- =====================================================

NOTIFY pgrst, 'reload schema';
