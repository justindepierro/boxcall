-- ===========================================
-- CLEAN DATABASE SLATE
-- ===========================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS team_posts CASCADE;
DROP TABLE IF EXISTS practice_attendance CASCADE;
DROP TABLE IF EXISTS practice_schedules CASCADE;
DROP TABLE IF EXISTS practice_templates CASCADE;
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_plans CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS playbooks CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS team_events CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS helmet_stickers CASCADE;
DROP TABLE IF EXISTS practice_scripts CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the exec_sql function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);
