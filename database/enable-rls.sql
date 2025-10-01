-- =====================================================
-- Enable RLS on All Tables
-- =====================================================
-- This script enables Row Level Security on tables that have
-- RLS policies defined but RLS is not enabled on the table.
-- 
-- Run this in Supabase SQL Editor to fix Security Advisor errors
-- =====================================================

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS on season_stats (only if it's a table, not a view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'season_stats'
    AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.season_stats ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Enable RLS on activity_feed (only if it's a table, not a view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_feed'
    AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Enable RLS on team_players_view (only if it's a table, not a view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'team_players_view'
    AND table_type = 'BASE TABLE'
  ) THEN
    EXECUTE 'ALTER TABLE public.team_players_view ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'team_members',
    'teams', 
    'season_stats',
    'activity_feed',
    'team_players_view'
  )
ORDER BY tablename;

-- Check which tables have policies but RLS disabled
SELECT 
  t.schemaname,
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = false
  AND p.policyname IS NOT NULL
GROUP BY t.schemaname, t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =====================================================
-- After running this script:
-- 1. Go back to Security Advisor
-- 2. Click "Refresh" or "Rerun linter"
-- 3. The RLS errors should be gone
-- 4. Then proceed with PostgREST restart
-- =====================================================

NOTIFY pgrst, 'reload schema';
