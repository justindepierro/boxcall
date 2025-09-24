import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function createTables() {
  console.log('Creating missing tables...')

  // Playbooks table
  const playbooksSQL = `
    CREATE TABLE playbooks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'Main Playbook',
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      play_count INTEGER DEFAULT 0,
      last_modified_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: playbooksSQL })
    console.log('✅ Created playbooks table')
  } catch (error) {
    console.log('❌ Failed to create playbooks:', error)
  }

  // Plays table (simplified version)
  const playsSQL = `
    CREATE TABLE plays (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
      formation TEXT NOT NULL,
      play_name TEXT NOT NULL,
      p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: playsSQL })
    console.log('✅ Created plays table')
  } catch (error) {
    console.log('❌ Failed to create plays:', error)
  }

  // Game plans table
  const gamePlansSQL = `
    CREATE TABLE game_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      opponent TEXT NOT NULL,
      game_date DATE NOT NULL,
      venue TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: gamePlansSQL })
    console.log('✅ Created game_plans table')
  } catch (error) {
    console.log('❌ Failed to create game_plans:', error)
  }

  // Practice schedules table
  const practiceSchedulesSQL = `
    CREATE TABLE practice_schedules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: practiceSchedulesSQL })
    console.log('✅ Created practice_schedules table')
  } catch (error) {
    console.log('❌ Failed to create practice_schedules:', error)
  }

  // Equipment table
  const equipmentSQL = `
    CREATE TABLE equipment (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 1,
      condition TEXT DEFAULT 'good',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    await supabase.rpc('exec_sql', { sql: equipmentSQL })
    console.log('✅ Created equipment table')
  } catch (error) {
    console.log('❌ Failed to create equipment:', error)
  }

  console.log('Finished creating tables')
}

createTables().catch(console.error)