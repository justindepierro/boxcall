#!/usr/bin/env tsx

/**
 * Systematic Database Rebuild Script
 * Rebuilds BoxCall database from scratch with proper component separation
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

async function executeSQL(sql: string, description: string) {
  console.log(`🔧 ${description}...`)
  try {
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })
        if (error) {
          console.log(`❌ Failed on statement: ${statement.trim().substring(0, 50)}...`)
          console.log(`   Error: ${error.message}`)
          return false
        }
      }
    }

    console.log(`✅ ${description} completed`)
    return true
  } catch (err) {
    console.log(`❌ Exception: ${err}`)
    return false
  }
}

async function step1_cleanSlate() {
  console.log('\n🧹 STEP 1: Clean Database Slate')
  console.log('================================')

  // Drop all tables in reverse dependency order
  const dropTables = [
    'DROP TABLE IF EXISTS post_shares CASCADE;',
    'DROP TABLE IF EXISTS post_comments CASCADE;',
    'DROP TABLE IF EXISTS post_likes CASCADE;',
    'DROP TABLE IF EXISTS team_posts CASCADE;',
    'DROP TABLE IF EXISTS practice_attendance CASCADE;',
    'DROP TABLE IF EXISTS practice_schedules CASCADE;',
    'DROP TABLE IF EXISTS practice_templates CASCADE;',
    'DROP TABLE IF EXISTS game_plan_plays CASCADE;',
    'DROP TABLE IF EXISTS game_plan_situations CASCADE;',
    'DROP TABLE IF EXISTS game_results CASCADE;',
    'DROP TABLE IF EXISTS game_plans CASCADE;',
    'DROP TABLE IF EXISTS plays CASCADE;',
    'DROP TABLE IF EXISTS playbooks CASCADE;',
    'DROP TABLE IF EXISTS equipment CASCADE;',
    'DROP TABLE IF EXISTS team_events CASCADE;',
    'DROP TABLE IF EXISTS calendar_events CASCADE;',
    'DROP TABLE IF EXISTS achievements CASCADE;',
    'DROP TABLE IF EXISTS helmet_stickers CASCADE;',
    'DROP TABLE IF EXISTS practice_scripts CASCADE;',
    'DROP TABLE IF EXISTS team_players CASCADE;',
    'DROP TABLE IF EXISTS team_members CASCADE;',
    'DROP TABLE IF EXISTS teams CASCADE;',
    'DROP TABLE IF EXISTS profiles CASCADE;'
  ]

  for (const sql of dropTables) {
    await executeSQL(sql, 'Dropping table')
  }

  console.log('✅ Database cleaned')
}

async function step2_authFoundation() {
  console.log('\n🔐 STEP 2: Auth Foundation')
  console.log('=========================')

  // Supabase handles auth tables automatically, just verify
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.log('❌ Auth system check failed:', error.message)
  } else {
    console.log(`✅ Auth system ready (${data.users.length} users)`)
  }
}

async function step3_userProfiles() {
  console.log('\n👤 STEP 3: User Profiles')
  console.log('=======================')

  const profilesSQL = `
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'player' CHECK (role IN ('admin', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'player')),
      bio TEXT,
      phone TEXT,
      email TEXT,
      display_name TEXT,
      address TEXT,
      settings JSONB DEFAULT '{}',
      position TEXT,
      jersey_number INTEGER,
      emergency_contact TEXT,
      emergency_phone TEXT,
      grade_level TEXT,
      height_inches INTEGER,
      weight_lbs INTEGER,
      is_active BOOLEAN DEFAULT true,
      notification_preferences JSONB DEFAULT '{"email": true, "push": true, "social": true}',
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  `

  await executeSQL(profilesSQL, 'Creating profiles table with RLS')
}

async function step4_teamManagement() {
  console.log('\n👥 STEP 4: Team Management')
  console.log('=========================')

  const teamsSQL = `
    CREATE TABLE teams (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      school_name TEXT,
      mascot TEXT,
      season_year INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      play_count INTEGER DEFAULT 0,
      last_backup_at TIMESTAMPTZ,
      backup_version INTEGER DEFAULT 1
    );

    CREATE TABLE team_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach')),
      permissions JSONB DEFAULT '{
        "can_manage_team": false,
        "can_manage_games": false,
        "can_manage_social": false,
        "can_manage_players": false,
        "can_view_analytics": false,
        "can_manage_playbook": false,
        "can_manage_practice": false,
        "can_manage_equipment": false
      }',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      UNIQUE(team_id, user_id)
    );

    ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view teams they belong to" ON teams
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = teams.id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team coaches can update their teams" ON teams
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = teams.id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Users can view team memberships" ON team_members
      FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_members.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team coaches can manage team members" ON team_members
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_members.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );
  `

  await executeSQL(teamsSQL, 'Creating teams and team_members tables with RLS')
}

async function step5_playbookSystem() {
  console.log('\n📖 STEP 5: Playbook System')
  console.log('=========================')

  const playbookSQL = `
    CREATE TABLE playbooks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'Main Playbook',
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      play_count INTEGER DEFAULT 0,
      last_modified_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE plays (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
      formation TEXT NOT NULL,
      play_name TEXT NOT NULL,
      one_word_play TEXT,
      p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
      personnel TEXT,
      f_type TEXT,
      f_dir TEXT,
      protection TEXT,
      p_dir TEXT,
      r_str TEXT,
      p_str TEXT,
      pref_down TEXT,
      pref_dis TEXT,
      pref_hash TEXT,
      pref_cov TEXT,
      pref_front TEXT,
      ftag1 TEXT,
      ftag2 TEXT,
      p_tag1 TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Team coaches can manage playbooks" ON playbooks
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = playbooks.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can view playbooks" ON playbooks
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = playbooks.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team coaches can manage plays" ON plays
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = (SELECT team_id FROM playbooks WHERE id = plays.playbook_id)
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can view plays" ON plays
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = (SELECT team_id FROM playbooks WHERE id = plays.playbook_id)
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );
  `

  await executeSQL(playbookSQL, 'Creating playbooks and plays tables with RLS')
}

async function step6_socialFeatures() {
  console.log('\n💬 STEP 6: Social Features')
  console.log('=========================')

  const socialSQL = `
    CREATE TABLE team_posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      media_urls TEXT[],
      is_pinned BOOLEAN DEFAULT false,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE post_likes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE post_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
      author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE post_shares (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    );

    ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Team members can view posts" ON team_posts
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_posts.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can create posts" ON team_posts
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_posts.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Users can update their own posts" ON team_posts
      FOR UPDATE USING (author_id = auth.uid());

    CREATE POLICY "Team coaches can manage all posts" ON team_posts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_posts.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can interact with posts" ON post_likes
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_posts tp
          JOIN team_members tm ON tm.team_id = tp.team_id
          WHERE tp.id = post_likes.post_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can comment on posts" ON post_comments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_posts tp
          JOIN team_members tm ON tm.team_id = tp.team_id
          WHERE tp.id = post_comments.post_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can share posts" ON post_shares
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_posts tp
          JOIN team_members tm ON tm.team_id = tp.team_id
          WHERE tp.id = post_shares.post_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );
  `

  await executeSQL(socialSQL, 'Creating social features tables with RLS')
}

async function step7_additionalFeatures() {
  console.log('\n⚽ STEP 7: Additional Team Features')
  console.log('=================================')

  const additionalSQL = `
    CREATE TABLE game_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      opponent TEXT NOT NULL,
      game_date DATE NOT NULL,
      venue TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE practice_schedules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE equipment (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 1,
      condition TEXT DEFAULT 'good',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Team coaches can manage game plans" ON game_plans
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = game_plans.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can view game plans" ON game_plans
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = game_plans.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team coaches can manage practice schedules" ON practice_schedules
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = practice_schedules.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can view practice schedules" ON practice_schedules
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = practice_schedules.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team coaches can manage equipment" ON equipment
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = equipment.team_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
          AND tm.is_active = true
        )
      );

    CREATE POLICY "Team members can view equipment" ON equipment
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = equipment.team_id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );
  `

  await executeSQL(additionalSQL, 'Creating additional team features with RLS')
}

async function step8_createAdmin() {
  console.log('\n👑 STEP 8: Create Admin Account')
  console.log('==============================')

  // Create admin user via Supabase Auth
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
    return
  }

  console.log('✅ Admin user created:', authData.user.id)

  // Create admin profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
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

  // Create demo team
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: 'Demo Football Team',
      school_name: 'Demo High School',
      season_year: 2025
    })
    .select()
    .single()

  if (teamError) {
    console.log('❌ Failed to create demo team:', teamError.message)
    return
  }

  console.log('✅ Demo team created:', teamData.id)

  // Add admin to team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: teamData.id,
      user_id: authData.user.id,
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
      },
      is_active: true
    })

  if (memberError) {
    console.log('❌ Failed to add admin to team:', memberError.message)
  } else {
    console.log('✅ Admin added to team')
  }
}

async function step9_demoData() {
  console.log('\n🎭 STEP 9: Add Demo Data')
  console.log('=======================')

  // Get admin user and team
  const { data: users } = await supabase.auth.admin.listUsers()
  const adminUser = users.users.find(u => u.email === 'admin@boxcall.com')
  if (!adminUser) {
    console.log('❌ Admin user not found')
    return
  }

  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .limit(1)

  if (!teams || teams.length === 0) {
    console.log('❌ No teams found')
    return
  }

  const teamId = teams[0].id

  // Create demo playbook
  const { error: playbookError } = await supabase
    .from('playbooks')
    .insert({
      team_id: teamId,
      name: 'Demo Playbook',
      description: 'Sample plays for demonstration'
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
      author_id: adminUser.id,
      content: 'Welcome to BoxCall! This is your team bulletin board.'
    })

  if (postError) {
    console.log('❌ Failed to create demo post:', postError.message)
  } else {
    console.log('✅ Demo post created')
  }

  console.log('✅ Demo data added')
}

async function step10_verify() {
  console.log('\n✅ STEP 10: Verification')
  console.log('=======================')

  // Check all tables exist and have data
  const tables = [
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

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: ${data?.length || 0} records`)
    }
  }

  console.log('\n🎉 Database rebuild complete!')
  console.log('Login with: admin@boxcall.com / Admin123!')
}

async function main() {
  console.log('🚀 BoxCall Systematic Database Rebuild')
  console.log('=====================================')

  try {
    await step1_cleanSlate()
    await step2_authFoundation()
    await step3_userProfiles()
    await step4_teamManagement()
    await step5_playbookSystem()
    await step6_socialFeatures()
    await step7_additionalFeatures()
    await step8_createAdmin()
    await step9_demoData()
    await step10_verify()
  } catch (error) {
    console.error('❌ Rebuild failed:', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as rebuildDatabase }