-- =============================================================================
-- MIGRATION 007 STEP 1: PLAYER PERFORMANCE TRACKING
-- Individual player statistics and performance evaluation
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PLAYER PERFORMANCE TRACKING - Individual Statistics and Progress
-- =============================================================================

CREATE TABLE player_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Performance Context
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'practice', 'game', 'drill', 'conditioning', 'evaluation'
  )),
  activity_id UUID, -- References practice_schedules, games, etc.
  
  -- Position and Role
  position_played TEXT NOT NULL, -- 'QB', 'RB', 'WR', 'TE', 'OL', etc.
  role_in_activity TEXT, -- 'starter', 'backup', 'special_teams', 'scout'
  
  -- Basic Performance Metrics
  snaps_played INTEGER DEFAULT 0 CHECK (snaps_played >= 0),
  plays_executed INTEGER DEFAULT 0 CHECK (plays_executed >= 0),
  successful_plays INTEGER DEFAULT 0 CHECK (successful_plays >= 0),
  
  -- Position-Specific Statistics (stored as JSONB for flexibility)
  passing_stats JSONB DEFAULT '{}', -- completions, attempts, yards, TDs, INTs
  rushing_stats JSONB DEFAULT '{}', -- attempts, yards, TDs, fumbles
  receiving_stats JSONB DEFAULT '{}', -- receptions, targets, yards, TDs, drops  
  defensive_stats JSONB DEFAULT '{}', -- tackles, assists, sacks, INTs, PBUs
  special_teams_stats JSONB DEFAULT '{}', -- returns, coverage, blocks
  
  -- Performance Ratings (1-10 scale)
  technique_rating INTEGER CHECK (technique_rating BETWEEN 1 AND 10),
  effort_rating INTEGER CHECK (effort_rating BETWEEN 1 AND 10),
  knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 10),
  leadership_rating INTEGER CHECK (leadership_rating BETWEEN 1 AND 10),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  
  -- Coaching Observations
  strengths_observed TEXT[] DEFAULT '{}',
  weaknesses_observed TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  coaching_notes TEXT,
  
  -- Development Tracking
  goals_for_next_session TEXT[] DEFAULT '{}',
  specific_drills_assigned TEXT[] DEFAULT '{}',
  injury_concerns TEXT[] DEFAULT '{}',
  
  -- Contextual Information
  weather_conditions TEXT,
  opponent_quality TEXT, -- 'weak', 'average', 'strong'
  game_situation TEXT, -- 'practice', 'scrimmage', 'game', 'playoffs'
  
  -- Recording Information
  recorded_by TEXT NOT NULL, -- Coach or evaluator user_id
  evaluation_method TEXT DEFAULT 'observation', -- 'observation', 'video', 'stats'
  confidence_level INTEGER DEFAULT 5 CHECK (confidence_level BETWEEN 1 AND 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY - PLAYER PERFORMANCE
-- =============================================================================

-- Enable RLS on player performance table
ALTER TABLE player_performance ENABLE ROW LEVEL SECURITY;

-- Player Performance - Team members can view, coaches can write
CREATE POLICY "player_performance_team_read" ON player_performance
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "player_performance_coaches_write" ON player_performance
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Players can view their own performance data
CREATE POLICY "player_performance_self_read" ON player_performance
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- =============================================================================
-- BASIC INDEXES - PLAYER PERFORMANCE
-- =============================================================================

-- Basic indexes for player performance
CREATE INDEX IF NOT EXISTS idx_player_performance_user_date 
  ON player_performance(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_player_performance_team_activity 
  ON player_performance(team_id, activity_type, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_player_performance_position 
  ON player_performance(position_played, overall_rating DESC);

-- =============================================================================
-- STEP 1 COMPLETION STATUS
-- =============================================================================

-- Migration 007 Step 1: Player Performance Tracking
-- ✅ player_performance table created
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created
-- ✅ JSONB stats storage for position flexibility

-- Ready for Step 2: Player Progress Tracking
