#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const client = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string
)

async function checkMemberships() {
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .eq('user_id', 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Admin memberships:', data)
  }
}

checkMemberships()