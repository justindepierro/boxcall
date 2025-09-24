#!/usr/bin/env tsx

/**
 * Get table schema information
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function getTableInfo() {
  console.log('Getting table information...')

  try {
    // Try to get information about the table structure
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'team_members')
      .eq('table_schema', 'public')

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Team members table columns:')
      data.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : ''}`)
      })
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

getTableInfo()