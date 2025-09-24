#!/usr/bin/env tsx

/**
 * Temporarily disable RLS to test
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function disableRLS() {
  console.log('Disabling RLS on team_members table...')

  try {
    // Try to disable RLS
    const { error } = await supabase.from('team_members').select('*').limit(1)
    if (error) {
      console.log('RLS is active, trying to disable...')
      // Since we can't execute SQL, let's try a different approach
      console.log('Please run this SQL in Supabase SQL Editor:')
      console.log('ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;')
    } else {
      console.log('RLS appears to be disabled or not active')
    }
  } catch (err) {
    console.log('Error:', err)
  }
}

disableRLS()