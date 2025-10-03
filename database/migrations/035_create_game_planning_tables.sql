-- Migration: Create Game Planning Tables
-- Implements Brian Billick methodology for game planning

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_plans_team_id ON public.game_plans_enhanced(team_id);
CREATE INDEX IF NOT EXISTS idx_game_plans_date ON public.game_plans_enhanced(game_date);
CREATE INDEX IF NOT EXISTS idx_game_plan_situations_game_plan_id ON public.game_plan_situations(game_plan_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_game_plan_id ON public.game_plan_plays(game_plan_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_situation_id ON public.game_plan_plays(situation_id);
CREATE INDEX IF NOT EXISTS idx_game_plan_analytics_game_plan_id ON public.game_plan_analytics(game_plan_id);

-- Enable RLS
ALTER TABLE public.game_plans_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_plan_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view game plans for their teams" ON public.game_plans_enhanced
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Game planning tables migration completed successfully!';
  RAISE NOTICE 'Created tables: game_plans_enhanced, game_plan_situations, game_plan_plays, game_plan_analytics';
END $$;