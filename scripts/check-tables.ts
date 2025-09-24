import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
  console.log('Checking what tables exist in the database...')

  // Try to query a few key tables to see if they exist
  const tablesToCheck = [
    'teams',
    'team_members',
    'profiles',
    'playbooks',
    'plays',
    'team_posts',
    'game_plans',
    'practice_schedules',
    'equipment'
  ]

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: exists`)
      }
    } catch (err) {
      console.log(`❌ ${table}: error - ${err}`)
    }
  }
}

checkTables().catch(console.error)