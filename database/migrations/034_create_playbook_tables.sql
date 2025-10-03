-- Migration: Create Playbook and Plays Tables
-- Creates the core playbook management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_playbooks_team_id ON public.playbooks(team_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_active ON public.playbooks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_plays_playbook_id ON public.plays(playbook_id);
CREATE INDEX IF NOT EXISTS idx_plays_duplicate_key ON public.plays(duplicate_key);
CREATE INDEX IF NOT EXISTS idx_plays_p_type ON public.plays(p_type);
CREATE INDEX IF NOT EXISTS idx_plays_success_rate ON public.plays(success_rate);

-- Enable RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced later)
CREATE POLICY IF NOT EXISTS "Users can view playbooks for their teams" ON public.playbooks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view plays for their team playbooks" ON public.plays
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM public.playbooks p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Playbook tables migration completed successfully!';
  RAISE NOTICE 'Created tables: playbooks, plays';
END $$;