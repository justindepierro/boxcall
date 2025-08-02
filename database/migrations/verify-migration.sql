-- BoxCall Migration Verification Script
-- Run this after your main migration to verify everything worked

-- Check if team management tables exist and have correct columns
SELECT 'teams table check' as test, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'teams'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'team_members table check' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'team_members'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'team_invites table check' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'team_invites'
       ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check if key columns were added
SELECT 'teams.team_code column' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'teams' AND column_name = 'team_code'
       ) THEN '✅ ADDED' ELSE '❌ MISSING' END as status;

SELECT 'team_members.permissions column' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'team_members' AND column_name = 'permissions'
       ) THEN '✅ ADDED' ELSE '❌ MISSING' END as status;

SELECT 'team_members.status column' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'team_members' AND column_name = 'status'
       ) THEN '✅ ADDED' ELSE '❌ MISSING' END as status;

-- Check if RLS is enabled
SELECT 'teams RLS enabled' as test,
       CASE WHEN 
           (SELECT relrowsecurity FROM pg_class WHERE relname = 'teams') = true
       THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status;

SELECT 'team_members RLS enabled' as test,
       CASE WHEN 
           (SELECT relrowsecurity FROM pg_class WHERE relname = 'team_members') = true
       THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status;

-- Check if helper functions exist
SELECT 'generate_team_code function' as test,
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_proc WHERE proname = 'generate_team_code'
       ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status;

-- Test team code generation
SELECT 'Team code generation test' as test,
       generate_team_code() as sample_code;

-- Show RLS policies count
SELECT 'RLS policies created' as test,
       count(*)::text || ' policies' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('teams', 'team_members', 'team_invites', 'user_profiles');

-- Final success message
SELECT '🎉 MIGRATION VERIFICATION COMPLETE' as result,
       'Check all tests above for ✅ status' as next_step;
