-- =====================================================
-- Add Missing RLS Policies for playbooks Table
-- =====================================================
-- Now that created_by column exists, we need INSERT policies
-- =====================================================

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
ORDER BY cmd, policyname;

-- Add INSERT policy for playbooks
-- Users can create playbooks for teams they belong to
CREATE POLICY "Users can create playbooks for their teams"
ON public.playbooks
FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
  )
  AND created_by = auth.uid()
);

-- Add SELECT policy for playbooks
-- Users can view playbooks for their teams
CREATE POLICY "Users can view playbooks for their teams"
ON public.playbooks
FOR SELECT
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);

-- Add UPDATE policy for playbooks
-- Coaches can update playbooks for their teams
CREATE POLICY "Coaches can update playbooks for their teams"
ON public.playbooks
FOR UPDATE
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
  )
);

-- Add DELETE policy for playbooks
-- Head coaches can delete playbooks
CREATE POLICY "Head coaches can delete playbooks"
ON public.playbooks
FOR DELETE
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role = 'head_coach'
  )
);

-- Verify all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'playbooks'
ORDER BY cmd, policyname;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'playbooks';

-- =====================================================
-- After running this:
-- 1. Wait 5 seconds
-- 2. Hard refresh your app (Cmd + Shift + R)
-- 3. Try creating a play
--
-- Expected: ✅ Play creation works!
-- =====================================================

NOTIFY pgrst, 'reload schema';
