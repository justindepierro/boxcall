#!/usr/bin/env tsx

/**
 * Setup Demo Data Script
 * Seeds the database with sample data for development and testing
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   VITE_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('📝 Make sure your .env.local file contains:')
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('')
  console.error('🔑 You can find these values in your Supabase project dashboard:')
  console.error('   - Project URL: Settings > API')
  console.error('   - Service Role Key: Settings > API (reveal the service_role key)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoTeam() {
  console.log('🏈 Creating demo team...')

  // Get admin user
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .single()

  if (adminError || !adminProfile) {
    throw new Error('Admin user not found. Run setup-admin.ts first.')
  }

  // Create demo team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: 'Lincoln High Eagles',
      school_name: 'Lincoln High School',
      mascot: 'Eagles',
      season_year: 2024,
      play_count: 0
    })
    .select()
    .single()

  if (teamError) {
    // Check if team already exists
    const { data: existingTeam } = await supabase
      .from('teams')
      .select()
      .eq('name', 'Lincoln High Eagles')
      .single()

    if (existingTeam) {
      console.log('✅ Demo team already exists')
      return existingTeam
    }
    throw teamError
  }

  console.log(`✅ Created team: ${team.name}`)
  return team
}

async function addTeamMembers(teamId: string, adminId: string) {
  console.log('👥 Adding team members...')

  const members = [
    {
      user_id: adminId,
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
      }
    }
  ]

  for (const member of members) {
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        ...member,
        is_active: true
      })

    if (error && !error.message.includes('duplicate key')) {
      console.error('⚠️ Failed to add team member:', error.message)
    }
  }

  console.log('✅ Team members added')
}

async function createDemoPlayers(teamId: string) {
  console.log('⚽ Creating demo players...')

  const players = [
    { first_name: 'Jake', last_name: 'Thompson', jersey_number: 12, position: 'QB', grade_level: 'Senior' },
    { first_name: 'Marcus', last_name: 'Johnson', jersey_number: 22, position: 'RB', grade_level: 'Junior' },
    { first_name: 'Tyler', last_name: 'Davis', jersey_number: 88, position: 'WR', grade_level: 'Senior' },
    { first_name: 'Brandon', last_name: 'Wilson', jersey_number: 45, position: 'TE', grade_level: 'Junior' },
    { first_name: 'Chris', last_name: 'Brown', jersey_number: 75, position: 'OL', grade_level: 'Senior' },
    { first_name: 'Dylan', last_name: 'Miller', jersey_number: 55, position: 'OL', grade_level: 'Junior' },
    { first_name: 'Ethan', last_name: 'Garcia', jersey_number: 32, position: 'OL', grade_level: 'Sophomore' },
    { first_name: 'Finn', last_name: 'Rodriguez', jersey_number: 68, position: 'OL', grade_level: 'Senior' },
    { first_name: 'Gavin', last_name: 'Martinez', jersey_number: 52, position: 'OL', grade_level: 'Junior' },
    { first_name: 'Hunter', last_name: 'Anderson', jersey_number: 3, position: 'QB', grade_level: 'Sophomore' },
    { first_name: 'Ian', last_name: 'Taylor', jersey_number: 25, position: 'RB', grade_level: 'Sophomore' },
    { first_name: 'Jordan', last_name: 'Thomas', jersey_number: 81, position: 'WR', grade_level: 'Junior' },
    { first_name: 'Kevin', last_name: 'Jackson', jersey_number: 15, position: 'WR', grade_level: 'Senior' },
    { first_name: 'Liam', last_name: 'White', jersey_number: 42, position: 'TE', grade_level: 'Sophomore' },
    { first_name: 'Mason', last_name: 'Harris', jersey_number: 7, position: 'QB', grade_level: 'Freshman' }
  ]

  const { error } = await supabase
    .from('team_players')
    .insert(players.map(player => ({
      team_id: teamId,
      ...player,
      is_active: true
    })))

  if (error) {
    console.error('⚠️ Failed to create players:', error.message)
  } else {
    console.log(`✅ Created ${players.length} demo players`)
  }
}

async function createDemoPlaybook(teamId: string) {
  console.log('📖 Creating demo playbook...')

  // Create playbook
  const { data: playbook, error: playbookError } = await supabase
    .from('playbooks')
    .insert({
      team_id: teamId,
      name: '2024 Main Playbook',
      description: 'Complete offensive playbook for the 2024 season',
      is_active: true
    })
    .select()
    .single()

  if (playbookError) {
    console.error('⚠️ Failed to create playbook:', playbookError.message)
    return null
  }

  console.log(`✅ Created playbook: ${playbook.name}`)
  return playbook
}

async function createDemoPlays(playbookId: string) {
  console.log('🎯 Creating demo plays...')

  const plays = [
    {
      formation: 'Shotgun',
      play_name: 'Slant Right',
      one_word_play: 'Slant',
      p_type: 'Pass',
      personnel: '11',
      f_type: '3-4',
      f_dir: 'Right',
      protection: '5-man',
      p_dir: 'Right',
      r_str: 'Power',
      p_str: 'Quick',
      pref_down: '2nd',
      pref_dis: '5-7',
      pref_hash: 'Field',
      pref_cov: 'Cover 2',
      pref_front: '4-3 Under',
      ftag1: 'Quick',
      ftag2: 'RPO',
      p_tag1: 'Short',
      p_tag2: 'High %',
      back_align: 'Gun',
      shift: 'None',
      motion: 'None',
      key_player1: 'X',
      key_player2: 'H',
      check_into: 'Hot',
      notes: 'High percentage play for 2nd down conversions',
      confidence_base: 85,
      times_called: 12,
      times_successful: 9
    },
    {
      formation: 'I-Formation',
      play_name: 'Inside Zone',
      one_word_play: 'Zone',
      p_type: 'Run',
      personnel: '21',
      f_type: '4-3',
      f_dir: 'Left',
      protection: '6-man',
      p_dir: 'Left',
      r_str: 'Zone',
      p_str: 'Inside',
      pref_down: '1st',
      pref_dis: '10+',
      pref_hash: 'Middle',
      pref_cov: 'Cover 1',
      pref_front: '4-3 Over',
      ftag1: 'Power',
      ftag2: 'Between',
      p_tag1: 'Run',
      p_tag2: 'Inside',
      back_align: 'I',
      shift: 'None',
      motion: 'None',
      key_player1: 'LT',
      key_player2: 'LG',
      check_into: 'Counter',
      notes: 'Primary run play, good for eating clock',
      confidence_base: 78,
      times_called: 25,
      times_successful: 18
    },
    {
      formation: 'Pistol',
      play_name: 'RPO Keep',
      one_word_play: 'RPO Keep',
      p_type: 'RPO',
      personnel: '12',
      f_type: '3-4',
      f_dir: 'Right',
      protection: '5-man',
      p_dir: 'Right',
      r_str: 'RPO',
      p_str: 'Bootleg',
      pref_down: '3rd',
      pref_dis: '7-9',
      pref_hash: 'Boundary',
      pref_cov: 'Cover 3',
      pref_front: '3-4',
      ftag1: 'Trick',
      ftag2: 'Play Action',
      p_tag1: 'RPO',
      p_tag2: 'QB Run',
      back_align: 'Pistol',
      shift: 'None',
      motion: 'Orbit',
      key_player1: 'QB',
      key_player2: 'Y',
      check_into: 'Pass',
      notes: 'Decision-based play, keeps defense honest',
      confidence_base: 92,
      times_called: 8,
      times_successful: 7
    },
    {
      formation: 'Empty',
      play_name: 'Deep Out',
      one_word_play: 'Go',
      p_type: 'Pass',
      personnel: '10',
      f_type: '4-3',
      f_dir: 'Left',
      protection: '5-man',
      p_dir: 'Left',
      r_str: 'Play Action',
      p_str: 'Deep',
      pref_down: '3rd',
      pref_dis: '10+',
      pref_hash: 'Field',
      pref_cov: 'Cover 4',
      pref_front: '4-3 Under',
      ftag1: 'Deep',
      ftag2: 'Bomb',
      p_tag1: 'Vertical',
      p_tag2: 'Go Route',
      back_align: 'Empty',
      shift: 'Bunch',
      motion: 'Jet',
      key_player1: 'X',
      key_player2: 'Z',
      check_into: 'Checkdown',
      notes: 'Stretch the field, create big plays',
      confidence_base: 65,
      times_called: 15,
      times_successful: 6
    },
    {
      formation: 'Wildcat',
      play_name: 'Wildcat Dive',
      one_word_play: 'Wild Dive',
      p_type: 'Run',
      personnel: '20',
      f_type: '3-4',
      f_dir: 'Middle',
      protection: 'Direct Snap',
      p_dir: 'Middle',
      r_str: 'Dive',
      p_str: 'Direct',
      pref_down: '2nd',
      pref_dis: '3-4',
      pref_hash: 'Middle',
      pref_cov: 'Cover 0',
      pref_front: '3-4',
      ftag1: 'Trick',
      ftag2: 'Gadget',
      p_tag1: 'Wildcat',
      p_tag2: 'Direct Snap',
      back_align: 'Wildcat',
      shift: 'None',
      motion: 'None',
      key_player1: 'RB',
      key_player2: 'FB',
      check_into: 'Pitch',
      notes: 'Change of pace, surprise element',
      confidence_base: 88,
      times_called: 5,
      times_successful: 4
    }
  ]

  const { error } = await supabase
    .from('plays')
    .insert(plays.map(play => ({
      playbook_id: playbookId,
      ...play
    })))

  if (error) {
    console.error('⚠️ Failed to create plays:', error.message)
  } else {
    console.log(`✅ Created ${plays.length} demo plays`)
  }
}

async function createDemoPosts(teamId: string, adminId: string) {
  console.log('📱 Creating demo social posts...')

  const posts = [
    {
      content: '🏈 First practice of the season went great! Everyone is excited for the upcoming year. #GoEagles',
      is_pinned: true
    },
    {
      content: '📋 New playbook uploaded! Check out the updated formations and plays for this week\'s practice.',
      is_pinned: false
    },
    {
      content: '🎯 Great job on the zone blocking today, offensive line! Keep up the hard work. #Teamwork',
      is_pinned: false
    },
    {
      content: '📅 Reminder: Team meeting tomorrow at 6 PM in the locker room. Don\'t be late!',
      is_pinned: false
    },
    {
      content: '🏆 Congratulations to Jake Thompson for being named team captain! #Leadership',
      is_pinned: false
    }
  ]

  for (const post of posts) {
    const { error } = await supabase
      .from('team_posts')
      .insert({
        team_id: teamId,
        author_id: adminId,
        ...post
      })

    if (error) {
      console.error('⚠️ Failed to create post:', error.message)
    }
  }

  console.log(`✅ Created ${posts.length} demo posts`)
}

async function createDemoGames(teamId: string) {
  console.log('🏟️ Creating demo games...')

  const games = [
    {
      opponent: 'Riverside Tigers',
      game_date: '2024-09-15',
      our_score: 28,
      opponent_score: 21,
      result: 'win',
      venue: 'Home',
      home_away: 'home',
      notes: 'Great team effort! Defense stepped up in the 4th quarter.'
    },
    {
      opponent: 'Valley Knights',
      game_date: '2024-09-22',
      our_score: 35,
      opponent_score: 38,
      result: 'loss',
      venue: 'Away',
      home_away: 'away',
      notes: 'Tough loss but learned a lot. Need to work on time management.'
    },
    {
      opponent: 'Mountain Lions',
      game_date: '2024-09-29',
      our_score: 42,
      opponent_score: 14,
      result: 'win',
      venue: 'Home',
      home_away: 'home',
      notes: 'Dominating performance! Offense was clicking on all cylinders.'
    }
  ]

  const { error } = await supabase
    .from('game_results')
    .insert(games.map(game => ({
      team_id: teamId,
      ...game
    })))

  if (error) {
    console.error('⚠️ Failed to create games:', error.message)
  } else {
    console.log(`✅ Created ${games.length} demo games`)
  }
}

async function main() {
  console.log('🎭 BoxCall Demo Data Setup')
  console.log('==========================\n')

  try {
    // Create/get demo team
    const team = await createDemoTeam()

    // Get admin user
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (!adminProfile) {
      throw new Error('Admin user not found')
    }

    // Add team members
    await addTeamMembers(team.id, adminProfile.id)

    // Create players
    await createDemoPlayers(team.id)

    // Create playbook and plays
    const playbook = await createDemoPlaybook(team.id)
    if (playbook) {
      await createDemoPlays(playbook.id)
    }

    // Create social posts
    await createDemoPosts(team.id, adminProfile.id)

    // Create game results
    await createDemoGames(team.id)

    console.log('\n🎉 Demo data setup complete!')
    console.log('\nDemo Content Created:')
    console.log('• Lincoln High Eagles football team')
    console.log('• 15 demo players')
    console.log('• Complete playbook with 5 plays')
    console.log('• 5 social media posts')
    console.log('• 3 game results')
    console.log('\nNext steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Login with admin credentials')
    console.log('3. Explore all BoxCall features!')

  } catch (error) {
    console.error('\n❌ Demo setup failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)