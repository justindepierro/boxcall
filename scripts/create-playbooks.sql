-- Create playbooks table
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Playbook',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 0,
  last_modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view playbooks from their teams" ON playbooks
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert playbooks for their teams" ON playbooks
FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update playbooks from their teams" ON playbooks
FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete playbooks from their teams" ON playbooks
FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert default playbook for admin team
INSERT INTO playbooks (team_id, name, description)
SELECT id, 'Main Playbook', 'Default playbook for the team'
FROM teams
WHERE name = 'Admin Team'
LIMIT 1;
