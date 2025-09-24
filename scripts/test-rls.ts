import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

// Test with service role (bypasses RLS)
const supabaseService = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

// Test with anon key (uses RLS)
const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testQueries() {
  console.log('Testing teams query with service role (bypasses RLS)...')

  const { data: serviceData, error: serviceError } = await supabaseService
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  if (serviceError) {
    console.error('Service role query error:', serviceError)
  } else {
    console.log('Service role query success:', serviceData?.length, 'teams')
  }

  console.log('\nTesting teams query with anon key (uses RLS)...')

  const { data: anonData, error: anonError } = await supabaseAnon
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  if (anonError) {
    console.error('Anon key query error:', anonError)
  } else {
    console.log('Anon key query success:', anonData?.length, 'teams')
  }
}

testQueries().catch(console.error)