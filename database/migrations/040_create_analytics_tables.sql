-- Migration: Create Analytics Tables
-- Implements practice execution tracking and aggregated analytics

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_executions_script_id ON public.practice_executions(practice_script_id);

-- Enable RLS
ALTER TABLE public.practice_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view practice executions for their teams" ON public.practice_executions
  FOR SELECT USING (
    practice_script_id IN (
      SELECT ps.id FROM public.practice_scripts ps
      JOIN public.team_members tm ON ps.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view practice analytics for their teams" ON public.practice_analytics
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Analytics tables migration completed successfully!';
  RAISE NOTICE 'Created tables: practice_executions, practice_analytics';
END $$;