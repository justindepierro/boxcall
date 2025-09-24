import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function createMissingTables() {
  console.log('Creating missing tables...')

  // Tables that are missing based on our check
  const missingTables = [
    'playbooks',
    'plays',
    'game_plans',
    'practice_schedules',
    'equipment'
  ]

  // Read the full schema
  const schemaPath = join(process.cwd(), 'database', 'schema.sql')
  const schemaSQL = readFileSync(schemaPath, 'utf-8')

  // Split into statements
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

  console.log(`Found ${statements.length} SQL statements`)

  // Execute CREATE TABLE statements for missing tables
  for (const statement of statements) {
    if (statement.includes('CREATE TABLE') && statement.includes('playbooks')) {
      console.log('Creating playbooks table...')
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
        console.log('✅ playbooks table created')
      } catch (error) {
        console.log('❌ Failed to create playbooks:', error)
      }
    }

    if (statement.includes('CREATE TABLE') && statement.includes('plays')) {
      console.log('Creating plays table...')
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
        console.log('✅ plays table created')
      } catch (error) {
        console.log('❌ Failed to create plays:', error)
      }
    }

    if (statement.includes('CREATE TABLE') && statement.includes('game_plans')) {
      console.log('Creating game_plans table...')
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
        console.log('✅ game_plans table created')
      } catch (error) {
        console.log('❌ Failed to create game_plans:', error)
      }
    }

    if (statement.includes('CREATE TABLE') && statement.includes('practice_schedules')) {
      console.log('Creating practice_schedules table...')
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
        console.log('✅ practice_schedules table created')
      } catch (error) {
        console.log('❌ Failed to create practice_schedules:', error)
      }
    }

    if (statement.includes('CREATE TABLE') && statement.includes('equipment')) {
      console.log('Creating equipment table...')
      try {
        await supabase.rpc('exec_sql', { sql: statement + ';' })
        console.log('✅ equipment table created')
      } catch (error) {
        console.log('❌ Failed to create equipment:', error)
      }
    }
  }

  console.log('Finished creating missing tables')
}

createMissingTables().catch(console.error)