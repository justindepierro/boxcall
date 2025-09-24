#!/usr/bin/env tsx

/**
 * Disable RLS temporarily to inspect schema
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function inspectWithServiceKey() {
  console.log('Inspecting team_members table with service key...')

  try {
    // Service key should bypass RLS
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Available columns:', Object.keys(data[0] || {}))
      console.log('Sample data:', data[0])
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

inspectWithServiceKey()