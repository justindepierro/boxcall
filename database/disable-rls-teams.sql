-- Emergency RLS Disable - Teams Table
-- Temporarily disable RLS on teams table to resolve infinite recursion
-- This allows us to get the database working, then we can implement proper policies later

-- Disable RLS on teams table to stop the recursion
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '🚨 EMERGENCY: RLS disabled on teams table!';
  RAISE NOTICE 'This resolves the infinite recursion issue temporarily';
  RAISE NOTICE 'Remember to re-enable RLS and implement proper policies later';
END $$;