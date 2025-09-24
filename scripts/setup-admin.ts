#!/usr/bin/env tsx

/**
 * Setup admin account and demo data after database rebuild
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

async function setupAdminAccount() {
  console.log('👑 Setting up admin account...')

  try {
    // Check if admin user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const adminUser = existingUsers.users.find(u => u.email === 'admin@boxcall.com')

    let adminUserId: string

    if (adminUser) {
      console.log('✅ Admin user already exists')
      adminUserId = adminUser.id
    } else {
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@boxcall.com',
        password: 'Admin123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'BoxCall Admin'
        }
      })

      if (authError) {
        console.log('❌ Failed to create admin user:', authError.message)
        return null
      }

      console.log('✅ Admin user created')
      adminUserId = authData.user.id
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserId,
        full_name: 'BoxCall Admin',
        email: 'admin@boxcall.com',
        role: 'admin',
        display_name: 'BoxCall Admin',
        is_active: true
      })

    if (profileError) {
      console.log('❌ Failed to create admin profile:', profileError.message)
    } else {
      console.log('✅ Admin profile created')
    }

    return adminUserId
  } catch (err) {
    console.log('❌ Exception setting up admin:', err)
    return null
  }
}

async function createDemoTeam(adminUserId: string) {
  console.log('🏈 Creating demo team...')

  try {
    // Create demo team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: 'Demo Football Team',
        school_name: 'Demo High School',
        mascot: 'Eagles',
        season_year: 2025
      })
      .select()
      .single()

    if (teamError) {
      console.log('❌ Failed to create demo team:', teamError.message)
      return null
    }

    console.log('✅ Demo team created')

    // Add admin to team as head coach
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamData.id,
        user_id: adminUserId,
        team_role: 'head_coach',
        capabilities: {
          can_manage_team: true,
          can_manage_games: true,
          can_manage_social: true,
          can_manage_players: true,
          can_view_analytics: true,
          can_manage_playbook: true,
          can_manage_practice: true,
          can_manage_equipment: true
        },
        status: 'active'
      })

    if (memberError) {
      console.log('❌ Failed to add admin to team:', memberError.message)
    } else {
      console.log('✅ Admin added to team as head coach')
    }

    return teamData.id
  } catch (err) {
    console.log('❌ Exception creating demo team:', err)
    return null
  }
}

async function addDemoData(teamId: string, adminUserId: string) {
  console.log('🎭 Adding demo data...')

  try {
    // Create demo playbook
    const { error: playbookError } = await supabase
      .from('playbooks')
      .insert({
        team_id: teamId,
        name: 'Demo Playbook',
        description: 'Sample plays for demonstration purposes'
      })

    if (playbookError) {
      console.log('❌ Failed to create demo playbook:', playbookError.message)
    } else {
      console.log('✅ Demo playbook created')
    }

    // Create demo post
    const { error: postError } = await supabase
      .from('team_posts')
      .insert({
        team_id: teamId,
        author_id: adminUserId,
        content: '🎉 Welcome to BoxCall! This is your team\'s social feed where you can share updates, photos, and communicate with your team.\n\n📱 Key features:\n• Team playbook management\n• Practice and game scheduling\n• Equipment tracking\n• Social posts and interactions\n\nLet\'s build an awesome season! 🏈'
      })

    if (postError) {
      console.log('❌ Failed to create demo post:', postError.message)
    } else {
      console.log('✅ Demo post created')
    }

    // Create demo practice schedule
    const { error: practiceError } = await supabase
      .from('practice_schedules')
      .insert({
        team_id: teamId,
        practice_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        start_time: '16:00',
        end_time: '18:00',
        location: 'Main Field',
        notes: 'Kick off the season with our first practice session'
      })

    if (practiceError) {
      console.log('❌ Failed to create demo practice:', practiceError.message)
    } else {
      console.log('✅ Demo practice scheduled')
    }

    console.log('✅ Demo data added')
  } catch (err) {
    console.log('❌ Exception adding demo data:', err)
  }
}

async function verifySetup() {
  console.log('✅ Verifying setup...')

  try {
    // Check tables exist and have data
    const tablesToCheck = [
      'profiles',
      'teams',
      'team_members',
      'playbooks',
      'plays',
      'team_posts',
      'game_plans',
      'practice_schedules',
      'equipment'
    ]

    let allGood = true

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
          allGood = false
        } else {
          console.log(`✅ ${tableName}: ${data?.length || 0} records`)
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Exception - ${err}`)
        allGood = false
      }
    }

    if (allGood) {
      console.log('')
      console.log('🎉 Database rebuild complete!')
      console.log('Login with: admin@boxcall.com / Admin123!')
      console.log('')
      console.log('📱 Next steps:')
      console.log('1. Start the development server: npm run dev')
      console.log('2. Open http://localhost:5173')
      console.log('3. Login with the admin credentials above')
      console.log('4. Explore the demo team and features!')
    } else {
      console.log('')
      console.log('⚠️ Some tables may have issues. Check the errors above.')
    }
  } catch (err) {
    console.log('❌ Exception during verification:', err)
  }
}

async function main() {
  console.log('🚀 BoxCall Post-Rebuild Setup')
  console.log('=============================')

  try {
    const adminUserId = await setupAdminAccount()
    if (!adminUserId) {
      console.log('❌ Failed to setup admin account')
      return
    }

    const teamId = await createDemoTeam(adminUserId)
    if (!teamId) {
      console.log('❌ Failed to create demo team')
      return
    }

    await addDemoData(teamId, adminUserId)
    await verifySetup()
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

