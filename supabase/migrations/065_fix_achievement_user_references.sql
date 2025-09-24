-- Fix achievement system to reference users instead of team_players
-- Migration: 065 - Fix Achievement User References

-- Drop existing tables if they exist
DROP TABLE IF EXISTS achievement_progress CASCADE;
DROP TABLE IF EXISTS achievement_definitions CASCADE;

-- Create achievement definitions table
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('gameplay', 'social', 'teamwork', 'leadership', 'milestone', 'special')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('action_count', 'streak', 'milestone', 'special')),
  trigger_target TEXT NOT NULL,
  trigger_count INTEGER,
  points INTEGER NOT NULL DEFAULT 10,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievement progress table for partial progress
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on new tables
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions (readable by authenticated users)
CREATE POLICY "Authenticated users can view achievement definitions" ON achievement_definitions
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage achievement definitions" ON achievement_definitions
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for achievement_progress
CREATE POLICY "Users can view their own progress" ON achievement_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON achievement_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage progress" ON achievement_progress
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_completed ON achievement_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_active ON achievement_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category ON achievement_definitions(category);