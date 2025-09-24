-- Migration: 030 - Create Practice Templates Table
-- Purpose: Enable reusable practice template creation and sharing
-- Date: September 23, 2025

-- Create practice_templates table for reusable practice plans
CREATE TABLE IF NOT EXISTS public.practice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- total template duration in minutes
  blocks JSONB DEFAULT '[]'::jsonb, -- array of practice blocks
  default_location TEXT,
  default_field_type TEXT CHECK (default_field_type IN ('indoor', 'outdoor', 'gym', 'field')),
  equipment_required TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false, -- can be shared with other teams
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_templates_team_id ON public.practice_templates(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_templates_created_by ON public.practice_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_practice_templates_is_public ON public.practice_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_practice_templates_name ON public.practice_templates(name);

-- Enable RLS
ALTER TABLE public.practice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team members can view templates for their team, public templates are viewable by all
CREATE POLICY "practice_templates_team_members_select" ON public.practice_templates
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = practice_templates.team_id
    ) OR is_public = true
  );

CREATE POLICY "practice_templates_team_members_insert" ON public.practice_templates
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = practice_templates.team_id
    )
  );

CREATE POLICY "practice_templates_team_members_update" ON public.practice_templates
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = practice_templates.team_id
    )
  );

CREATE POLICY "practice_templates_team_members_delete" ON public.practice_templates
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members
      WHERE team_id = practice_templates.team_id
    )
  );