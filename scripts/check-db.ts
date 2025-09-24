import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDatabase() {
  console.log('Checking database state...')

  // Check teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')

  if (teamsError) {
    console.error('Teams query error:', teamsError)
  } else {
    console.log('Teams:', teams?.length || 0, 'found')
    console.log(teams)
  }

  // Check team_members
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')

  if (membersError) {
    console.error('Team members query error:', membersError)
  } else {
    console.log('Team members:', members?.length || 0, 'found')
    console.log(members)
  }

  // Check profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  if (profilesError) {
    console.error('Profiles query error:', profilesError)
  } else {
    console.log('Profiles:', profiles?.length || 0, 'found')
    console.log(profiles)
  }

  // Check auth users (limited)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Auth users query error:', authError)
  } else {
    console.log('Auth users:', authUsers?.users?.length || 0, 'found')
    authUsers?.users?.forEach(user => {
      console.log(`- ${user.email} (${user.id})`)
    })
  }
}

checkDatabase().catch(console.error)