#!/usr/bin/env tsx

/**
 * Check specific table existence
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

async function checkTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1)

    return !error
  } catch {
    return false
  }
}

async function checkAllTables() {
  console.log('🔍 Checking table existence...\n')

  const tablesToCheck = [
    // Core tables (from files 01-06)
    'teams', 'team_members', 'profiles', 'playbooks', 'plays',
    'team_posts', 'post_likes', 'post_comments', 'post_shares',
    'game_plans', 'practice_schedules', 'equipment',

    // Additional tables (from files 07-12)
    'team_players', 'play_calls', 'game_plan_situations', 'game_plan_plays',
    'game_results', 'practice_scripts', 'practice_attendance', 'practice_templates',
    'achievements', 'helmet_stickers', 'calendar_events', 'team_events'
  ]

  let existingTables: string[] = []
  let missingTables: string[] = []

  for (const table of tablesToCheck) {
    const exists = await checkTable(table)
    if (exists) {
      existingTables.push(table)
      console.log(`  ✅ ${table}`)
    } else {
      missingTables.push(table)
      console.log(`  ❌ ${table}`)
    }
  }

  console.log(`\n📊 Summary: ${existingTables.length} tables exist, ${missingTables.length} missing`)

  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables:')
    missingTables.forEach(table => console.log(`  - ${table}`))

    console.log('\n💡 You need to execute the SQL files for these missing tables.')
    console.log('Run files 07-12 in Supabase SQL Editor in order.')
  } else {
    console.log('\n✅ All tables exist! You can now create indexes.')
  }

  return { existingTables, missingTables }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAllTables()
}