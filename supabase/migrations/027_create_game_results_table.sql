-- Migration: 027 - Create Game Results Table
-- Purpose: Enable game result logging and tracking for teams
-- Date: September 23, 2025

-- Create game_results table for tracking match results
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent TEXT NOT NULL,
  site TEXT NOT NULL CHECK (site IN ('home', 'away', 'neutral')),
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_team_id ON public.game_results(team_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_date ON public.game_results(game_date);
CREATE INDEX IF NOT EXISTS idx_game_results_created_by ON public.game_results(created_by);

-- Enable RLS
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team members can view and create game results for their teams
CREATE POLICY "game_results_team_members_select" ON public.game_results
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = game_results.team_id
    )
  );

CREATE POLICY "game_results_team_members_insert" ON public.game_results
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = game_results.team_id
    )
  );

CREATE POLICY "game_results_team_members_update" ON public.game_results
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = game_results.team_id
    )
  );

CREATE POLICY "game_results_team_members_delete" ON public.game_results
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = game_results.team_id
    )
  );