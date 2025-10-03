-- Migration: Create Missing Core Tables for Phase 4 Analytics
-- This migration creates all the missing tables identified by database validation tests
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PLAYBOOK AND PLAYS TABLES
-- =============================================================================

-- Playbooks table (separates concerns from teams)
CREATE TABLE IF NOT EXISTS public.playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table (enhanced for performance and analytics)
CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE CASCADE,

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
  play_call TEXT,
  qb_read TEXT,
  hot TEXT,
  backfield TEXT,
  rb_track TEXT,
  fb_track TEXT,
  te_track TEXT,
  wr_track TEXT,
  ol_track TEXT,

  -- Analytics fields (existing rich data)
  duplicate_key TEXT,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_yards DECIMAL(5,2) DEFAULT 0.00,
  confidence_base DECIMAL(3,2) DEFAULT 0.50,
  complexity_score INTEGER DEFAULT 5 CHECK (complexity_score >= 1 AND complexity_score <= 10),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- GAME PLANNING TABLES (Brian Billick Methodology)
-- =============================================================================

-- Game plans enhanced table
CREATE TABLE IF NOT EXISTS public.game_plans_enhanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  opponent_team TEXT,
  game_date DATE,
  game_type TEXT DEFAULT 'regular' CHECK (game_type IN ('regular', 'playoff', 'scrimmage', 'practice')),
  week_number INTEGER,
  season TEXT,
  scouting_report JSONB DEFAULT '{}',
  weather_considerations JSONB DEFAULT '{}',
  key_matchups TEXT[],
  injury_considerations TEXT[],
  personnel_rotations JSONB DEFAULT '{}',
  coaching_points TEXT[],
  success_metrics JSONB DEFAULT '{}',
  preparation_status TEXT DEFAULT 'draft' CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready')),
  total_situations INTEGER DEFAULT 0,
  total_plays_assigned INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plan situations (Brian Billick categories)
CREATE TABLE IF NOT EXISTS public.game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES public.game_plans_enhanced(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('down_distance', 'field_position', 'game_situation', 'special_teams')),
  description TEXT,
  success_criteria TEXT,
  preferred_personnel TEXT,
  down_distance_range TEXT,
  field_position TEXT CHECK (field_position IN ('red_zone', 'goal_line', 'plus_territory', 'midfield', 'backed_up', 'any')),
  game_situation TEXT CHECK (game_situation IN ('two_minute', 'clock_management', 'fourth_down', 'short_yardage', 'normal', 'hurry_up')),
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  sequence_order INTEGER DEFAULT 0,
  total_plays_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plan plays assignments
CREATE TABLE IF NOT EXISTS public.game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES public.game_plans_enhanced(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES public.game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES public.plays(id) ON DELETE CASCADE,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  personnel_required TEXT,
  formation_strength TEXT CHECK (formation_strength IN ('strong_right', 'strong_left', 'weak_right', 'weak_left', 'balanced')),
  expected_coverage TEXT[],
  success_probability DECIMAL(3,2) DEFAULT 0.50,
  risk_level INTEGER DEFAULT 3 CHECK (risk_level >= 1 AND risk_level <= 5),
  coaching_notes TEXT,
  sequence_order INTEGER DEFAULT 0,
  is_scripted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plan analytics (performance tracking)
CREATE TABLE IF NOT EXISTS public.game_plan_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES public.game_plans_enhanced(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES public.game_plan_situations(id) ON DELETE SET NULL,
  play_id UUID REFERENCES public.plays(id) ON DELETE SET NULL,
  execution_time TIMESTAMPTZ DEFAULT NOW(),
  game_context JSONB DEFAULT '{}',
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'partial_success', 'failure', 'penalty', 'turnover')),
  yards_gained DECIMAL(5,2),
  execution_quality INTEGER CHECK (execution_quality >= 1 AND execution_quality <= 10),
  coaching_assessment TEXT,
  adjustments_made TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PRACTICE MANAGEMENT TABLES
-- =============================================================================

-- Practice scripts table
CREATE TABLE IF NOT EXISTS public.practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  practice_date DATE,
  duration_minutes INTEGER DEFAULT 120,
  focus_areas TEXT[],
  objectives TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice script plays (drills and segments)
CREATE TABLE IF NOT EXISTS public.practice_script_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_script_id UUID REFERENCES public.practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES public.plays(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL,
  segment_type TEXT DEFAULT 'drill' CHECK (segment_type IN ('warmup', 'drill', 'scrimmage', 'conditioning')),
  duration_minutes INTEGER DEFAULT 10,
  repetitions INTEGER DEFAULT 5,
  coaching_points TEXT[],
  sequence_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CALENDAR AND SCHEDULING TABLES
-- =============================================================================

-- Calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'practice' CHECK (event_type IN ('practice', 'game', 'meeting', 'travel', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  opponent TEXT,
  is_home BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true,
  rsvp_deadline TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice schedules table
CREATE TABLE IF NOT EXISTS public.practice_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  focus_areas TEXT[],
  special_notes TEXT,
  weather_considerations TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice attendance table
CREATE TABLE IF NOT EXISTS public.practice_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_schedule_id UUID REFERENCES public.practice_schedules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'present' CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_schedule_id, user_id)
);

-- =============================================================================
-- EQUIPMENT MANAGEMENT TABLES
-- =============================================================================

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('balls', 'pads', 'helmets', 'uniforms', 'training', 'medical', 'other')),
  description TEXT,
  quantity_total INTEGER DEFAULT 1,
  quantity_available INTEGER DEFAULT 1,
  condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  purchase_date DATE,
  last_inspected DATE,
  assigned_to UUID REFERENCES auth.users(id),
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACHIEVEMENTS AND RECOGNITION TABLES
-- =============================================================================

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('play_execution', 'attendance', 'improvement', 'leadership', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 10,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  earned_date DATE DEFAULT CURRENT_DATE,
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helmet stickers table
CREATE TABLE IF NOT EXISTS public.helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL CHECK (sticker_type IN ('star', 'lightning', 'flame', 'crown', 'trophy')),
  position TEXT NOT NULL, -- x,y coordinates or named position
  earned_date DATE DEFAULT CURRENT_DATE,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Practice executions table (for analytics)
CREATE TABLE IF NOT EXISTS public.practice_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_script_id UUID REFERENCES public.practice_scripts(id) ON DELETE CASCADE,
  play_id UUID REFERENCES public.plays(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_time TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  yards_gained DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice analytics table (aggregated data)
CREATE TABLE IF NOT EXISTS public.practice_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  total_plays INTEGER DEFAULT 0,
  successful_plays INTEGER DEFAULT 0,
  total_yards DECIMAL(7,2) DEFAULT 0,
  avg_execution_time DECIMAL(5,2),
  top_performers JSONB DEFAULT '[]',
  focus_area_performance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Playbook indexes
CREATE INDEX IF NOT EXISTS idx_playbooks_team_id ON public.playbooks(team_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_active ON public.playbooks(is_active) WHERE is_active = true;

-- Plays indexes
CREATE INDEX IF NOT EXISTS idx_plays_playbook_id ON public.plays(playbook_id);
CREATE INDEX IF NOT EXISTS idx_plays_duplicate_key ON public.plays(duplicate_key);
CREATE INDEX IF NOT EXISTS idx_plays_p_type ON public.plays(p_type);
CREATE INDEX IF NOT EXISTS idx_plays_success_rate ON public.plays(success_rate);

-- Game planning indexes
CREATE INDEX IF NOT EXISTS idx_game_plans_team_id ON public.game_plans_enhanced(team_id);
CREATE INDEX IF NOT EXISTS idx_game_plans_date ON public.game_plans_enhanced(game_date);
CREATE INDEX IF NOT EXISTS idx_game_plan_situations_game_plan_id ON public.game_plan_situations(game_plan_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_game_plan_id ON public.game_plan_plays(game_plan_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_situation_id ON public.game_plan_plays(situation_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_analytics_game_plan_id ON public.game_plan_analytics(game_plan_id);

-- Practice indexes
CREATE INDEX IF NOT EXISTS idx_practice_scripts_team_id ON public.practice_scripts(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script_id ON public.practice_script_plays(practice_script_id);
CREATE INDEX IF NOT EXISTS idx_practice_executions_script_id ON public.practice_executions(practice_script_id);

-- Calendar indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_id ON public.calendar_events(team_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_practice_schedules_team_id ON public.practice_schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_schedules_date ON public.practice_schedules(practice_date);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_team_id ON public.equipment(team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);

-- Recognition indexes
CREATE INDEX IF NOT EXISTS idx_achievements_team_id ON public.achievements(team_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_helmet_stickers_team_id ON public.helmet_stickers(team_id);
CREATE INDEX IF NOT EXISTS idx_helmet_stickers_user_id ON public.helmet_stickers(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plans_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_script_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helmet_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_analytics ENABLE ROW LEVEL SECURITY;

-- Playbooks policies
DROP POLICY IF EXISTS "Users can view playbooks for their teams" ON public.playbooks;
DROP POLICY IF EXISTS "Users can insert playbooks for their teams" ON public.playbooks;
DROP POLICY IF EXISTS "Users can update playbooks for their teams" ON public.playbooks;

CREATE POLICY "Users can view playbooks for their teams" ON public.playbooks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert playbooks for their teams" ON public.playbooks
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update playbooks for their teams" ON public.playbooks
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Plays policies
DROP POLICY IF EXISTS "Users can view plays for their team playbooks" ON public.plays;
DROP POLICY IF EXISTS "Users can insert plays for their team playbooks" ON public.plays;
DROP POLICY IF EXISTS "Users can update plays for their team playbooks" ON public.plays;

CREATE POLICY "Users can view plays for their team playbooks" ON public.plays
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM public.playbooks p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert plays for their team playbooks" ON public.plays
  FOR INSERT WITH CHECK (
    playbook_id IN (
      SELECT p.id FROM public.playbooks p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update plays for their team playbooks" ON public.plays
  FOR UPDATE USING (
    playbook_id IN (
      SELECT p.id FROM public.playbooks p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Game planning policies (similar pattern for all game planning tables)
DROP POLICY IF EXISTS "Users can view game plans for their teams" ON public.game_plans_enhanced;
DROP POLICY IF EXISTS "Users can insert game plans for their teams" ON public.game_plans_enhanced;

CREATE POLICY "Users can view game plans for their teams" ON public.game_plans_enhanced
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert game plans for their teams" ON public.game_plans_enhanced
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Practice policies
DROP POLICY IF EXISTS "Users can view practice scripts for their teams" ON public.practice_scripts;

CREATE POLICY "Users can view practice scripts for their teams" ON public.practice_scripts
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Calendar policies
DROP POLICY IF EXISTS "Users can view calendar events for their teams" ON public.calendar_events;

CREATE POLICY "Users can view calendar events for their teams" ON public.calendar_events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Equipment policies
DROP POLICY IF EXISTS "Users can view equipment for their teams" ON public.equipment;

CREATE POLICY "Users can view equipment for their teams" ON public.equipment
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Recognition policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can view their own helmet stickers" ON public.helmet_stickers;

CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own helmet stickers" ON public.helmet_stickers
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Analytics policies (read-only for most users, write for coaches)
DROP POLICY IF EXISTS "Users can view practice executions for their teams" ON public.practice_executions;
DROP POLICY IF EXISTS "Users can view practice analytics for their teams" ON public.practice_analytics;

CREATE POLICY "Users can view practice executions for their teams" ON public.practice_executions
  FOR SELECT USING (
    practice_script_id IN (
      SELECT ps.id FROM public.practice_scripts ps
      JOIN public.team_members tm ON ps.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view practice analytics for their teams" ON public.practice_analytics
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Created all missing core tables for Phase 4 analytics';
  RAISE NOTICE 'Tables created: playbooks, plays, game_plans_enhanced, game_plan_situations,';
  RAISE NOTICE '                 game_plan_plays, game_plan_analytics, practice_scripts,';
  RAISE NOTICE '                 practice_script_plays, calendar_events, practice_schedules,';
  RAISE NOTICE '                 practice_attendance, equipment, achievements, helmet_stickers,';
  RAISE NOTICE '                 practice_executions, practice_analytics';
  RAISE NOTICE 'RLS policies and indexes have been configured';
END $$;