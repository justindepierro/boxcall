-- Migration: Create Recognition System Tables
-- Implements achievements and helmet stickers for player recognition

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('play_execution', 'attendance', 'improvement', 'leadership', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 10,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  earned_date DATE DEFAULT CURRENT_DATE,
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helmet stickers table
CREATE TABLE IF NOT EXISTS public.helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL CHECK (sticker_type IN ('star', 'lightning', 'flame', 'crown', 'trophy')),
  position TEXT NOT NULL, -- x,y coordinates or named position
  earned_date DATE DEFAULT CURRENT_DATE,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_team_id ON public.achievements(team_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_helmet_stickers_team_id ON public.helmet_stickers(team_id);
CREATE INDEX IF NOT EXISTS idx_helmet_stickers_user_id ON public.helmet_stickers(user_id);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helmet_stickers ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view their own helmet stickers" ON public.helmet_stickers
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Recognition system tables migration completed successfully!';
  RAISE NOTICE 'Created tables: achievements, helmet_stickers';
END $$;