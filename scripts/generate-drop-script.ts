#!/usr/bin/env tsx

/**
 * Generate SQL Script to Drop All Tables
 * Creates a SQL script that can be run in Supabase SQL Editor to drop all tables
 */

import { join } from 'path'
import { writeFileSync } from 'fs'

function generateDropScript() {
  console.log('🗑️ Generating SQL script to drop all BoxCall tables...')
  console.log('==================================================\n')

  // List of all tables in reverse dependency order (to avoid foreign key issues)
  const tables = [
    'post_shares',
    'post_comments',
    'post_likes',
    'team_posts',
    'practice_attendance',
    'practice_schedules',
    'practice_scripts',
    'practice_templates',
    'calendar_events',
    'team_events',
    'equipment',
    'achievements',
    'helmet_stickers',
    'game_plan_plays',
    'game_plan_situations',
    'game_results',
    'game_plans',
    'play_calls',
    'plays',
    'playbooks',
    'team_players',
    'team_members',
    'teams',
    'profiles'
  ]

  console.log('-- BoxCall Database - Drop All Tables')
  console.log('-- Generated for clean rebuild')
  console.log('-- Run this in Supabase SQL Editor')
  console.log('')
  console.log('-- Disable RLS temporarily to allow dropping')
  console.log('ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE IF EXISTS playbooks DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE IF EXISTS plays DISABLE ROW LEVEL SECURITY;')
  console.log('')

  console.log('-- Drop tables in reverse dependency order')
  for (const table of tables) {
    console.log(`DROP TABLE IF EXISTS ${table} CASCADE;`)
  }

  console.log('')
  console.log('-- Clean up any remaining constraints or indexes')
  console.log('DROP VIEW IF EXISTS season_stats CASCADE;')
  console.log('')

  console.log('-- Re-enable RLS on auth.users if needed (usually handled by Supabase)')
  console.log('-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;')
  console.log('')

  console.log('-- Verify cleanup')
  console.log('SELECT table_name FROM information_schema.tables')
  console.log('WHERE table_schema = \'public\'')
  console.log('AND table_type = \'BASE TABLE\'')
  console.log('ORDER BY table_name;')
  console.log('')

  console.log('-- 🎉 Database cleaned! Now you can run: npm run db:setup')
}

function saveDropScript() {
  const scriptContent = `-- BoxCall Database - Drop All Tables
-- Generated for clean rebuild
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to allow dropping
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plays DISABLE ROW LEVEL SECURITY;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS team_posts CASCADE;
DROP TABLE IF EXISTS practice_attendance CASCADE;
DROP TABLE IF EXISTS practice_schedules CASCADE;
DROP TABLE IF EXISTS practice_scripts CASCADE;
DROP TABLE IF EXISTS practice_templates CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS team_events CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS helmet_stickers CASCADE;
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_plans CASCADE;
DROP TABLE IF EXISTS play_calls CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS playbooks CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Clean up any remaining constraints or indexes
DROP VIEW IF EXISTS season_stats CASCADE;

-- Re-enable RLS on auth.users if needed (usually handled by Supabase)
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
`

  const scriptPath = join(process.cwd(), 'database', 'drop-all-tables.sql')
  writeFileSync(scriptPath, scriptContent)
  console.log(`📄 SQL script saved to: ${scriptPath}`)
  console.log('   Copy and paste this into your Supabase SQL Editor')
}

// Run the script
generateDropScript()
saveDropScript()