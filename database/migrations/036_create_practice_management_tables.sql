-- Migration: Create Practice Management Tables
-- Implements practice scripts and drill management

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_scripts_team_id ON public.practice_scripts(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script_id ON public.practice_script_plays(practice_script_id);

-- Enable RLS
ALTER TABLE public.practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_script_plays ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view practice scripts for their teams" ON public.practice_scripts
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Practice management tables migration completed successfully!';
  RAISE NOTICE 'Created tables: practice_scripts, practice_script_plays';
END $$;