-- Emergency RLS Disable - Core Tables
-- Temporarily disable RLS on core tables to resolve infinite recursion
-- This allows us to get the database working, then we can implement proper policies later

-- Disable RLS on core tables to stop the recursion
ALTER TABLE public.playbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '🚨 EMERGENCY: RLS disabled on core tables!';
  RAISE NOTICE 'This resolves the infinite recursion issue temporarily';
  RAISE NOTICE 'Remember to re-enable RLS and implement proper policies later';
END $$;