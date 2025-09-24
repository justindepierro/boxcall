-- Complete solution: Disable RLS on team_members entirely
-- Handle security at the application level instead of database level
-- This eliminates all recursion issues

ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;