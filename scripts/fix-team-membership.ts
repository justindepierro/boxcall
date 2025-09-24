#!/usr/bin/env tsx

/**
 * Fix Team Membership Script
 * Ensures the admin user is properly added to a team for RLS access
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })
config({ path: '.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

async function fixTeamMembership(adminEmail?: string) {
  console.log('🔧 Fixing team membership for admin user...')

  try {
    // Get admin email from parameter or environment
    const email = adminEmail || process.env.ADMIN_EMAIL || 'admin@boxcall.app'
    console.log(`👤 Looking for admin user: ${email}`)

    // Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      process.exit(1)
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ Admin user with email ${email} not found.`)
      console.error('💡 Make sure to run the setup-admin script first.')
      process.exit(1)
    }

    console.log(`✅ Found admin user: ${user.email} (${user.id})`)

    // Check if user has team membership
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (memberError) {
      console.error('❌ Error checking team membership:', memberError.message)
      process.exit(1)
    }

    if (memberships && memberships.length > 0) {
      console.log('✅ User already has team membership:')
      memberships.forEach(m => console.log(`   - Team: ${m.team_id}, Role: ${m.role}`))
      return
    }

    console.log('⚠️ User has no active team membership. Adding to demo team...')

    // Check if demo team exists
    let demoTeamId = '550e8400-e29b-41d4-a716-446655440000' // From sample data

    const { data: existingTeam, error: teamCheckError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', demoTeamId)
      .single()

    if (teamCheckError && teamCheckError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Error checking for demo team:', teamCheckError.message)
      process.exit(1)
    }

    if (!existingTeam) {
      console.log('📝 Demo team not found. Creating it...')

      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert({
          id: demoTeamId,
          name: 'Demo Team',
          school_name: 'BoxCall High',
          mascot: 'Eagles',
          season_year: 2025
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating demo team:', createError.message)
        process.exit(1)
      }

      console.log(`✅ Created demo team: ${newTeam.name}`)
    } else {
      console.log(`✅ Found existing demo team: ${existingTeam.name}`)
    }

    // Add user as head coach to demo team
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: demoTeamId,
        user_id: user.id,
        role: 'head_coach',
        permissions: {
          can_manage_team: true,
          can_manage_players: true,
          can_manage_playbook: true,
          can_manage_games: true,
          can_manage_practice: true,
          can_manage_social: true,
          can_manage_equipment: true,
          can_view_analytics: true
        },
        is_active: true
      })

    if (insertError) {
      console.error('❌ Error adding user to team:', insertError.message)
      process.exit(1)
    }

    console.log('✅ Successfully added user as head coach to demo team!')
    console.log('🎉 Team membership fixed. The app should now work properly.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

async function main() {
  // Get admin email from command line args or environment
  const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL

  if (!adminEmail) {
    console.error('❌ Please provide admin email as argument or set ADMIN_EMAIL environment variable')
    console.error('💡 Usage: npx tsx scripts/fix-team-membership.ts your-email@example.com')
    process.exit(1)
  }

  await fixTeamMembership(adminEmail)
}

main()