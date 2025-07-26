-- BoxCall Database Cleanup Script
-- Run this FIRST to remove any existing tables before deploying the new schema

-- WARNING: This will delete ALL existing data!
-- Only run this if you're okay with losing current data

-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS super_admins CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS game_stats CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS practice_script_plays CASCADE;
DROP TABLE IF EXISTS practice_scripts CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS team_posts CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS play_tags CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS playbooks CASCADE;
DROP TABLE IF EXISTS team_announcements CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- Also drop any custom types that might exist
DROP TYPE IF EXISTS role_type CASCADE;
DROP TYPE IF EXISTS announcement_priority CASCADE;

-- Success message
SELECT 'Database cleaned successfully! Ready for fresh schema deployment.' as status;
