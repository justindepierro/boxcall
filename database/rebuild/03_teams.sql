-- ===========================================
-- TEAM MANAGEMENT
-- ===========================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_name TEXT,
  mascot TEXT,
  season_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 0,
  last_backup_at TIMESTAMPTZ,
  backup_version INTEGER DEFAULT 1
);

-- Drop existing table if it exists with wrong schema
DROP TABLE IF EXISTS team_members CASCADE;

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach')),
  capabilities JSONB DEFAULT '{
    "can_manage_team": false,
    "can_manage_games": false,
    "can_manage_social": false,
    "can_manage_players": false,
    "can_view_analytics": false,
    "can_manage_playbook": false,
    "can_manage_practice": false,
    "can_manage_equipment": false
  }',
  role_notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  UNIQUE(team_id, user_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can update their teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Users can view team memberships" ON team_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own memberships" ON team_members
  FOR ALL USING (
    user_id = auth.uid()
  );

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    team_role IN ('head_coach', 'assistant_coach', 'coordinator') AND
    status = 'active' AND
    user_id = auth.uid()
  );
