-- Real-World BoxCall Database Test
-- Run this AFTER you have signed up users through Supabase Auth

-- 1. Check if you have any authenticated users
SELECT 
  id,
  email,
  created_at,
  'This user can create teams' as status
FROM auth.users 
LIMIT 3;

-- 2. If you have users, test creating a user profile
-- Replace 'YOUR_USER_ID_HERE' with actual user ID from above query
/*
INSERT INTO user_profiles (
  user_id, 
  display_name, 
  phone, 
  position
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with real user ID
  'Coach Smith',
  '+1234567890',
  'Head Coach'
);
*/

-- 3. Test creating a team (replace USER_ID)
/*
INSERT INTO teams (
  name,
  school_name, 
  mascot,
  colors_primary,
  created_by
) VALUES (
  'Eagles Football',
  'Riverside High School',
  'Eagles',
  '#003366',
  'YOUR_USER_ID_HERE'  -- Replace with real user ID
);
*/

-- 4. Test creating a playbook
/*
INSERT INTO playbooks (
  name,
  description,
  team_id,
  created_by
) VALUES (
  'Week 1 Offense',
  'Basic offensive plays for season opener',
  'YOUR_TEAM_ID_HERE',  -- Replace with team ID from above
  'YOUR_USER_ID_HERE'   -- Replace with real user ID
);
*/

-- Instructions for real testing:
SELECT 
  '1. Sign up a user through your BoxCall app' as step_1,
  '2. Get the user ID from auth.users table' as step_2,
  '3. Uncomment and run the INSERT statements above' as step_3,
  '4. Replace placeholder IDs with real values' as step_4;
