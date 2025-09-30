-- Create missing tables for team dashboard functionality
-- Run this in your Supabase SQL editor

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  content TEXT,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Season stats table
CREATE TABLE IF NOT EXISTS season_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  season_year INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pf_total INTEGER DEFAULT 0,
  pa_total INTEGER DEFAULT 0,
  win_pct DECIMAL(3,3) DEFAULT 0.000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, season_year)
);

-- Add missing columns to existing team_events table
ALTER TABLE team_events 
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update starts_at from event_date for existing records
UPDATE team_events 
SET starts_at = event_date::TIMESTAMPTZ 
WHERE starts_at IS NULL AND event_date IS NOT NULL;

-- Team players view (create as table for now, drop if exists first)
DROP TABLE IF EXISTS team_players_view;
CREATE TABLE team_players_view AS
SELECT 
  tp.*,
  CONCAT(tp.first_name, ' ', tp.last_name) as full_name
FROM team_players tp;

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_feed_team_id ON activity_feed(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_events_starts_at ON team_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_season_stats_team_year ON season_stats(team_id, season_year);