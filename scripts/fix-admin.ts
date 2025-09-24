import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function fixAdminSetup() {
  console.log('Fixing admin setup...')

  const adminUserId = '5090d80a-41aa-452e-b2c9-4c37fe11bf97'
  const teamId = '28db33da-3e9b-4953-ac79-de71453dfea2'

  // Create profile (with minimal fields)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: adminUserId,
      full_name: 'BoxCall Admin',
      role: 'admin',
      display_name: 'BoxCall Admin'
    })

  if (profileError) {
    console.error('Profile creation error:', profileError)
  } else {
    console.log('Profile created')
  }

  // Create team membership (without is_active column)
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: adminUserId,
      role: 'head_coach',
      permissions: {
        can_manage_team: true,
        can_manage_games: true,
        can_manage_social: true,
        can_manage_players: true,
        can_view_analytics: true,
        can_manage_playbook: true,
        can_manage_practice: true,
        can_manage_equipment: true
      }
    })

  if (memberError) {
    console.error('Team member creation error:', memberError)
  } else {
    console.log('Team membership created')
  }
}

fixAdminSetup().catch(console.error)