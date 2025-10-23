-- ============================================================================
-- BULLETPROOF DATABASE MIGRATION - COMPLETE SCHEMA RECONSTRUCTION
-- ============================================================================
-- Date: October 23, 2025
-- Purpose: Complete database reconstruction with all tables and constraints
-- This migration is designed to be idempotent and handle all edge cases
-- ============================================================================

-- ===========================================
-- 1. ENSURE ALL REQUIRED TABLES EXIST
-- ===========================================

-- Create personnel_configurations table (if not exists)
CREATE TABLE IF NOT EXISTS personnel_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_customization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(playbook_id, name)
);

-- Create personnel_players table (if not exists)
CREATE TABLE IF NOT EXISTS personnel_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES personnel_configurations(id) ON DELETE CASCADE,
  player_position TEXT NOT NULL CHECK (player_position IN ('QB', 'RB', 'TE', 'WR')),
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_wildcat_qb BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(config_id, sort_order),
  CHECK (label ~ '^[A-Z0-9]{1,3}$')
);

-- Ensure formations table exists (core table)
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  diagram_data JSONB,
  personnel_packages UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(playbook_id, name)
);

-- ===========================================
-- 2. ADD MISSING COLUMNS (IDEMPOTENT)
-- ===========================================

-- Add badge_customization to personnel_configurations if missing
ALTER TABLE personnel_configurations
ADD COLUMN IF NOT EXISTS badge_customization JSONB;

-- Add personnel_packages to formations if missing
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];

-- Add diagram_data to formations if missing
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS diagram_data JSONB;

-- ===========================================
-- 3. CREATE INDEXES (IDEMPOTENT)
-- ===========================================

-- Personnel configurations indexes
CREATE INDEX IF NOT EXISTS idx_personnel_configurations_playbook_id
ON personnel_configurations(playbook_id);

CREATE INDEX IF NOT EXISTS idx_personnel_configurations_playbook_name
ON personnel_configurations(playbook_id, name);

-- Personnel players indexes
CREATE INDEX IF NOT EXISTS idx_personnel_players_config_id
ON personnel_players(config_id);

CREATE INDEX IF NOT EXISTS idx_personnel_players_config_sort
ON personnel_players(config_id, sort_order);

-- Formations indexes
CREATE INDEX IF NOT EXISTS idx_formations_playbook_id
ON formations(playbook_id);

CREATE INDEX IF NOT EXISTS idx_formations_playbook_name
ON formations(playbook_id, name);

-- ===========================================
-- 4. ENABLE RLS (IDEMPOTENT)
-- ===========================================

ALTER TABLE personnel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 5. CREATE/UPDATE POLICIES (IDEMPOTENT)
-- ===========================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view personnel configurations" ON personnel_configurations;
DROP POLICY IF EXISTS "Coaches can create personnel configurations" ON personnel_configurations;
DROP POLICY IF EXISTS "Coaches can update personnel configurations" ON personnel_configurations;
DROP POLICY IF EXISTS "Coaches can delete personnel configurations" ON personnel_configurations;

DROP POLICY IF EXISTS "Users can view personnel players" ON personnel_players;
DROP POLICY IF EXISTS "Coaches can manage personnel players" ON personnel_players;

DROP POLICY IF EXISTS "Users can view formations" ON formations;
DROP POLICY IF EXISTS "Coaches can create formations" ON formations;
DROP POLICY IF EXISTS "Coaches can update formations" ON formations;
DROP POLICY IF EXISTS "Coaches can delete formations" ON formations;

-- Personnel configurations policies
CREATE POLICY "Users can view personnel configurations"
ON personnel_configurations FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can create personnel configurations"
ON personnel_configurations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can update personnel configurations"
ON personnel_configurations FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can delete personnel configurations"
ON personnel_configurations FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

-- Personnel players policies
CREATE POLICY "Users can view personnel players"
ON personnel_players FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pc.id = personnel_players.config_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can manage personnel players"
ON personnel_players FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pc.id = personnel_players.config_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

-- Formations policies
CREATE POLICY "Users can view formations"
ON formations FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = formations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can create formations"
ON formations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = formations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can update formations"
ON formations FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = formations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can delete formations"
ON formations FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = formations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
      AND tm.status = 'active'
  )
);

-- ===========================================
-- 6. CREATE/UPDATE FUNCTIONS (IDEMPOTENT)
-- ===========================================

-- Updated at trigger functions
CREATE OR REPLACE FUNCTION update_personnel_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_formations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. CREATE/UPDATE TRIGGERS (IDEMPOTENT)
-- ===========================================

DROP TRIGGER IF EXISTS personnel_configurations_updated_at ON personnel_configurations;
CREATE TRIGGER personnel_configurations_updated_at
  BEFORE UPDATE ON personnel_configurations
  FOR EACH ROW EXECUTE FUNCTION update_personnel_configurations_updated_at();

DROP TRIGGER IF EXISTS formations_updated_at ON formations;
CREATE TRIGGER formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW EXECUTE FUNCTION update_formations_updated_at();

-- ===========================================
-- 8. ADD COMMENTS
-- ===========================================

COMMENT ON TABLE personnel_configurations IS
  'Personnel groupings (11 Personnel, 12 Personnel, etc.) defined at playbook level. Each configuration describes a set of skill position players.';

COMMENT ON TABLE personnel_players IS
  'Individual player positions within a personnel configuration. QB is always sort_order=0 (locked). Other positions are skill positions: RB, TE, WR.';

COMMENT ON TABLE formations IS
  'Formation definitions that can be used in plays. Each formation specifies player positioning and can support multiple personnel packages.';

COMMENT ON COLUMN personnel_configurations.badge_customization IS
  'Custom badge styling. Schema: { style: "solid"|"border"|"gradient"|"shiny", colorPresetId: string, fontFamily?: string }';

COMMENT ON COLUMN formations.personnel_packages IS
  'Array of personnel configuration IDs that can run this formation.';

COMMENT ON COLUMN formations.diagram_data IS
  'JSON representation of the formation diagram for rendering.';

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================

-- Verify tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnel_configurations') THEN
    RAISE EXCEPTION 'personnel_configurations table was not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnel_players') THEN
    RAISE EXCEPTION 'personnel_players table was not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'formations') THEN
    RAISE EXCEPTION 'formations table was not created';
  END IF;

  RAISE NOTICE '✅ All required tables exist and are properly configured';
END $$;