-- ============================================================================
-- BOXCALL DATABASE CLEANUP & MISSING TABLES
-- ============================================================================
-- This migration adds missing tables that are referenced in code but don't exist
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SECTION 1: GAMES TABLE (Schedule/Results)
-- ============================================================================

-- Drop existing games table if it exists with wrong schema
DROP TABLE IF EXISTS games CASCADE;

-- Games table (team schedule and results)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  location TEXT,
  is_home_game BOOLEAN DEFAULT true,
  game_type TEXT DEFAULT 'regular' CHECK (game_type IN ('regular', 'playoff', 'scrimmage', 'jamboree')),
  our_score INTEGER,
  opponent_score INTEGER,
  result TEXT CHECK (result IN ('win', 'loss', 'tie', 'pending', 'cancelled')),
  notes TEXT,
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: EXECUTION TRACKING SYSTEM (for BoxCall Live)
-- ============================================================================

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS play_executions CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;

-- Practice Sessions table
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  practice_script_id UUID REFERENCES practice_scripts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'practice' CHECK (session_type IN ('practice', 'walkthrough', 'film')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_reps INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions table  
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE SET NULL,
  opponent_name TEXT,
  game_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'halftime', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  is_home_team BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play Executions table (tracks individual play calls during sessions)
CREATE TABLE play_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id UUID, -- Can reference practice_sessions or game_sessions
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'game')),
  play_id UUID REFERENCES plays(id) ON DELETE SET NULL,
  play_name TEXT NOT NULL,
  formation TEXT,
  personnel TEXT,
  situation TEXT, -- e.g., "1st & 10", "Red Zone", etc.
  result TEXT CHECK (result IN ('success', 'incomplete', 'turnover', 'penalty', 'other')),
  yards_gained INTEGER,
  notes TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: ACHIEVEMENT SYSTEM
-- ============================================================================

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS achievement_progress CASCADE;
DROP TABLE IF EXISTS achievement_definitions CASCADE;

-- Achievement Definitions (admin-defined achievements)
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- NULL = global achievement
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'practice', 'game', 'social', 'milestone')),
  points INTEGER DEFAULT 10,
  criteria JSONB DEFAULT '{}', -- Flexible criteria for auto-awarding
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement Progress (tracks user progress toward achievements)
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  target_value INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- SECTION 3: SOCIAL/ACTIVITY SYSTEM
-- ============================================================================

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;

-- Activity Feed (aggregated activity for dashboard)
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('play_created', 'play_updated', 'game_plan_created', 'practice_completed', 'achievement_earned', 'comment', 'reaction', 'announcement')),
  entity_type TEXT, -- 'play', 'game_plan', 'practice_script', etc.
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table (user follows)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Generic Reactions table (for posts, comments, etc.)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'post', 'comment', 'announcement'
  entity_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'celebrate', 'football', 'target', 'hundred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id, reaction_type)
);

-- Generic Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'post', 'play', 'game_plan'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: STORAGE/AVATARS
-- ============================================================================

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS avatars CASCADE;

-- Avatars table (tracks uploaded avatars)
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, is_active) -- Only one active avatar per user
);

-- ============================================================================
-- SECTION 5: ACTIVITIES TABLE (General activity log)
-- ============================================================================

-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS activities CASCADE;

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "games_select" ON games
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "games_insert" ON games
  FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "games_update" ON games
  FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "games_delete" ON games
  FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Practice Sessions policies
CREATE POLICY "practice_sessions_select" ON practice_sessions
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "practice_sessions_insert" ON practice_sessions
  FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "practice_sessions_update" ON practice_sessions
  FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Game Sessions policies
CREATE POLICY "game_sessions_select" ON game_sessions
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "game_sessions_insert" ON game_sessions
  FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "game_sessions_update" ON game_sessions
  FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Play Executions policies
CREATE POLICY "play_executions_select" ON play_executions
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "play_executions_insert" ON play_executions
  FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));

-- Achievement Definitions policies (global or team-specific)
CREATE POLICY "achievement_definitions_select" ON achievement_definitions
  FOR SELECT USING (team_id IS NULL OR team_id IN (SELECT public.get_my_team_ids()));

-- Achievement Progress policies
CREATE POLICY "achievement_progress_select" ON achievement_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "achievement_progress_insert" ON achievement_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievement_progress_update" ON achievement_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Activity Feed policies
CREATE POLICY "activity_feed_select" ON activity_feed
  FOR SELECT USING (
    user_id = auth.uid() 
    OR team_id IN (SELECT public.get_my_team_ids())
  );

-- Follows policies
CREATE POLICY "follows_select" ON follows
  FOR SELECT USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "follows_insert" ON follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "follows_delete" ON follows
  FOR DELETE USING (follower_id = auth.uid());

-- Reactions policies
CREATE POLICY "reactions_select" ON reactions
  FOR SELECT USING (true); -- Public read for reaction counts

CREATE POLICY "reactions_insert" ON reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete" ON reactions
  FOR DELETE USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (true); -- Public read for comments

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_update" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Avatars policies
CREATE POLICY "avatars_select" ON avatars
  FOR SELECT USING (true); -- Public read for avatars

CREATE POLICY "avatars_insert" ON avatars
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "avatars_update" ON avatars
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "avatars_delete" ON avatars
  FOR DELETE USING (user_id = auth.uid());

-- Activities policies
CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (
    user_id = auth.uid() 
    OR team_id IN (SELECT public.get_my_team_ids())
  );

CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR team_id IN (SELECT public.get_my_team_ids())
  );

-- ============================================================================
-- SECTION 7: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_games_team_id ON games(team_id);
CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_team_id ON practice_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_team_id ON game_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_play_executions_team_id ON play_executions(team_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_session_id ON play_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_play_id ON play_executions(play_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_team_id ON activity_feed(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_entity ON reactions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'SUCCESS: Missing tables created with RLS policies!' as result;
