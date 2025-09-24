import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function inspectTables() {
  console.log('Inspecting table schemas...')

  // Check profiles table
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (profilesError) {
    console.error('Profiles query error:', profilesError)
  } else {
    console.log('Profiles table exists, sample data:', profilesData)
  }

  // Check team_members table
  const { data: membersData, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .limit(1)

  if (membersError) {
    console.error('Team members query error:', membersError)
  } else {
    console.log('Team members table exists, sample data:', membersData)
  }

  // Try to get table info using information_schema
  const { data: columnsData, error: columnsError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name IN ('profiles', 'team_members')
        ORDER BY table_name, ordinal_position;
      `
    })

  if (columnsError) {
    console.error('Columns query error:', columnsError)
  } else {
    console.log('Table columns:', columnsData)
  }
}

inspectTables().catch(console.error)