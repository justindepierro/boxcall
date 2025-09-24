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
  team_role TEXT NOT NULL CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach')),
  capabilities JSONB DEFAULT '{
    "can_manage_team": false,
    "can_manage_games": false,
    "can_manage_social": false,
    "can_manage_players": false,
    "can_view_analytics": false,
    "can_manage_playbook": false,
    "can_manage_practice": false,
    "can_manage_equipment": false
  }',
  role_notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  UNIQUE(team_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(team_role);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "team_members_service_role" ON public.team_members
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view team members for teams they belong to
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Users can manage their own membership
CREATE POLICY "team_members_self_manage" ON public.team_members
  FOR ALL USING (user_id = auth.uid());

-- Team coaches can manage team members
CREATE POLICY "team_members_coach_manage" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );