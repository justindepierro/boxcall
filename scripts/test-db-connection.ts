#!/usr/bin/env tsx

/**
 * Simple database connectivity test
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

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  try {
    // Try to get the current user (should work with service key)
    const { error: userError } = await supabase.auth.getUser()
    console.log('Auth status:', userError ? '❌ Error' : '✅ OK')

    // Try to query a basic table that should exist
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (profilesError) {
      console.log('❌ Profiles table:', profilesError.message)
    } else {
      console.log('✅ Profiles table exists')
    }

    // Try teams table
    const { error: teamsError } = await supabase
      .from('teams')
      .select('count')
      .limit(1)

    if (teamsError) {
      console.log('❌ Teams table:', teamsError.message)
    } else {
      console.log('✅ Teams table exists')
    }

    // Try to list all tables using a different approach
    console.log('\n🔍 Attempting to list tables...')

    // This might not work, but let's try
    const { data: tables, error: tablesError } = await supabase
      .rpc('sql', { query: 'SELECT tablename FROM pg_tables WHERE schemaname = \'public\'' })

    if (tablesError) {
      console.log('❌ Cannot list tables via RPC:', tablesError.message)
    } else {
      console.log('✅ Tables found:', tables)
    }

  } catch (err) {
    console.log('❌ Connection error:', err)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
}