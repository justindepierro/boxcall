-- Emergency RLS Disable - Team Members Table
-- Temporarily disable RLS on team_members table to resolve infinite recursion
-- This allows us to get the database working, then we can implement proper policies later

-- Disable RLS on team_members table to stop the recursion
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '🚨 EMERGENCY: RLS disabled on team_members table!';
  RAISE NOTICE 'This resolves the infinite recursion issue temporarily';
  RAISE NOTICE 'Remember to re-enable RLS and implement proper policies later';
END $$;