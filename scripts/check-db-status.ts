#!/usr/bin/env tsx

/**
 * Check database table status
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

async function checkTables() {
  console.log('🔍 Checking database table status...\n')

  try {
    // Get all tables in public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations') // Exclude Supabase internal tables
      .order('table_name')

    if (error) {
      console.log('❌ Error querying tables:', error.message)
      return
    }

    console.log('📋 Current tables in database:')
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`  ✅ ${table.table_name}`)
      })
    } else {
      console.log('  (No tables found)')
    }

    // Check specific tables we expect
    const expectedTables = [
      'teams', 'team_members', 'profiles', 'playbooks', 'plays',
      'team_posts', 'post_likes', 'post_comments', 'post_shares',
      'game_plans', 'practice_schedules', 'equipment',
      'team_players', 'play_calls', 'game_plan_situations', 'game_plan_plays',
      'game_results', 'practice_scripts', 'practice_attendance', 'practice_templates',
      'achievements', 'helmet_stickers', 'calendar_events', 'team_events'
    ]

    console.log('\n🔍 Checking expected tables:')
    let foundCount = 0
    let missingCount = 0

    for (const tableName of expectedTables) {
      const exists = tables?.some(t => t.table_name === tableName)
      if (exists) {
        console.log(`  ✅ ${tableName}`)
        foundCount++
      } else {
        console.log(`  ❌ ${tableName} (missing)`)
        missingCount++
      }
    }

    console.log(`\n📊 Summary: ${foundCount} tables found, ${missingCount} missing`)

    if (missingCount > 0) {
      console.log('\n⚠️ Some tables are missing. You may need to re-run the SQL files.')
      console.log('Execute files 07-12 in Supabase SQL Editor before trying indexes.')
    } else {
      console.log('\n✅ All expected tables exist! You can now create indexes.')
    }

  } catch (err) {
    console.log('❌ Error:', err)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkTables()
}