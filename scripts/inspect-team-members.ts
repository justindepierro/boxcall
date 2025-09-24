#!/usr/bin/env tsx

/**
 * Inspect team_members table schema
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function inspectSchema() {
  console.log('Inspecting team_members table schema...')

  try {
    // Try to select all columns to see what exists
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

inspectSchema()