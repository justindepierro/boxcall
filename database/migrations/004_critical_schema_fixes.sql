-- Migration 004: Critical Schema Fixes
-- Fix blocking issues identified in Database Audit
-- Phase 1 Foundation Architecture - Week 1

-- =====================================================
-- 🔥 CRITICAL FIX 1: Add missing calendar_events table
-- =====================================================
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
  
  -- Advanced features for Phase 3 services
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  color TEXT DEFAULT '#3B82F6', -- Hex color for calendar display
  is_all_day BOOLEAN DEFAULT false,
  reminder_minutes INTEGER DEFAULT 30,
  external_event_id TEXT, -- For integrations
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- 🔥 CRITICAL FIX 2: Align practice naming
-- Keep practice_scripts but add practice_schedules as expected by services
-- =====================================================
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
  
  -- Enhanced fields for service compatibility
  equipment_required TEXT[],
  coaching_notes TEXT,
  objectives TEXT[],
  evaluation_criteria TEXT,
  phase TEXT DEFAULT 'regular', -- 'preseason', 'regular', 'playoffs'
  intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10) DEFAULT 5,
  
  -- Performance tracking
  completion_status TEXT DEFAULT 'scheduled' CHECK (completion_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  attendance_count INTEGER DEFAULT 0,
  
  -- Integration fields
  calendar_event_id UUID REFERENCES calendar_events(id),
  external_id TEXT -- For external calendar integrations
);

-- =====================================================
-- 🔥 CRITICAL FIX 3: Add practice_attendance table
-- =====================================================
CREATE TABLE practice_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users
  attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  notes TEXT,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance tracking
  participation_level INTEGER CHECK (participation_level BETWEEN 1 AND 10),
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 10),
  coach_feedback TEXT,
  
  -- Unique constraint to prevent duplicate attendance records
  UNIQUE(practice_id, user_id)
);

-- =====================================================
-- 🔥 CRITICAL FIX 4: Add equipment table
-- =====================================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'balls', 'cones', 'pads', 'helmets', 'jerseys', etc.
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  location TEXT,
  purchase_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enhanced tracking
  serial_number TEXT,
  manufacturer TEXT,
  model TEXT,
  warranty_expires DATE,
  last_maintenance DATE,
  maintenance_schedule TEXT, -- 'weekly', 'monthly', 'seasonal', 'as_needed'
  
  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  assigned_to TEXT, -- Can be assigned to specific user/position
  checkout_status TEXT DEFAULT 'available' CHECK (checkout_status IN ('available', 'checked_out', 'maintenance', 'retired'))
);

-- =====================================================
-- 🔥 CRITICAL FIX 5: Add profiles table for auth integration
-- =====================================================
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- References auth.users.id
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'coach', 'assistant_coach', 'family', 'admin', 'trainer', 'manager')),
  bio TEXT,
  phone TEXT,
  email TEXT,
  display_name TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enhanced profile fields
  position TEXT, -- Football position for players
  jersey_number INTEGER,
  graduation_year INTEGER,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_notes TEXT,
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'team' CHECK (profile_visibility IN ('public', 'team', 'coaches_only', 'private')),
  allow_messaging BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  
  -- Performance tracking
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0
);

-- =====================================================
-- 🔥 CRITICAL FIX 6: Add team_members table for proper team associations
-- =====================================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users.id
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'coach', 'assistant_coach', 'manager', 'trainer', 'family')),
  position TEXT, -- Football position
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Permissions within team
  permissions JSONB DEFAULT '{}',
  can_edit_plays BOOLEAN DEFAULT false,
  can_manage_practices BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  
  -- Unique constraint for active memberships
  UNIQUE(team_id, user_id),
  UNIQUE(team_id, jersey_number) WHERE jersey_number IS NOT NULL AND is_active = true
);

-- =====================================================
-- 🔥 CRITICAL FIX 7: Add achievements table
-- =====================================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT, -- References auth.users.id, NULL for team achievements
  achievement_type TEXT NOT NULL, -- 'individual', 'team', 'milestone'
  title TEXT NOT NULL,
  description TEXT,
  criteria TEXT,
  points_value INTEGER DEFAULT 0,
  icon TEXT, -- Icon identifier
  color TEXT DEFAULT '#FFD700', -- Gold default
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validation
  awarded_by TEXT,
  verification_data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  
  -- Categories
  category TEXT DEFAULT 'general' CHECK (category IN ('performance', 'attendance', 'leadership', 'improvement', 'milestone', 'general')),
  difficulty TEXT DEFAULT 'bronze' CHECK (difficulty IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')),
  
  -- For repeatable achievements
  is_repeatable BOOLEAN DEFAULT false,
  max_times INTEGER DEFAULT 1
);

-- =====================================================
-- 🔥 CRITICAL FIX 8: Add helmet_stickers table
-- =====================================================
CREATE TABLE helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- References auth.users.id
  reason TEXT NOT NULL,
  description TEXT,
  sticker_type TEXT DEFAULT 'star' CHECK (sticker_type IN ('star', 'lightning', 'paw', 'custom')),
  color TEXT DEFAULT '#FFD700',
  awarded_by TEXT NOT NULL,
  game_id UUID, -- Optional reference to specific game
  practice_id UUID REFERENCES practice_schedules(id),
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Display properties
  position_x DECIMAL(5,2), -- X coordinate on helmet (0-100)
  position_y DECIMAL(5,2), -- Y coordinate on helmet (0-100)
  size INTEGER DEFAULT 1 CHECK (size BETWEEN 1 AND 3), -- 1=small, 2=medium, 3=large
  
  -- Validation
  is_visible BOOLEAN DEFAULT true,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
);

-- =====================================================
-- PERFORMANCE INDEXES for new tables
-- =====================================================

-- Calendar Events
CREATE INDEX idx_calendar_events_team_date_range 
  ON calendar_events(team_id, start_time) 
  WHERE status = 'confirmed';
CREATE INDEX idx_calendar_events_type_status 
  ON calendar_events(event_type, status, start_time);

-- Practice Schedules
CREATE INDEX idx_practice_schedules_team_date 
  ON practice_schedules(team_id, date_scheduled DESC);
CREATE INDEX idx_practice_schedules_status 
  ON practice_schedules(completion_status, date_scheduled);

-- Practice Attendance
CREATE INDEX idx_practice_attendance_practice 
  ON practice_attendance(practice_id, attendance_status);
CREATE INDEX idx_practice_attendance_user 
  ON practice_attendance(user_id, recorded_at DESC);

-- Equipment
CREATE INDEX idx_equipment_team_category 
  ON equipment(team_id, category) 
  WHERE is_active = true;
CREATE INDEX idx_equipment_checkout_status 
  ON equipment(checkout_status, team_id);

-- Profiles
CREATE INDEX idx_profiles_role 
  ON profiles(role) 
  WHERE is_active = true;
CREATE INDEX idx_profiles_last_activity 
  ON profiles(last_activity DESC) 
  WHERE is_active = true;

-- Team Members
CREATE INDEX idx_team_members_team_active 
  ON team_members(team_id, is_active) 
  WHERE is_active = true;
CREATE INDEX idx_team_members_user 
  ON team_members(user_id, is_active);

-- Achievements
CREATE INDEX idx_achievements_user_earned 
  ON achievements(user_id, earned_at DESC);
CREATE INDEX idx_achievements_team_category 
  ON achievements(team_id, category, earned_at DESC);

-- Helmet Stickers
CREATE INDEX idx_helmet_stickers_user_season 
  ON helmet_stickers(user_id, season_year DESC);
CREATE INDEX idx_helmet_stickers_team_visible 
  ON helmet_stickers(team_id, is_visible, awarded_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS for all new tables
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_stickers ENABLE ROW LEVEL SECURITY;

-- Temporary open policies for development (will be tightened in Phase 4)
CREATE POLICY "Enable read access for all users" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON calendar_events FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON practice_schedules FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON practice_schedules FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON practice_attendance FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON practice_attendance FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON equipment FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON equipment FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON profiles FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON team_members FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON achievements FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON achievements FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON helmet_stickers FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON helmet_stickers FOR ALL USING (true);

-- =====================================================
-- DATA MIGRATION & CLEANUP
-- =====================================================

-- If we decide to migrate practice_scripts to practice_schedules
-- (Optional - can be done in a future migration)
-- INSERT INTO practice_schedules (
--   team_id, title, description, date_scheduled, 
--   start_time, end_time, created_by, created_at, updated_at
-- )
-- SELECT 
--   team_id, name, description, date_planned,
--   '09:00:00'::TIME, '11:00:00'::TIME, created_by, created_at, updated_at
-- FROM practice_scripts;

-- =====================================================
-- MIGRATION VALIDATION QUERIES
-- =====================================================

-- Verify all critical tables exist
DO $$
BEGIN
  -- Check if all critical tables were created
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
    RAISE EXCEPTION 'Migration failed: calendar_events table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_schedules') THEN
    RAISE EXCEPTION 'Migration failed: practice_schedules table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practice_attendance') THEN
    RAISE EXCEPTION 'Migration failed: practice_attendance table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'equipment') THEN
    RAISE EXCEPTION 'Migration failed: equipment table not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Migration failed: profiles table not created';
  END IF;
  
  RAISE NOTICE 'Migration 004 completed successfully - All critical tables created';
END $$;
