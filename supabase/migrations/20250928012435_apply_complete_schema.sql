-- BoxCall Database Schema - Clean Rebuild
-- Based on DATABASE_SCHEMA_REFERENCE.md
-- Generated: September 23, 2025

-- Enable required extensions
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS "pgcrypto";
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION "pgcrypto";

-- ===========================================
-- CORE TEAM MANAGEMENT TABLES
-- ===========================================

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 0,
  last_backup_at TIMESTAMPTZ,
  backup_version INTEGER DEFAULT 1
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach')),
  capabilities JSONB DEFAULT '{
    "can_manage_team": false,
    "can_manage_games": false,
    "can_manage_social": false,
    "can_manage_players": false,
    "can_view_analytics": false,
    "can_manage_playbook": false,
    "can_manage_practice": false,
    "can_manage_equipment": false
  }',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  role_notes TEXT,
  UNIQUE(team_id, user_id)
);

-- Team players table
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  grade_level TEXT,
  height_inches INTEGER,
  weight_lbs INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (consolidated)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'player',
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

-- ===========================================
-- PLAYBOOK & PLAYS SYSTEM
-- ===========================================

-- Playbooks table
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

-- Plays table
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
  p_tag2 TEXT,
  back_align TEXT,
  shift TEXT,
  motion TEXT,
  key_player1 TEXT,
  key_player2 TEXT,
  check_into TEXT,
  notes TEXT,
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play calls table
CREATE TABLE play_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID, -- Will reference game_results when created
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  quarter INTEGER,
  time_remaining TEXT,
  yard_line INTEGER,
  down INTEGER,
  distance INTEGER,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- SOCIAL FEATURES
-- ===========================================

-- Team posts table
CREATE TABLE team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments table
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post shares table
CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ===========================================
-- GAME MANAGEMENT
-- ===========================================

-- Game plans table
CREATE TABLE game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  venue TEXT,
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plan situations table
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_type TEXT NOT NULL, -- '1st_down', '2nd_down', '3rd_down', 'goal_line', etc.
  yard_line INTEGER,
  down INTEGER,
  distance INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plan plays table
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game results table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  our_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('win', 'loss', 'tie')),
  venue TEXT,
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PRACTICE MANAGEMENT
-- ===========================================

-- Practice scripts table
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice schedules table
CREATE TABLE practice_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice attendance table
CREATE TABLE practice_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice templates table
CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ANALYTICS & PERFORMANCE
-- ===========================================

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  description TEXT,
  earned_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helmet stickers table
CREATE TABLE helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL,
  earned_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CALENDAR & EVENTS
-- ===========================================

-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT CHECK (event_type IN ('game', 'practice', 'meeting', 'other')) DEFAULT 'other',
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team events table
CREATE TABLE team_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- EQUIPMENT MANAGEMENT
-- ===========================================

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
  last_checked DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Core indexes
CREATE INDEX idx_teams_season_year ON teams(season_year);
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX idx_team_members_user_status ON team_members(user_id, status);
CREATE INDEX idx_team_players_team_active ON team_players(team_id, is_active);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Playbook indexes
CREATE INDEX idx_playbooks_team_active ON playbooks(team_id, is_active);
CREATE INDEX idx_plays_playbook ON plays(playbook_id);
CREATE INDEX idx_plays_type ON plays(p_type);

-- Social features indexes
CREATE INDEX idx_team_posts_team_created ON team_posts(team_id, created_at DESC);
CREATE INDEX idx_team_posts_author ON team_posts(author_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_shares_post ON post_shares(post_id);

-- Game management indexes
CREATE INDEX idx_game_plans_team_date ON game_plans(team_id, game_date);
CREATE INDEX idx_game_results_team_date ON game_results(team_id, game_date);

-- Practice indexes
CREATE INDEX idx_practice_schedules_team_date ON practice_schedules(team_id, practice_date);
CREATE INDEX idx_practice_attendance_practice ON practice_attendance(practice_id);

-- Calendar indexes
CREATE INDEX idx_calendar_events_team_date ON calendar_events(team_id, event_date);
CREATE INDEX idx_team_events_team_date ON team_events(team_id, event_date);

-- Equipment indexes
CREATE INDEX idx_equipment_team_category ON equipment(team_id, category);

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES - TEAM-BASED ACCESS CONTROL
-- ===========================================

-- Teams: Users can view teams they belong to
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can update their teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Team members: Users can view/manage team membership for their teams
CREATE POLICY "Users can view team members for their teams" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Profiles: Users can view profiles of team members
CREATE POLICY "Users can view profiles of team members" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM team_members tm2
        WHERE tm2.team_id = tm.team_id
        AND tm2.user_id = auth.uid()
        AND tm2.status = 'active'
      )
    ) OR profiles.id = auth.uid()
  );

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Playbooks: Team members can access their team's playbooks
CREATE POLICY "Team members can view playbooks" ON playbooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage playbooks" ON playbooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Plays: Team members can access their team's plays
CREATE POLICY "Team members can view plays" ON plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Team posts: Team members can view and interact with team posts
CREATE POLICY "Team members can view team posts" ON team_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can create team posts" ON team_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own posts" ON team_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Team coaches can manage all posts" ON team_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Post interactions: Team members can interact with posts
CREATE POLICY "Team members can like posts" ON post_likes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN team_posts tp ON tp.team_id = tm.team_id
      WHERE tp.id = post_likes.post_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can comment on posts" ON post_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN team_posts tp ON tp.team_id = tm.team_id
      WHERE tp.id = post_comments.post_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can share posts" ON post_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN team_posts tp ON tp.team_id = tm.team_id
      WHERE tp.id = post_shares.post_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Game management: Team members can access game data
CREATE POLICY "Team members can view game plans" ON game_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_plans.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage game plans" ON game_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_plans.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Similar policies for game_plan_situations, game_plan_plays, game_results
CREATE POLICY "Team members can view game situations" ON game_plan_situations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      WHERE gp.id = game_plan_situations.game_plan_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage game situations" ON game_plan_situations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      WHERE gp.id = game_plan_situations.game_plan_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view game plan plays" ON game_plan_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage game plan plays" ON game_plan_plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view game results" ON game_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_results.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage game results" ON game_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_results.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Practice management: Team members can access practice data
CREATE POLICY "Team members can view practice scripts" ON practice_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_scripts.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage practice scripts" ON practice_scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_scripts.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view practice schedules" ON practice_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_schedules.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage practice schedules" ON practice_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_schedules.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view practice attendance" ON practice_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN practice_schedules ps ON ps.team_id = tm.team_id
      WHERE ps.id = practice_attendance.practice_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage practice attendance" ON practice_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN practice_schedules ps ON ps.team_id = tm.team_id
      WHERE ps.id = practice_attendance.practice_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view practice templates" ON practice_templates
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR is_public = true
  );

CREATE POLICY "Team coaches can manage practice templates" ON practice_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Analytics: Team members can view achievements and stickers
CREATE POLICY "Team members can view achievements" ON achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = (SELECT team_id FROM team_players WHERE id = achievements.player_id)
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage achievements" ON achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = (SELECT team_id FROM team_players WHERE id = achievements.player_id)
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view helmet stickers" ON helmet_stickers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = (SELECT team_id FROM team_players WHERE id = helmet_stickers.player_id)
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage helmet stickers" ON helmet_stickers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = (SELECT team_id FROM team_players WHERE id = helmet_stickers.player_id)
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Calendar: Team members can view calendar events
CREATE POLICY "Team members can view calendar events" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = calendar_events.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage calendar events" ON calendar_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = calendar_events.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can view team events" ON team_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_events.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage team events" ON team_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_events.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Equipment: Team members can view equipment
CREATE POLICY "Team members can view equipment" ON equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = equipment.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage equipment" ON equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = equipment.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- ===========================================
-- SEASON STATS VIEW
-- ===========================================

CREATE VIEW season_stats AS
SELECT
  tp.id as player_id,
  tp.first_name,
  tp.last_name,
  tp.jersey_number,
  tp.position,
  t.name as team_name,
  t.season_year,
  COALESCE(SUM(CASE WHEN pc.result = 'complete' THEN 1 ELSE 0 END), 0) as pass_completions,
  COALESCE(SUM(CASE WHEN pc.result = 'incomplete' THEN 1 ELSE 0 END), 0) as pass_attempts,
  COALESCE(SUM(CASE WHEN pc.result = 'touchdown' THEN 1 ELSE 0 END), 0) as passing_touchdowns,
  COALESCE(SUM(CASE WHEN pc.result = 'interception' THEN 1 ELSE 0 END), 0) as interceptions,
  COALESCE(SUM(CASE WHEN pc.result = 'rush' THEN 1 ELSE 0 END), 0) as rush_attempts,
  COALESCE(SUM(CASE WHEN pc.result = 'rush_td' THEN 1 ELSE 0 END), 0) as rushing_touchdowns,
  COALESCE(SUM(CASE WHEN pc.result = 'reception' THEN 1 ELSE 0 END), 0) as receptions,
  COALESCE(SUM(CASE WHEN pc.result = 'receiving_td' THEN 1 ELSE 0 END), 0) as receiving_touchdowns,
  COUNT(DISTINCT a.id) as achievements_count,
  COUNT(DISTINCT hs.id) as stickers_count
FROM team_players tp
JOIN teams t ON t.id = tp.team_id
LEFT JOIN play_calls pc ON pc.game_id IN (
  SELECT gr.id FROM game_results gr WHERE gr.team_id = t.id
)
LEFT JOIN achievements a ON a.player_id = tp.id
LEFT JOIN helmet_stickers hs ON hs.player_id = tp.id
WHERE tp.is_active = true
GROUP BY tp.id, tp.first_name, tp.last_name, tp.jersey_number, tp.position, t.name, t.season_year;

-- ===========================================
-- INITIALIZATION COMPLETE
-- ===========================================

DO $$
BEGIN
  RAISE NOTICE '🎉 BoxCall database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run setup-admin.ts to create admin user';
  RAISE NOTICE '2. Run setup-demo.ts to seed demo data';
  RAISE NOTICE '3. Test frontend integration';
END $$;