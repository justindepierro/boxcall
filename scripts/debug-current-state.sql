-- Debug current team membership state
-- Run this to see what happened

-- 1. Check if your teams still exist
SELECT 
  id,
  name,
  school_name,
  created_at
FROM teams 
WHERE name LIKE '%Burke Catholic%'
ORDER BY created_at DESC;

-- 2. Check if you have any team memberships
SELECT 
  tm.*,
  t.name as team_name
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';

-- 3. Check all team_members entries for Burke Catholic teams
SELECT 
  tm.*,
  t.name as team_name,
  u.email as user_email
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
LEFT JOIN auth.users u ON tm.user_id = u.id
WHERE t.name LIKE '%Burke Catholic%';

-- 4. Check your user exists
SELECT id, email FROM auth.users WHERE id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';