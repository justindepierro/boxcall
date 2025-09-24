#!/usr/bin/env tsx

/**
 * Generate SQL files for manual execution in Supabase SQL Editor
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

function generateCleanSlateSQL() {
  return `-- ===========================================
-- CLEAN DATABASE SLATE
-- ===========================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS team_posts CASCADE;
DROP TABLE IF EXISTS practice_attendance CASCADE;
DROP TABLE IF EXISTS practice_schedules CASCADE;
DROP TABLE IF EXISTS practice_templates CASCADE;
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_plans CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS playbooks CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS team_events CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS helmet_stickers CASCADE;
DROP TABLE IF EXISTS practice_scripts CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the exec_sql function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);
`
}

function generateProfilesSQL() {
  return `-- ===========================================
-- USER PROFILES
-- ===========================================

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
}

function generateTeamsSQL() {
  return `-- ===========================================
-- TEAM MANAGEMENT
-- ===========================================

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
}

function generatePlaybookSQL() {
  return `-- ===========================================
-- PLAYBOOK SYSTEM
-- ===========================================

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
}

function generateSocialSQL() {
  return `-- ===========================================
-- SOCIAL FEATURES
-- ===========================================

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
}

function generateAdditionalSQL() {
  return `-- ===========================================
-- ADDITIONAL TEAM FEATURES
-- ===========================================

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
}

function main() {
  console.log('📄 Generating SQL files for manual execution...')

  const outputDir = join(process.cwd(), 'database', 'rebuild')

  // Create output directory if it doesn't exist
  try {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }
  } catch (err) {
    console.error('❌ Failed to create output directory:', err)
    return
  }

  // Generate SQL files
  const sqlFiles = [
    { name: '01_clean_slate.sql', content: generateCleanSlateSQL() },
    { name: '02_profiles.sql', content: generateProfilesSQL() },
    { name: '03_teams.sql', content: generateTeamsSQL() },
    { name: '04_playbooks.sql', content: generatePlaybookSQL() },
    { name: '05_social.sql', content: generateSocialSQL() },
    { name: '06_additional_features.sql', content: generateAdditionalSQL() }
  ]

  for (const file of sqlFiles) {
    const filePath = join(outputDir, file.name)
    writeFileSync(filePath, file.content)
    console.log(`✅ Generated ${file.name}`)
  }

  console.log('')
  console.log('📋 Next steps:')
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Open the SQL Editor')
  console.log('3. Run the SQL files in order (01 through 06)')
  console.log('4. After running all SQL files, run: npx tsx scripts/setup-admin.ts')
  console.log('')
  console.log(`📁 SQL files generated in: ${outputDir}`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}