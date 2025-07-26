-- SQL Quick Reference for BoxCall
-- Keep this handy while learning!

-- ====================================
-- 🔍 READING DATA (SELECT)
-- ====================================

-- Basic structure:
SELECT column1, column2 FROM table_name WHERE condition;

-- Common examples:
SELECT name FROM teams;                          -- Get all team names
SELECT * FROM teams WHERE mascot = 'Eagles';    -- Get Eagles teams (avoid * in production)
SELECT name, mascot FROM teams ORDER BY name;   -- Get teams alphabetically

-- ====================================
-- 🔗 JOINING TABLES (Most Important!)
-- ====================================

-- Basic JOIN pattern:
SELECT t.name, COUNT(tm.user_id) as members
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name;

-- Translation: "Show team names with member count"

-- ====================================
-- 📊 COUNTING & GROUPING
-- ====================================

SELECT column, COUNT(*) FROM table GROUP BY column;

-- Examples:
SELECT role, COUNT(*) FROM team_members GROUP BY role;
SELECT mascot, COUNT(*) FROM teams GROUP BY mascot;

-- ====================================
-- 🔍 FILTERING (WHERE)
-- ====================================

WHERE column = 'value'           -- Exact match
WHERE column LIKE '%text%'       -- Contains text
WHERE column > 100               -- Numeric comparison  
WHERE column IS NOT NULL         -- Has value
WHERE column IN ('a', 'b', 'c')  -- Multiple options

-- ====================================
-- ✏️ MODIFYING DATA
-- ====================================

-- Add new record:
INSERT INTO teams (name, mascot) VALUES ('Hawks', 'Hawks');

-- Update existing:
UPDATE teams SET mascot = 'Eagles' WHERE name = 'Hawks';

-- Remove record:
DELETE FROM teams WHERE name = 'Hawks';

-- ====================================
-- 📅 DATES & TIME
-- ====================================

NOW()                           -- Current timestamp
created_at > NOW() - INTERVAL '7 days'  -- Last 7 days
DATE(created_at) = '2025-01-15'          -- Specific date

-- ====================================
-- 🎯 BOXCALL SPECIFIC PATTERNS
-- ====================================

-- Get my teams:
SELECT * FROM teams WHERE created_by = auth.uid();

-- Get team players:
SELECT up.display_name, up.position 
FROM user_profiles up
JOIN team_members tm ON up.user_id = tm.user_id
WHERE tm.team_id = 'team-id' AND tm.role = 'player';

-- Get team playbooks:
SELECT name, description FROM playbooks 
WHERE team_id = 'team-id' AND is_active = true;

-- ====================================
-- 🚨 SAFETY REMINDERS
-- ====================================

-- ALWAYS use WHERE with UPDATE/DELETE!
-- ❌ DELETE FROM teams;              -- Deletes ALL teams!
-- ✅ DELETE FROM teams WHERE id = 'specific-id';

-- Test queries with LIMIT first:
-- SELECT * FROM large_table LIMIT 5;

-- ====================================
-- 🐛 DEBUGGING TIPS
-- ====================================

-- Check if table exists:
SELECT * FROM information_schema.tables WHERE table_name = 'teams';

-- Count rows:
SELECT COUNT(*) FROM teams;

-- See table structure:
\d teams  -- In psql
-- or check Supabase Table Editor

-- ====================================
-- 💡 COMMON ERRORS & FIXES
-- ====================================

-- "relation does not exist" = Wrong table name
-- "column does not exist" = Wrong column name  
-- "syntax error" = Missing comma, quote, or semicolon
-- "permission denied" = RLS policy blocking access

-- ====================================
-- 🎓 LEARNING PROGRESSION
-- ====================================

-- Week 1: SELECT, WHERE, ORDER BY
-- Week 2: JOIN, COUNT, GROUP BY  
-- Week 3: INSERT, UPDATE, DELETE
-- Week 4: Complex queries, subqueries
-- Week 5: Performance optimization

-- ====================================
-- 📚 NEXT STEPS
-- ====================================

-- 1. Try sql-101-tutorial.sql
-- 2. Practice with boxcall-queries.sql  
-- 3. Read database/README.md
-- 4. Experiment in Supabase SQL Editor
