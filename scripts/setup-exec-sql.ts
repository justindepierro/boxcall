#!/usr/bin/env tsx

/**
 * Create exec_sql function and rebuild database
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

async function createExecSQLFunction() {
  console.log('🔧 Creating exec_sql function...')

  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `

  try {
    // Try to create the function using raw SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    })

    if (!response.ok) {
      console.log('❌ Failed to create exec_sql function via REST API')
      console.log('Let\'s try a different approach...')

      // Alternative: Use the Supabase client to create a simple table first
      const { error } = await supabase.from('_temp_test').select('*').limit(1)
      if (error && error.message.includes('relation "_temp_test" does not exist')) {
        console.log('✅ Database connection working, but exec_sql function missing')
        console.log('📝 Please run this SQL in your Supabase SQL Editor:')
        console.log('')
        console.log(createFunctionSQL)
        console.log('')
        return false
      }
    }

    console.log('✅ exec_sql function created')
    return true
  } catch (err) {
    console.log('❌ Exception creating exec_sql function:', err)
    return false
  }
}

async function main() {
  console.log('🚀 Creating exec_sql function for database rebuild')

  const success = await createExecSQLFunction()

  if (!success) {
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open the SQL Editor')
    console.log('3. Run the SQL above to create the exec_sql function')
    console.log('4. Then run: npx tsx scripts/rebuild-database.ts')
    process.exit(1)
  }

  console.log('✅ Ready to rebuild database')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}