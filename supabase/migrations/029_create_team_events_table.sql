-- Migration: 029 - Create Team Events Table
-- Purpose: Enable team event management and scheduling
-- Date: September 23, 2025

-- Create team_events table for team event management
CREATE TABLE IF NOT EXISTS public.team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('practice', 'game', 'meeting', 'tournament', 'other')),
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_events_team_id ON public.team_events(team_id);
CREATE INDEX IF NOT EXISTS idx_team_events_starts_at ON public.team_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_team_events_created_by ON public.team_events(created_by);
CREATE INDEX IF NOT EXISTS idx_team_events_event_type ON public.team_events(event_type);

-- Enable RLS
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team members can view and manage events for their teams
CREATE POLICY "team_events_team_members_select" ON public.team_events
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_events.team_id
    )
  );

CREATE POLICY "team_events_team_members_insert" ON public.team_events
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_events.team_id
    )
  );

CREATE POLICY "team_events_team_members_update" ON public.team_events
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_events.team_id
    )
  );

CREATE POLICY "team_events_team_members_delete" ON public.team_events
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_events.team_id
    )
  );