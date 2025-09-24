import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function disableRLS() {
  console.log('Temporarily disabling RLS on teams table...')

  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE teams DISABLE ROW LEVEL SECURITY;'
  })

  if (error) {
    console.error('Error disabling RLS:', error)
  } else {
    console.log('RLS disabled on teams table')
  }
}

disableRLS().catch(console.error)