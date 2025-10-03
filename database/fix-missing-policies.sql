-- =====================================================
-- Add Missing RLS Policies
-- =====================================================
-- These tables have RLS enabled but no policies defined,
-- which means they're completely locked down.
-- This script adds appropriate policies.
-- =====================================================

-- ===================
-- activity_feed
-- ===================
-- Users can view activity for their teams
CREATE POLICY "Users can view activity for their teams"
ON public.activity_feed
FOR SELECT
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);

-- System can insert activity (service role)
CREATE POLICY "Service role can insert activity"
ON public.activity_feed
FOR INSERT
WITH CHECK (true);

-- ===================
-- play_calls
-- ===================
-- Users can view play calls for their teams
CREATE POLICY "Users can view play calls for their teams"
ON public.play_calls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM plays
    JOIN playbooks ON playbooks.id = plays.playbook_id
    WHERE plays.id = play_calls.play_id
    AND playbooks.team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- Coaches can insert play calls
CREATE POLICY "Coaches can insert play calls"
ON public.play_calls
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM plays
    JOIN playbooks ON playbooks.id = plays.playbook_id
    WHERE plays.id = play_calls.play_id
    AND playbooks.team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  )
);

-- Coaches can update their team's play calls
CREATE POLICY "Coaches can update play calls"
ON public.play_calls
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM plays
    JOIN playbooks ON playbooks.id = plays.playbook_id
    WHERE plays.id = play_calls.play_id
    AND playbooks.team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  )
);

-- Coaches can delete their team's play calls
CREATE POLICY "Coaches can delete play calls"
ON public.play_calls
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM plays
    JOIN playbooks ON playbooks.id = plays.playbook_id
    WHERE plays.id = play_calls.play_id
    AND playbooks.team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  )
);

-- ===================
-- team_players
-- ===================
-- Users can view players for their teams
CREATE POLICY "Users can view players for their teams"
ON public.team_players
FOR SELECT
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);

-- Coaches can insert players
CREATE POLICY "Coaches can insert players"
ON public.team_players
FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
  )
);

-- Coaches can update players
CREATE POLICY "Coaches can update players"
ON public.team_players
FOR UPDATE
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
  )
);

-- Coaches can delete players
CREATE POLICY "Coaches can delete players"
ON public.team_players
FOR DELETE
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
  )
);

-- ===================
-- team_players_view
-- ===================
-- Note: This is a VIEW, not a table
-- Views inherit policies from underlying tables
-- If this errors, it means team_players_view is indeed a view
-- and doesn't need policies (which is correct)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'team_players_view'
    AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE '
      CREATE POLICY "Users can view team_players_view for their teams"
      ON public.team_players_view
      FOR SELECT
      USING (
        team_id IN (
          SELECT team_id 
          FROM team_members 
          WHERE user_id = auth.uid()
        )
      )
    ';
    RAISE NOTICE 'Added policy to team_players_view table';
  ELSE
    RAISE NOTICE 'team_players_view is a VIEW - no policies needed (inherits from base tables)';
  END IF;
END $$;

-- ===================
-- Verify Policies
-- ===================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'activity_feed',
    'play_calls',
    'team_players',
    'team_players_view'
  )
ORDER BY tablename, policyname;

-- Check which tables still have RLS enabled but no policies
SELECT 
  t.schemaname,
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND t.tablename IN ('activity_feed', 'play_calls', 'team_players', 'team_players_view')
GROUP BY t.schemaname, t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =====================================================
-- After running this script:
-- 1. Go back to Security Advisor
-- 2. Click "Refresh"
-- 3. "RLS Enabled No Policy" errors should be GONE
-- 4. Then restart PostgREST
-- =====================================================

NOTIFY pgrst, 'reload schema';
