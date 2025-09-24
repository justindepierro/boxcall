#!/usr/bin/env tsx

/**
 * Test team_members query
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function testQuery() {
  console.log('Testing team_members query...')

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, team_role, capabilities, role_notes, assigned_at, status')
      .limit(1)

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success:', data)
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

testQuery()