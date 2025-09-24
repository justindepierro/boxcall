-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create practice_scripts table
CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team members can view practice scripts" ON practice_scripts
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team coaches can manage practice scripts" ON practice_scripts
FOR ALL USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
