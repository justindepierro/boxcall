-- TEMPORARY: Disable RLS for testing (NOT for production)
-- Run this in Supabase SQL Editor to temporarily allow team creation

-- Disable RLS on teams table (TEMPORARY - for testing only)
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Disable RLS on team_members table (TEMPORARY - for testing only)  
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- IMPORTANT: After testing, re-enable RLS and apply proper policies:
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- Then run the quick-fix-rls.sql policies