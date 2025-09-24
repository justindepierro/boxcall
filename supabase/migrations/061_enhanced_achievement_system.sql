-- =====================================================
-- ACHIEVEMENT SYSTEM ENHANCEMENT
-- Xbox-style achievements for BoxCall
-- Migration: 061 - Enhanced Achievement System
-- Date: September 24, 2025
-- =====================================================

-- Create achievement definitions table
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('gameplay', 'social', 'teamwork', 'leadership', 'milestone', 'special')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('action_count', 'streak', 'milestone', 'special')),
  trigger_target TEXT NOT NULL, -- e.g., 'play_created', 'post_sent', 'game_won'
  trigger_count INTEGER, -- how many times the action needs to be performed
  points INTEGER NOT NULL DEFAULT 10,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievement progress table for partial progress
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, achievement_id)
);

-- Update achievements table to reference definitions
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS definition_id UUID REFERENCES achievement_definitions(id),
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions (readable by all team members)
CREATE POLICY "Team members can view achievement definitions" ON achievement_definitions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can manage achievement definitions" ON achievement_definitions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);

-- RLS Policies for achievement_progress
CREATE POLICY "Users can view their own progress" ON achievement_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_players tp
    JOIN team_members tm ON tp.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()
    AND tp.id = achievement_progress.player_id
  )
);

CREATE POLICY "Coaches can manage progress" ON achievement_progress
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN team_players tp ON tm.team_id = tp.team_id
    WHERE tm.user_id = auth.uid()
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND tp.id = achievement_progress.player_id
  )
);

-- Insert some default achievements
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity) VALUES
-- Gameplay achievements
('First Play', 'Create your first play in BoxCall', 'football', 'gameplay', 'action_count', 'play_created', 1, 10, 'common'),
('Playbook Builder', 'Create 10 plays for your team', 'book', 'gameplay', 'action_count', 'play_created', 10, 25, 'uncommon'),
('Master Strategist', 'Create 50 plays for your team', 'crown', 'gameplay', 'action_count', 'play_created', 50, 100, 'rare'),

-- Social achievements  
('Team Communicator', 'Send your first team post', 'message-circle', 'social', 'action_count', 'post_sent', 1, 10, 'common'),
('Social Butterfly', 'Send 25 team posts', 'users', 'social', 'action_count', 'post_sent', 25, 50, 'uncommon'),
('Team Captain', 'Send 100 team posts', 'star', 'social', 'action_count', 'post_sent', 100, 150, 'epic'),

-- Teamwork achievements
('Roster Ready', 'Add your first player to the roster', 'user-plus', 'teamwork', 'action_count', 'player_added', 1, 15, 'common'),
('Team Builder', 'Add 10 players to your roster', 'users', 'teamwork', 'action_count', 'player_added', 10, 40, 'uncommon'),
('Squad Leader', 'Add 25 players to your roster', 'shield', 'teamwork', 'action_count', 'player_added', 25, 75, 'rare'),

-- Leadership achievements
('First Victory', 'Win your first game', 'trophy', 'leadership', 'action_count', 'game_won', 1, 50, 'uncommon'),
('Undefeated', 'Win 5 games in a row', 'zap', 'leadership', 'streak', 'game_won_streak', 5, 200, 'epic'),
('Champion', 'Win 10 games', 'crown', 'leadership', 'action_count', 'game_won', 10, 300, 'legendary'),

-- Milestone achievements
('Century Club', 'Reach 100 total achievement points', 'target', 'milestone', 'special', 'points_milestone', 100, 100, 'rare'),
('Achievement Hunter', 'Earn 25 different achievements', 'award', 'milestone', 'special', 'achievements_earned', 25, 250, 'epic'),
('BoxCall Legend', 'Earn 50 different achievements', 'gem', 'milestone', 'special', 'achievements_earned', 50, 500, 'legendary');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievement_progress_player ON achievement_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_completed ON achievement_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_active ON achievement_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category ON achievement_definitions(category);
