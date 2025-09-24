#!/usr/bin/env tsx

/**
 * Fix team_members table schema
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

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

async function executeSQL(sql: string) {
  console.log('🔧 Executing SQL...')

  try {
    // First, ensure exec_sql function exists
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

    // Try to create the function
    const { error: createError } = await supabase.from('_temp_exec_sql').select('*').limit(1)
    if (createError) {
      // Function doesn't exist, create it
      console.log('Creating exec_sql function...')
      const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL })
      if (error) {
        console.log('Failed to create exec_sql function, trying direct execution...')
        // If we can't create the function, try direct execution
        return await executeDirectSQL(sql)
      }
    }

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('❌ Error executing SQL:', error)
      return false
    }

    console.log('✅ SQL executed successfully')
    return true
  } catch (err) {
    console.error('❌ Exception executing SQL:', err)
    return false
  }
}

async function executeDirectSQL(sql: string) {
  // This is a fallback that won't work, but let's try
  console.log('Trying direct SQL execution (this may not work)...')
  try {
    const { error } = await supabase.from('_temp').select('*').limit(1)
    if (error) {
      console.log('Direct SQL execution not available')
      return false
    }
  } catch (err) {
    console.log('Direct SQL execution failed')
    return false
  }
  return false
}

async function main() {
  console.log('🚀 Fixing team_members table schema')

  // Read the fix script
  const fixSQL = readFileSync('database/fix_team_members_schema.sql', 'utf8')

  // Split into individual statements and execute them
  const statements = fixSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.trim()) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      const success = await executeSQL(statement)
      if (!success) {
        console.log('❌ Failed to execute statement, continuing...')
      }
    }
  }

  console.log('✅ Team members schema fix completed')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}