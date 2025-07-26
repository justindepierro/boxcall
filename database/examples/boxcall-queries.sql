-- BoxCall Database: Practical SQL Examples
-- These examples show common operations you'll use in BoxCall

-- ====================================
-- 1. TEAM MANAGEMENT
-- ====================================

-- Get all teams with basic info
SELECT 
  id,
  name,
  school_name,
  mascot,
  colors_primary,
  created_at
FROM teams
ORDER BY created_at DESC;

-- Find teams by school
SELECT name, mascot 
FROM teams 
WHERE school_name ILIKE '%high%';  -- ILIKE = case-insensitive search

-- Count total teams
SELECT COUNT(*) as total_teams FROM teams;

-- ====================================
-- 2. USER & TEAM MEMBER OPERATIONS  
-- ====================================

-- Get all players for a team (replace 'team-id-here' with actual team ID)
SELECT 
  up.display_name,
  tm.role,
  up.position,
  up.jersey_number,
  up.grade_level
FROM team_members tm
JOIN user_profiles up ON tm.user_id = up.user_id
WHERE tm.team_id = 'team-id-here'
  AND tm.role = 'player'
ORDER BY up.jersey_number;

-- Get coaching staff for a team
SELECT 
  up.display_name,
  tm.role,
  up.phone
FROM team_members tm
JOIN user_profiles up ON tm.user_id = up.user_id  
WHERE tm.team_id = 'team-id-here'
  AND tm.role IN ('head_coach', 'coach')
ORDER BY tm.role;

-- Count members by role for each team
SELECT 
  t.name as team_name,
  tm.role,
  COUNT(*) as member_count
FROM teams t
JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.name, tm.role
ORDER BY t.name, tm.role;

-- ====================================
-- 3. PLAYBOOK & PLAY QUERIES
-- ====================================

-- Get all playbooks for a team
SELECT 
  pb.name as playbook_name,
  pb.description,
  pb.is_active,
  COUNT(p.id) as play_count,
  pb.created_at
FROM playbooks pb
LEFT JOIN plays p ON pb.id = p.playbook_id
WHERE pb.team_id = 'team-id-here'
GROUP BY pb.id, pb.name, pb.description, pb.is_active, pb.created_at
ORDER BY pb.created_at DESC;

-- Find plays by formation
SELECT 
  p.name as play_name,
  p.formation,
  p.play_type,
  p.down_distance,
  pb.name as playbook_name
FROM plays p
JOIN playbooks pb ON p.playbook_id = pb.id
WHERE p.formation = 'I-Formation'
ORDER BY p.name;

-- Get plays with high confidence scores
SELECT 
  p.name,
  p.formation,
  p.confidence_score,
  p.success_rate
FROM plays p
WHERE p.confidence_score > 0.8
ORDER BY p.confidence_score DESC;

-- ====================================
-- 4. PRACTICE SCRIPT QUERIES
-- ====================================

-- Get upcoming practice scripts
SELECT 
  ps.title,
  ps.practice_date,
  ps.duration_minutes,
  ps.focus_areas,
  t.name as team_name
FROM practice_scripts ps
JOIN teams t ON ps.team_id = t.id
WHERE ps.practice_date >= NOW()
ORDER BY ps.practice_date;

-- Get plays for a specific practice
SELECT 
  p.name as play_name,
  p.formation,
  psp.order_index,
  psp.repetitions,
  psp.notes
FROM practice_script_plays psp
JOIN plays p ON psp.play_id = p.id
WHERE psp.practice_script_id = 'script-id-here'
ORDER BY psp.order_index;

-- ====================================
-- 5. SOCIAL FEATURES
-- ====================================

-- Get recent team posts
SELECT 
  tp.title,
  tp.content,
  tp.post_type,
  up.display_name as author,
  tp.created_at,
  COUNT(pc.id) as comment_count
FROM team_posts tp
JOIN user_profiles up ON tp.author_id = up.user_id
LEFT JOIN post_comments pc ON tp.id = pc.post_id
WHERE tp.team_id = 'team-id-here'
GROUP BY tp.id, tp.title, tp.content, tp.post_type, up.display_name, tp.created_at
ORDER BY tp.created_at DESC
LIMIT 10;

-- Get post reactions summary
SELECT 
  tp.title,
  pr.reaction_type,
  COUNT(*) as reaction_count
FROM team_posts tp
JOIN post_reactions pr ON tp.id = pr.post_id
WHERE tp.team_id = 'team-id-here'
GROUP BY tp.title, pr.reaction_type
ORDER BY tp.title, reaction_count DESC;

-- ====================================
-- 6. ANALYTICS & REPORTING
-- ====================================

-- Team activity summary
SELECT 
  t.name as team_name,
  COUNT(DISTINCT tm.user_id) as total_members,
  COUNT(DISTINCT pb.id) as playbook_count,
  COUNT(DISTINCT p.id) as total_plays,
  COUNT(DISTINCT tp.id) as total_posts
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN playbooks pb ON t.id = pb.team_id
LEFT JOIN plays p ON pb.id = p.playbook_id
LEFT JOIN team_posts tp ON t.id = tp.team_id
GROUP BY t.id, t.name
ORDER BY total_members DESC;

-- Most used formations
SELECT 
  formation,
  COUNT(*) as usage_count,
  AVG(confidence_score) as avg_confidence
FROM plays
WHERE formation IS NOT NULL
GROUP BY formation
ORDER BY usage_count DESC;

-- User engagement by team
SELECT 
  t.name as team_name,
  COUNT(DISTINCT tp.author_id) as active_posters,
  COUNT(tp.id) as total_posts,
  COUNT(pc.id) as total_comments
FROM teams t
LEFT JOIN team_posts tp ON t.id = tp.team_id
LEFT JOIN post_comments pc ON tp.id = pc.post_id
GROUP BY t.id, t.name
ORDER BY total_posts DESC;

-- ====================================
-- 7. DATA MAINTENANCE
-- ====================================

-- Find orphaned records (data integrity checks)
-- Playbooks without teams
SELECT pb.* FROM playbooks pb
LEFT JOIN teams t ON pb.team_id = t.id
WHERE t.id IS NULL;

-- Plays without playbooks  
SELECT p.* FROM plays p
LEFT JOIN playbooks pb ON p.playbook_id = pb.id
WHERE pb.id IS NULL;

-- Clean up old file uploads (older than 30 days, not referenced)
SELECT 
  fu.id,
  fu.filename,
  fu.created_at
FROM file_uploads fu
WHERE fu.created_at < NOW() - INTERVAL '30 days'
  AND fu.id NOT IN (
    SELECT DISTINCT file_id FROM plays WHERE file_id IS NOT NULL
    UNION
    SELECT DISTINCT file_id FROM team_posts WHERE file_id IS NOT NULL
  );

-- ====================================
-- 8. PERFORMANCE QUERIES
-- ====================================

-- Most active teams (by post count)
SELECT 
  t.name,
  COUNT(tp.id) as post_count,
  MAX(tp.created_at) as last_activity
FROM teams t
LEFT JOIN team_posts tp ON t.id = tp.team_id
GROUP BY t.id, t.name
ORDER BY post_count DESC, last_activity DESC;

-- Database size summary
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- ====================================
-- NOTES FOR BEGINNERS:
-- ====================================

/*
Key SQL Concepts Used Above:

1. SELECT - Gets data from tables
2. FROM - Specifies which table(s)  
3. WHERE - Filters rows based on conditions
4. JOIN - Combines data from multiple tables
5. GROUP BY - Groups rows for aggregation
6. ORDER BY - Sorts results
7. COUNT() - Counts rows
8. AVG() - Calculates average
9. LIMIT - Restricts number of results
10. ILIKE - Case-insensitive text search

Remember to replace 'team-id-here' and similar placeholders 
with actual IDs from your database!
*/
