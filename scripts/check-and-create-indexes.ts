#!/usr/bin/env tsx

/**
 * Check which tables exist and create indexes safely
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const indexes = [
  // Core indexes
  { name: 'idx_teams_season_year', sql: 'CREATE INDEX idx_teams_season_year ON teams(season_year)' },
  { name: 'idx_team_members_team_user', sql: 'CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id)' },
  { name: 'idx_team_members_user_active', sql: 'CREATE INDEX idx_team_members_user_active ON team_members(user_id, is_active)' },
  { name: 'idx_team_players_team_active', sql: 'CREATE INDEX idx_team_players_team_active ON team_players(team_id, is_active)' },
  { name: 'idx_profiles_role', sql: 'CREATE INDEX idx_profiles_role ON profiles(role)' },

  // Playbook indexes
  { name: 'idx_playbooks_team_active', sql: 'CREATE INDEX idx_playbooks_team_active ON playbooks(team_id, is_active)' },
  { name: 'idx_plays_playbook', sql: 'CREATE INDEX idx_plays_playbook ON plays(playbook_id)' },
  { name: 'idx_plays_type', sql: 'CREATE INDEX idx_plays_type ON plays(p_type)' },

  // Social features indexes
  { name: 'idx_team_posts_team_created', sql: 'CREATE INDEX idx_team_posts_team_created ON team_posts(team_id, created_at DESC)' },
  { name: 'idx_team_posts_author', sql: 'CREATE INDEX idx_team_posts_author ON team_posts(author_id)' },
  { name: 'idx_post_likes_post', sql: 'CREATE INDEX idx_post_likes_post ON post_likes(post_id)' },
  { name: 'idx_post_comments_post', sql: 'CREATE INDEX idx_post_comments_post ON post_comments(post_id)' },
  { name: 'idx_post_shares_post', sql: 'CREATE INDEX idx_post_shares_post ON post_shares(post_id)' },

  // Game management indexes
  { name: 'idx_game_plans_team_date', sql: 'CREATE INDEX idx_game_plans_team_date ON game_plans(team_id, game_date)' },
  { name: 'idx_game_results_team_date', sql: 'CREATE INDEX idx_game_results_team_date ON game_results(team_id, game_date)' },

  // Practice indexes
  { name: 'idx_practice_schedules_team_date', sql: 'CREATE INDEX idx_practice_schedules_team_date ON practice_schedules(team_id, practice_date)' },
  { name: 'idx_practice_attendance_practice', sql: 'CREATE INDEX idx_practice_attendance_practice ON practice_attendance(practice_id)' },

  // Calendar indexes
  { name: 'idx_calendar_events_team_date', sql: 'CREATE INDEX idx_calendar_events_team_date ON calendar_events(team_id, event_date)' },
  { name: 'idx_team_events_team_date', sql: 'CREATE INDEX idx_team_events_team_date ON team_events(team_id, event_date)' },

  // Equipment indexes
  { name: 'idx_equipment_team_category', sql: 'CREATE INDEX idx_equipment_team_category ON equipment(team_id, category)' }
]

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

async function createIndex(index: { name: string, sql: string }) {
  try {
    // Check if index already exists
    const { data: existingIndex } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('schemaname', 'public')
      .eq('indexname', index.name)
      .single()

    if (existingIndex) {
      console.log(`⚠️ Index ${index.name} already exists, skipping`)
      return true
    }

    // Try to create the index
    const { error } = await supabase.rpc('exec', { query: index.sql })

    if (error) {
      console.log(`❌ Failed to create ${index.name}: ${error.message}`)
      return false
    }

    console.log(`✅ Created index ${index.name}`)
    return true
  } catch {
    console.log(`❌ Failed to create ${index.name}`)
    return false
  }
}

async function main() {
  console.log('🔍 Checking database tables and creating indexes...\n')

  // Check which tables exist
  const tablesToCheck = [
    'teams', 'team_members', 'team_players', 'profiles',
    'playbooks', 'plays', 'team_posts', 'post_likes', 'post_comments', 'post_shares',
    'game_plans', 'game_results', 'practice_schedules', 'practice_attendance',
    'calendar_events', 'team_events', 'equipment'
  ]

  console.log('📋 Table existence check:')
  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table)
    console.log(`  ${exists ? '✅' : '❌'} ${table}`)
  }

  console.log('\n🏗️ Creating indexes...')

  let successCount = 0
  let failCount = 0

  for (const index of indexes) {
    const success = await createIndex(index)
    if (success) successCount++
    else failCount++
  }

  console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed`)

  if (failCount > 0) {
    console.log('\n❌ Some indexes failed. This might be due to missing tables.')
    console.log('Please ensure all SQL files (07-12) have been executed first.')
  } else {
    console.log('\n🎉 All indexes created successfully!')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}