-- BoxCall Database Schema
-- Complete Supabase database setup for all BoxCall features
-- Run these commands in your Supabase SQL editor

-- =============================================================================
-- CORE TEAM & USER MANAGEMENT
-- =============================================================================

-- Super Admin Management (BoxCall platform administrators)
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  admin_level TEXT DEFAULT 'admin' CHECK (admin_level IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '{"manage_teams": true, "manage_users": true, "view_analytics": true}',
  added_by UUID REFERENCES auth.users(id), -- Who granted admin access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert founder as super admin (run after user creation)
-- INSERT INTO super_admins (user_id, email, admin_level, permissions) 
-- SELECT id, email, 'super_admin', '{"manage_teams": true, "manage_users": true, "view_analytics": true, "manage_admins": true}'
-- FROM auth.users WHERE email = 'justindepierro@gmail.com';

-- Enhanced user profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  position TEXT, -- For players: QB, RB, WR, etc.
  jersey_number INTEGER,
  grade_level TEXT, -- 9th, 10th, 11th, 12th, College
  height_inches INTEGER,
  weight_lbs INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams (enhanced from existing team_settings)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  colors_primary TEXT,
  colors_secondary TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'coach', 'team_premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  team_code TEXT UNIQUE, -- For easy team joining
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  league_division TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members with roles (enhanced from existing team_members)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('head_coach', 'coach', 'player', 'manager', 'family')),
  permissions JSONB DEFAULT '{}', -- Custom permissions per user
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, team_id)
);

-- =============================================================================
-- PLAYBOOK & PLAYS SYSTEM
-- =============================================================================

-- Playbooks (collections of plays)
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  playbook_type TEXT DEFAULT 'offense' CHECK (playbook_type IN ('offense', 'defense', 'special_teams')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual plays within playbooks
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE NOT NULL,
  
  -- Core play information (from CSV template)
  formation TEXT NOT NULL, -- River, Doubles, Purple, Trio, etc.
  f_dir TEXT, -- R, L (formation direction)
  ftag1 TEXT,
  ftag2 TEXT,
  back_align TEXT, -- Near, etc.
  shift TEXT,
  motion TEXT, -- Jet Rt, Zorro, etc.
  protection TEXT, -- Razor, Half, etc.
  
  play_name TEXT NOT NULL, -- Squid, Trail, IZ, Truck, ALPHA, etc.
  p_tag1 TEXT,
  p_tag2 TEXT,
  p_dir TEXT, -- R, L (play direction)
  
  -- Play classification
  f_type TEXT, -- 3x1, 2x2 (formation type)
  p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO')), -- Play type
  
  -- Key players
  key_player1 TEXT,
  key_player2 TEXT,
  
  -- Situational preferences
  pref_down TEXT, -- 1, 2, 3
  pref_dis TEXT, -- Short, Medium, Long
  pref_hash TEXT, -- L, M, R (field position)
  pref_cov TEXT, -- Zone, Man (coverage)
  pref_front TEXT, -- Even, Odd
  
  -- Additional information
  check_into TEXT, -- Alternate play calls
  r_str TEXT, -- Run strength
  p_str TEXT, -- Pass strength
  personnel TEXT, -- Reg, Heavy, Light
  
  -- BoxCall specific
  confidence_base DECIMAL(5,2) DEFAULT 70.0, -- Base confidence score
  success_rate DECIMAL(5,2), -- Historical success rate
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  
  -- Media and notes
  diagram_url TEXT, -- Play diagram image
  video_url TEXT, -- Instructional video
  notes TEXT,
  tags TEXT[], -- Custom tags for filtering
  
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PRACTICE MANAGEMENT
-- =============================================================================

-- Practice scripts (practice plans)
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  practice_date DATE,
  practice_time TIME,
  location TEXT,
  duration_minutes INTEGER DEFAULT 120,
  focus_areas TEXT[], -- ['red_zone', 'third_down', 'two_minute']
  notes TEXT,
  weather_conditions TEXT,
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plays within practice scripts
CREATE TABLE script_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES practice_scripts(id) ON DELETE CASCADE NOT NULL,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  reps INTEGER DEFAULT 1,
  emphasis TEXT, -- 'timing', 'execution', 'situation'
  notes TEXT,
  estimated_time_minutes INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SOCIAL & COMMUNICATION
-- =============================================================================

-- Team posts (social media style)
CREATE TABLE team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'announcement', 'achievement', 'game_result', 'practice_update')),
  media_urls TEXT[], -- Images, videos
  is_pinned BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('team', 'coaches_only', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions to posts (likes, loves, etc.)
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'support', 'fire')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- One reaction per user per post
);

-- Comments on posts
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id), -- For threaded comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team announcements (important messages)
CREATE TABLE team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_roles TEXT[] DEFAULT ARRAY['player', 'coach', 'family'], -- Who should see this
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- GAMIFICATION & ACHIEVEMENTS
-- =============================================================================

-- Team goals and objectives
CREATE TABLE team_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT CHECK (goal_type IN ('wins', 'stats', 'behavior', 'academic', 'fundraising')),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT, -- 'games', 'yards', 'points', 'dollars'
  deadline DATE,
  is_achieved BOOLEAN DEFAULT false,
  reward_description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('helmet_sticker', 'medal', 'trophy', 'certificate')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'performance', 'leadership', 'academic', 'attendance'
  icon_name TEXT, -- Lucide icon name
  awarded_by UUID REFERENCES auth.users(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true
);

-- Helmet stickers (specific type of achievement)
CREATE TABLE helmet_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  sticker_type TEXT DEFAULT 'star' CHECK (sticker_type IN ('star', 'flame', 'lightning', 'crown', 'diamond')),
  game_id UUID, -- If earned during a specific game
  awarded_by UUID REFERENCES auth.users(id) NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FILE MANAGEMENT
-- =============================================================================

-- Team files (CSV uploads, images, documents)
CREATE TABLE team_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT NOT NULL, -- 'csv', 'image', 'pdf', 'video'
  file_size_bytes BIGINT,
  mime_type TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- GAME DATA (Future - for play calling analytics)
-- =============================================================================

-- Games and matchups
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  opponent_name TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  location TEXT,
  home_away TEXT CHECK (home_away IN ('home', 'away', 'neutral')),
  final_score_us INTEGER,
  final_score_them INTEGER,
  weather_conditions TEXT,
  game_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Play calls during games (for analytics)
CREATE TABLE play_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  play_id UUID REFERENCES plays(id) NOT NULL,
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  time_remaining INTERVAL,
  down INTEGER CHECK (down BETWEEN 1 AND 4),
  distance INTEGER,
  yard_line INTEGER CHECK (yard_line BETWEEN 1 AND 99),
  hash_mark TEXT CHECK (hash_mark IN ('left', 'middle', 'right')),
  result_yards INTEGER,
  result_type TEXT CHECK (result_type IN ('success', 'failure', 'turnover', 'touchdown', 'first_down')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User profile indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Team member indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Play indexes
CREATE INDEX idx_plays_playbook_id ON plays(playbook_id);
CREATE INDEX idx_plays_formation ON plays(formation);
CREATE INDEX idx_plays_p_type ON plays(p_type);
CREATE INDEX idx_plays_pref_down ON plays(pref_down);
CREATE INDEX idx_plays_pref_dis ON plays(pref_dis);

-- Social content indexes
CREATE INDEX idx_team_posts_team_id ON team_posts(team_id);
CREATE INDEX idx_team_posts_created_at ON team_posts(created_at DESC);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_calls ENABLE ROW LEVEL SECURITY;

-- Super Admins: Only super admins can view/manage other admins
CREATE POLICY "Super admins can view admins" ON super_admins
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE admin_level = 'super_admin')
  );

CREATE POLICY "Super admins can manage admins" ON super_admins
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM super_admins WHERE admin_level = 'super_admin')
  );

-- User profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teams: Only team members can see team data
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Team members: Can see other members of their teams
CREATE POLICY "Team members can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Playbooks: Team members can view, coaches can edit
CREATE POLICY "Team members can view playbooks" ON playbooks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Coaches can manage playbooks" ON playbooks
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('head_coach', 'coach')
      AND status = 'active'
    )
  );

-- Plays: Same as playbooks
CREATE POLICY "Team members can view plays" ON plays
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM playbooks p
      JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can manage plays" ON plays
  FOR ALL USING (
    playbook_id IN (
      SELECT p.id FROM playbooks p
      JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('head_coach', 'coach')
      AND tm.status = 'active'
    )
  );

-- Team posts: Team members can view, varying edit permissions
CREATE POLICY "Team members can view posts" ON team_posts
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create posts" ON team_posts
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND author_id = auth.uid()
  );

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbooks_updated_at BEFORE UPDATE ON playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plays_updated_at BEFORE UPDATE ON plays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_code IS NULL THEN
        NEW.team_code := UPPER(LEFT(REPLACE(NEW.name, ' ', ''), 4)) || 
                        TO_CHAR(EXTRACT(YEAR FROM NOW()), 'YY') ||
                        LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_team_code_trigger BEFORE INSERT ON teams
  FOR EACH ROW EXECUTE FUNCTION generate_team_code();

-- =============================================================================
-- SAMPLE DATA (Optional - for development)
-- =============================================================================

-- Sample team (uncomment to create test data)
/*
INSERT INTO teams (name, school_name, mascot, created_by) VALUES
('Varsity Football', 'Boxcall High School', 'Eagles', auth.uid());
*/
