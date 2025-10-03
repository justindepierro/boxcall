-- Fix duplicate teams and missing memberships
-- Run these SQL commands in your Supabase SQL editor

-- 1. First, let's see what we're working with
SELECT 
  t.id,
  t.name,
  t.school_name,
  t.created_at,
  COUNT(tm.user_id) as member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.name LIKE '%Burke Catholic%'
GROUP BY t.id, t.name, t.school_name, t.created_at
ORDER BY t.created_at DESC;

-- 2. Check team_members table for Burke Catholic teams
SELECT 
  tm.*,
  t.name as team_name
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE t.name LIKE '%Burke Catholic%';

-- Step 1: Find your user ID (replace 'your-email@domain.com' with your actual email)
-- IMPORTANT: Run this query first and copy your user ID
SELECT id FROM auth.users WHERE email = 'your-email@domain.com';

-- Step 2: Add team membership for the NEWER team (keep this one)
-- IMPORTANT: Replace 'your-user-id-here' with the UUID from Step 1
-- INSERT INTO team_members (team_id, user_id, team_role, status)
-- VALUES (
--     'e2b03ad6-1660-487a-aa35-5de132f641b8',  -- Newer Burke Catholic team (14:12:23)
--     'your-user-id-here',                      -- Replace with your user ID from step 1
--     'head_coach',
--     'active'
-- );

-- Step 3: Delete the OLDER duplicate team
DELETE FROM teams 
WHERE id = 'd4e707b4-7182-40e0-8d35-f75a69e5ae49';  -- Older duplicate team (14:03:48)

-- Step 4: Verify the fix
-- IMPORTANT: Replace 'your-user-id-here' with your actual user ID
-- SELECT 
--     tm.team_id,
--     t.name,
--     t.school_name,
--     tm.team_role,
--     tm.status
-- FROM team_members tm
-- JOIN teams t ON tm.team_id = t.id
-- WHERE tm.user_id = 'your-user-id-here';

-- Final verification - check remaining teams
SELECT 
  t.id,
  t.name,
  tm.user_id,
  tm.team_role,
  tm.status as membership_status
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.name LIKE '%Burke Catholic%'
ORDER BY t.created_at DESC;