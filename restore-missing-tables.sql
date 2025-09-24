-- Quick fix: Create missing tables that were lost in database reset
-- This recreates only the tables that are missing

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Playbooks table
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays table
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  formation TEXT,
  play_type TEXT CHECK (play_type IN ('run', 'pass', 'special_teams', 'trick')),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  success_rate DECIMAL(5,2),
  duplicate_key TEXT UNIQUE,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice schedules table
CREATE TABLE IF NOT EXISTS practice_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  focus_areas TEXT[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plans table
CREATE TABLE IF NOT EXISTS game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  game_date DATE NOT NULL,
  venue TEXT,
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  strategy_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('balls', 'cones', 'agility', 'protective', 'training', 'other')),
  quantity INTEGER DEFAULT 1,
  condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables (service role access)
CREATE POLICY "Service role full access" ON playbooks FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON plays FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON practice_schedules FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON game_plans FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON equipment FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add user access policies
CREATE POLICY "Users can view team playbooks" ON playbooks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = playbooks.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view team plays" ON plays FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
    WHERE pb.id = plays.playbook_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view practice schedules" ON practice_schedules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = practice_schedules.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view game plans" ON game_plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = game_plans.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view equipment" ON equipment FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = equipment.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);