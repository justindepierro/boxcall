-- Check RLS policies on key tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members', 'profiles')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on these tables
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename IN ('teams', 'team_members', 'profiles');