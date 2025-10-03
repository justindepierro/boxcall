-- =====================================================
-- Find and Remove ALL Policy
-- =====================================================

-- First, let's see the exact names of ALL policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
  AND cmd = 'ALL'
ORDER BY policyname;

-- Based on your earlier output, try this exact name:
DROP POLICY IF EXISTS "Team coaches can manage playbooks" ON playbooks;

-- Also check if there are other ALL policies:
DROP POLICY IF EXISTS "Allow team coaches to manage playbooks" ON playbooks;
DROP POLICY IF EXISTS "Coaches can manage playbooks" ON playbooks;

-- Verify all remaining policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING' 
    ELSE 'No USING' 
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK' 
    ELSE 'No WITH CHECK' 
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
ORDER BY cmd, policyname;

-- =====================================================
-- After running this:
-- 1. Check if any ALL policies remain
-- 2. Hard refresh your app (Cmd + Shift + R)
-- 3. Try creating a play
-- =====================================================

NOTIFY pgrst, 'reload schema';
