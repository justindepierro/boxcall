-- Migration: 021_create_team_members_table.sql
-- Purpose: Create the team_members table required for team-based access control
-- Date: September 23, 2025

-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view team membership, team members can manage their team
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
    )
  );

CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_members.team_id AND role IN ('head_coach', 'manager')
    )
  );

CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_members.team_id AND role IN ('head_coach', 'manager')
    )
  );

CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = team_members.team_id AND role IN ('head_coach', 'manager')
    )
  );