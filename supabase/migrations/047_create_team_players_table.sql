-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create team_players table
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  grade_level TEXT,
  height_inches INTEGER,
  weight_lbs INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_team_players_team_active ON team_players(team_id, is_active);

-- Enable RLS
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view team players" ON team_players
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team coaches can manage team players" ON team_players
FOR ALL USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
