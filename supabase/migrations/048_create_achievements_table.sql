-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  description TEXT,
  earned_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view achievements" ON achievements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN team_players tp ON tm.team_id = tp.team_id
    WHERE tm.user_id = auth.uid()
    AND tp.id = achievements.player_id
  )
);

CREATE POLICY "Team coaches can manage achievements" ON achievements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN team_players tp ON tm.team_id = tp.team_id
    WHERE tm.user_id = auth.uid()
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND tp.id = achievements.player_id
  )
);
