-- ============================================
-- PLAYBOOK SECURITY FIX - RLS POLICIES
-- Date: October 11, 2025
-- Purpose: Fix broken plays INSERT policy and remove duplicates
-- ============================================

-- ========================================
-- FIX 1: Split broken "ALL" policy on plays table
-- ========================================

-- Drop the broken policy (missing WITH CHECK clause)
DROP POLICY IF EXISTS "Team coaches can manage plays" ON plays;

-- Create separate policies for each operation with proper clauses

-- INSERT: Coaches can create plays in their team's playbooks
CREATE POLICY "Coaches can insert plays" ON plays
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- UPDATE: Coaches can update plays in their team's playbooks
CREATE POLICY "Coaches can update plays" ON plays
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- DELETE: Coaches can delete plays in their team's playbooks
CREATE POLICY "Coaches can delete plays" ON plays
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

-- ========================================
-- FIX 2: Remove duplicate SELECT policy on playbooks
-- ========================================

-- Keep: "Team members can view playbooks" (better name, same logic)
-- Remove: "Users can view playbooks for their teams" (duplicate)
DROP POLICY IF EXISTS "Users can view playbooks for their teams" ON playbooks;

-- ========================================
-- FIX 3: Add RLS for profiles.settings (favorites/recent plays)
-- ========================================

-- Note: profiles.settings is a JSONB column in profiles table
-- RLS on profiles table already exists, just verify policies

-- Verify users can update their own settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profiles'
  ) THEN
    CREATE POLICY "Users can update their own profiles" ON profiles
      FOR UPDATE 
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check all current policies on plays table
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'plays'
ORDER BY cmd, policyname;

-- Check all current policies on playbooks table
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'playbooks'
ORDER BY cmd, policyname;

-- Check all current policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ========================================
-- TEST QUERIES (Run after policy changes)
-- ========================================

-- Test 1: Verify INSERT works for coach
-- (Run this as a coach user)
-- INSERT INTO plays (playbook_id, play_name, formation, p_type) 
-- VALUES ('<your-playbook-id>', 'Test Play', 'I-Form', 'run')
-- RETURNING id, play_name;

-- Test 2: Verify non-coach cannot insert
-- (Run this as a player user - should fail)

-- Test 3: Verify UPDATE works for coach
-- UPDATE plays SET notes = 'Updated' WHERE id = '<play-id>' RETURNING id;

-- Test 4: Verify DELETE works for coach
-- DELETE FROM plays WHERE id = '<test-play-id>' RETURNING id;

-- ========================================
-- ROLLBACK SCRIPT (if needed)
-- ========================================

/*
-- To rollback these changes:

-- Restore original broken policy
CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Drop the new policies
DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
DROP POLICY IF EXISTS "Coaches can update plays" ON plays;
DROP POLICY IF EXISTS "Coaches can delete plays" ON plays;

-- Restore duplicate playbooks policy
CREATE POLICY "Users can view playbooks for their teams" ON playbooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );
*/

-- ========================================
-- SUCCESS CRITERIA
-- ========================================

-- ✅ Coaches can create plays
-- ✅ Coaches can update plays
-- ✅ Coaches can delete plays
-- ✅ Team members can view plays (existing policy)
-- ✅ No duplicate policies
-- ✅ All policies have proper USING/WITH CHECK clauses
-- ✅ Favorites/recent plays can be saved (profiles.settings)
