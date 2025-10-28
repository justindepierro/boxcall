-- Database Schema Fixes for BoxCall
-- Migration: 20251028000000_fix_database_schema_issues.sql
-- Fixes formations table missing columns and adds playbook_view_presets table

-- ===========================================
-- 1. ADD MISSING COLUMNS TO FORMATIONS TABLE
-- ===========================================

-- Add direction column (FormationDirection: "left", "right", or null)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('left', 'right')) DEFAULT NULL;

-- Add opposite_formation_id column (references formations.id)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS opposite_formation_id UUID REFERENCES formations(id) ON DELETE SET NULL;

-- Add usage_count column (integer, default 0)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Add metadata_quality column (text: "complete", "needs_work", "incomplete")
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS metadata_quality TEXT CHECK (metadata_quality IN ('complete', 'needs_work', 'incomplete')) DEFAULT 'incomplete';

-- Add player_positions column (JSONB array for formation positions)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS player_positions JSONB DEFAULT '[]'::jsonb;

-- ===========================================
-- 2. ADD MISSING COLUMN TO PLAYS TABLE
-- ===========================================

-- Add created_by column (references auth.users.id)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ===========================================
-- 3. CREATE PLAYBOOK_VIEW_PRESETS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS playbook_view_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,

  -- Ensure unique names per user/team combination
  UNIQUE(user_id, team_id, name)
);

-- ===========================================
-- 4. ADD INDEXES FOR PERFORMANCE
-- ===========================================

-- Formations indexes
CREATE INDEX IF NOT EXISTS idx_formations_direction ON formations(direction);
CREATE INDEX IF NOT EXISTS idx_formations_opposite_formation_id ON formations(opposite_formation_id);
CREATE INDEX IF NOT EXISTS idx_formations_usage_count ON formations(usage_count DESC);

-- Playbook view presets indexes
CREATE INDEX IF NOT EXISTS idx_playbook_view_presets_user_id ON playbook_view_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_playbook_view_presets_team_id ON playbook_view_presets(team_id);
CREATE INDEX IF NOT EXISTS idx_playbook_view_presets_archived ON playbook_view_presets(archived);

-- Plays indexes
CREATE INDEX IF NOT EXISTS idx_plays_created_by ON plays(created_by);

-- ===========================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on playbook_view_presets
ALTER TABLE playbook_view_presets ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 6. ADD RLS POLICIES
-- ===========================================

-- Playbook view presets policies
DROP POLICY IF EXISTS "Users can view their own presets" ON playbook_view_presets;
CREATE POLICY "Users can view their own presets"
  ON playbook_view_presets
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view team presets" ON playbook_view_presets;
CREATE POLICY "Users can view team presets"
  ON playbook_view_presets
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own presets" ON playbook_view_presets;
CREATE POLICY "Users can create their own presets"
  ON playbook_view_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own presets" ON playbook_view_presets;
CREATE POLICY "Users can update their own presets"
  ON playbook_view_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own presets" ON playbook_view_presets;
CREATE POLICY "Users can delete their own presets"
  ON playbook_view_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- 7. UPDATE EXISTING DATA
-- ===========================================

-- Set default metadata_quality for existing formations
UPDATE formations
SET metadata_quality = 'incomplete'
WHERE metadata_quality IS NULL;

-- Set default usage_count for existing formations
UPDATE formations
SET usage_count = 0
WHERE usage_count IS NULL;

-- ===========================================
-- 8. ADD TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to playbook_view_presets
DROP TRIGGER IF EXISTS update_playbook_view_presets_updated_at ON playbook_view_presets;
CREATE TRIGGER update_playbook_view_presets_updated_at
  BEFORE UPDATE ON playbook_view_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();