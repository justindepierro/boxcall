-- SQL 101: Your First BoxCall Queries
-- Start here if you're new to SQL!

-- =====================================
-- LESSON 1: Getting Data (SELECT)
-- =====================================

-- The most basic query: "Show me everything in the teams table"
SELECT * FROM teams;

-- Better approach: "Show me specific columns"
SELECT name, mascot FROM teams;

-- Even better: "Show me teams, and call the columns something clear"
SELECT 
  name AS team_name,
  mascot AS team_mascot,
  school_name AS school
FROM teams;

-- =====================================
-- LESSON 2: Filtering Data (WHERE)
-- =====================================

-- "Show me teams that are Eagles"
SELECT name, school_name 
FROM teams 
WHERE mascot = 'Eagles';

-- "Show me teams created in the last week"
SELECT name, created_at 
FROM teams 
WHERE created_at > NOW() - INTERVAL '7 days';

-- "Show me teams with names containing 'high'"  
SELECT name, school_name
FROM teams
WHERE school_name ILIKE '%high%';  -- ILIKE = case-insensitive search

-- =====================================
-- LESSON 3: Sorting Results (ORDER BY)
-- =====================================

-- "Show me teams, newest first"
SELECT name, created_at 
FROM teams 
ORDER BY created_at DESC;

-- "Show me teams alphabetically"
SELECT name, mascot 
FROM teams 
ORDER BY name ASC;

-- "Show me teams by school, then by name"
SELECT name, school_name 
FROM teams 
ORDER BY school_name ASC, name ASC;

-- =====================================
-- LESSON 4: Counting Things
-- =====================================

-- "How many teams do we have?"
SELECT COUNT(*) AS total_teams FROM teams;

-- "How many teams per mascot?"
SELECT 
  mascot, 
  COUNT(*) AS team_count 
FROM teams 
GROUP BY mascot
ORDER BY team_count DESC;

-- =====================================
-- LESSON 5: Connecting Tables (JOIN)
-- =====================================

-- This is where SQL gets powerful!
-- "Show me teams with their member count"

SELECT 
  t.name AS team_name,
  COUNT(tm.user_id) AS member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name
ORDER BY member_count DESC;

-- Let's break this down:
-- 1. teams t = "Call the teams table 't' for short"
-- 2. LEFT JOIN = "Connect teams to team_members, keep all teams even if no members"
-- 3. ON t.id = tm.team_id = "Match where team ID equals team_member's team_id"
-- 4. GROUP BY = "Group results by team" 
-- 5. COUNT(tm.user_id) = "Count how many team members per team"

-- =====================================
-- LESSON 6: Your First Real BoxCall Query
-- =====================================

-- "Show me all players on the Eagles team with their info"
SELECT 
  up.display_name AS player_name,
  up.position,
  up.jersey_number,
  up.grade_level
FROM user_profiles up
JOIN team_members tm ON up.user_id = tm.user_id
JOIN teams t ON tm.team_id = t.id
WHERE t.name = 'Eagles'
  AND tm.role = 'player'
ORDER BY up.jersey_number ASC;

-- Reading this step by step:
-- 1. "Get data from user_profiles (call it 'up')"
-- 2. "Connect to team_members where user IDs match"  
-- 3. "Connect to teams where team IDs match"
-- 4. "Only show Eagles team"
-- 5. "Only show players (not coaches)"
-- 6. "Sort by jersey number"

-- =====================================
-- LESSON 7: Adding Data (INSERT)
-- =====================================

-- "Add a new team"
INSERT INTO teams (name, school_name, mascot, created_by) 
VALUES ('Wildcats', 'North High School', 'Wildcats', auth.uid());

-- Note: auth.uid() gets the current user's ID from Supabase

-- =====================================
-- LESSON 8: Updating Data (UPDATE)
-- =====================================

-- "Change the Eagles team mascot to Hawks"
UPDATE teams 
SET mascot = 'Hawks' 
WHERE name = 'Eagles';

-- "Update multiple fields at once"
UPDATE teams 
SET 
  mascot = 'Hawks',
  colors_primary = '#FF6B35'
WHERE name = 'Eagles';

-- =====================================
-- LESSON 9: Removing Data (DELETE)
-- =====================================

-- "Remove the Hawks team"
DELETE FROM teams 
WHERE name = 'Hawks';

-- ⚠️ BE CAREFUL with DELETE! Always use WHERE or you'll delete everything!

-- =====================================
-- LESSON 10: Practice Queries
-- =====================================

-- Try these yourself:

-- 1. Get all teams created this month
SELECT name, created_at 
FROM teams 
WHERE created_at >= date_trunc('month', NOW());

-- 2. Find teams with no members (might be test data)
SELECT t.name
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE tm.team_id IS NULL;

-- 3. Get the newest team
SELECT name, created_at 
FROM teams 
ORDER BY created_at DESC 
LIMIT 1;

-- 4. Count users by role across all teams
SELECT 
  role,
  COUNT(*) AS user_count
FROM team_members
GROUP BY role
ORDER BY user_count DESC;

-- =====================================
-- WHAT'S NEXT?
-- =====================================

/*
Now you can:
✅ Get data from tables (SELECT)
✅ Filter results (WHERE) 
✅ Sort results (ORDER BY)
✅ Count and group data (COUNT, GROUP BY)
✅ Connect multiple tables (JOIN)
✅ Add, update, and delete data

Next steps:
1. Try these queries in Supabase SQL Editor
2. Look at boxcall-queries.sql for more advanced examples
3. Experiment with your own team data
4. Ask questions - SQL takes practice!

Remember: Start simple, build complexity gradually! 🚀
*/
