-- BoxCall Production Database Schema
-- Generated for 300+ play stress testing

-- Teams table (existing, enhanced)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance optimization
  play_count INTEGER DEFAULT 0,
  last_backup_at TIMESTAMPTZ,
  backup_version INTEGER DEFAULT 1
);

-- Playbooks table (new - separates concerns)
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Performance indexes
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table (enhanced for performance)
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Core play data
  formation TEXT NOT NULL,
  play_name TEXT NOT NULL,
  one_word_play TEXT,
  p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
  
  -- Formation details
  personnel TEXT,
  f_type TEXT,
  f_dir TEXT,
  
  -- Play details
  protection TEXT,
  p_dir TEXT,
  r_str TEXT,
  p_str TEXT,
  
  -- Preferences
  pref_down TEXT,
  pref_dis TEXT,
  pref_hash TEXT,
  pref_cov TEXT,
  pref_front TEXT,
  
  -- Tags and categorization
  ftag1 TEXT,
  ftag2 TEXT,
  p_tag1 TEXT,
  p_tag2 TEXT,
  
  -- Additional data
  back_align TEXT,
  shift TEXT,
  motion TEXT,
  key_player1 TEXT,
  key_player2 TEXT,
  check_into TEXT,
  notes TEXT,
  
  -- Performance metrics
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance optimization
  is_archived BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  complexity_score INTEGER,
  
  -- Full-text search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(play_name, '') || ' ' || 
      COALESCE(formation, '') || ' ' || 
      COALESCE(p_type, '') || ' ' ||
      COALESCE(notes, '')
    )
  ) STORED
);

-- Practice Scripts table (new)
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date_planned DATE,
  total_duration INTEGER, -- in minutes
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  -- Performance optimization
  play_count INTEGER DEFAULT 0
);

-- Practice Script Plays (junction table with ordering)
CREATE TABLE practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  repetitions INTEGER DEFAULT 1,
  estimated_time INTEGER DEFAULT 4, -- in minutes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(script_id, order_number)
);

-- Game Plans table (new)
CREATE TABLE game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  -- Performance optimization
  total_plays INTEGER DEFAULT 0
);

-- Game Plan Situations (Brian Billick methodology)
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "1st & 10", "Red Zone", etc.
  description TEXT,
  category TEXT NOT NULL, -- "down_distance", "red_zone", "special"
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Plan Plays (junction with situational context)
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5), -- 1=primary, 5=check-down
  notes TEXT,
  times_used INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, play_id)
);

-- PERFORMANCE INDEXES
-- Full-text search optimization
CREATE INDEX idx_plays_search ON plays USING GIN(search_vector);

-- Common query patterns
CREATE INDEX idx_plays_playbook_type ON plays(playbook_id, p_type) WHERE is_archived = false;
CREATE INDEX idx_plays_formation ON plays(formation) WHERE is_archived = false;
CREATE INDEX idx_plays_updated ON plays(updated_at DESC);

-- Practice script optimization
CREATE INDEX idx_practice_scripts_team_date ON practice_scripts(team_id, date_planned DESC);
CREATE INDEX idx_script_plays_order ON practice_script_plays(script_id, order_number);

-- Game plan optimization
CREATE INDEX idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX idx_situation_plays_priority ON game_plan_plays(situation_id, priority);

-- =====================================================
-- CRITICAL TABLES - PHASE 1 FOUNDATION FIXES
-- =====================================================

-- Calendar Events table (required by Phase 3 services)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('practice', 'game', 'meeting', 'event')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RFC5545 RRULE format
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance optimization
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  attendee_count INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  color TEXT DEFAULT '#3B82F6',
  is_all_day BOOLEAN DEFAULT false,
  reminder_minutes INTEGER DEFAULT 30,
  metadata JSONB DEFAULT '{}'
);

-- Practice Schedules table (required by practiceService.ts)
CREATE TABLE practice_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_scheduled DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  field_type TEXT,
  weather_conditions TEXT,
  total_duration INTEGER, -- minutes
  created_by TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Service compatibility fields
  equipment_required TEXT[],
  coaching_notes TEXT,
  objectives TEXT[],
  completion_status TEXT DEFAULT 'scheduled' CHECK (completion_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  calendar_event_id UUID REFERENCES calendar_events(id)
);

-- Practice Attendance table (required by practiceService.ts)
CREATE TABLE practice_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users
  attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
  arrival_time TIMESTAMPTZ,
  notes TEXT,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(practice_id, user_id)
);

-- Equipment table (required by practiceService.ts)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  location TEXT,
  purchase_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  is_active BOOLEAN DEFAULT true,
  checkout_status TEXT DEFAULT 'available' CHECK (checkout_status IN ('available', 'checked_out', 'maintenance'))
);

-- Profiles table (required by dashboardService.ts)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- References auth.users.id
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'coach', 'assistant_coach', 'family', 'admin')),
  bio TEXT,
  phone TEXT,
  email TEXT,
  display_name TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enhanced fields
  position TEXT,
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'
);

-- Team Members table (proper team associations)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users.id
  role TEXT NOT NULL DEFAULT 'player',
  position TEXT,
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, user_id)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT, -- References auth.users.id
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points_value INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helmet Stickers table
CREATE TABLE helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users.id
  reason TEXT NOT NULL,
  description TEXT,
  awarded_by TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  
  color TEXT DEFAULT '#FFD700',
  is_visible BOOLEAN DEFAULT true
);

-- PERFORMANCE INDEXES FOR CRITICAL TABLES
CREATE INDEX idx_calendar_events_team_date ON calendar_events(team_id, start_time);
CREATE INDEX idx_practice_schedules_team_date ON practice_schedules(team_id, date_scheduled DESC);
CREATE INDEX idx_practice_attendance_practice ON practice_attendance(practice_id, attendance_status);
CREATE INDEX idx_equipment_team_category ON equipment(team_id, category) WHERE is_active = true;
CREATE INDEX idx_profiles_role ON profiles(role) WHERE is_active = true;
CREATE INDEX idx_team_members_team_active ON team_members(team_id, is_active) WHERE is_active = true;

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_stickers ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced based on auth system)
CREATE POLICY "Enable read access for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON playbooks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON plays FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_scripts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON game_plans FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_schedules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON practice_attendance FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON equipment FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON achievements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON helmet_stickers FOR SELECT USING (true);

-- Enable insert/update for authenticated users (temporary for development)
CREATE POLICY "Enable write access for all users" ON teams FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON playbooks FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON plays FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_scripts FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plans FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_script_plays FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plan_situations FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON game_plan_plays FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON calendar_events FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_schedules FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON practice_attendance FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON equipment FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON profiles FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON team_members FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON achievements FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON helmet_stickers FOR ALL USING (true);
