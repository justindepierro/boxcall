-- Migration: Create Calendar and Scheduling Tables
-- Implements event management and practice scheduling

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_team_id ON public.calendar_events(team_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_practice_schedules_team_id ON public.practice_schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_schedules_date ON public.practice_schedules(practice_date);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attendance ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view calendar events for their teams" ON public.calendar_events
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Calendar and scheduling tables migration completed successfully!';
  RAISE NOTICE 'Created tables: calendar_events, practice_schedules, practice_attendance';
END $$;