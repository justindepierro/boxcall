-- ============================================================================
-- PERSONNEL SYSTEM MIGRATION
-- ============================================================================
-- Date: October 11, 2025
-- Purpose: Add personnel configuration tables to support play-level personnel
--          groupings (11 Personnel, 12 Personnel, etc.)
--
-- Architecture:
-- - personnel_configurations: Named groupings at playbook level
-- - personnel_players: Individual positions within each configuration
-- - Integrates with existing plays.personnel column (TEXT)
-- - QB locked at position 0, skill positions only (QB, RB, TE, WR)
--
-- See: docs/PERSONNEL_SYSTEM_ARCHITECTURE.md
-- ============================================================================

-- ===========================================
-- 1. CREATE PERSONNEL_CONFIGURATIONS TABLE
-- ===========================================

CREATE TABLE personnel_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "11 Personnel", "12 Personnel"
  description TEXT, -- e.g., "1 RB, 1 TE, 2 WR"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique personnel names per playbook
  UNIQUE(playbook_id, name)
);
-- Add index for fast lookups by playbook
CREATE INDEX idx_personnel_configurations_playbook_id 
ON personnel_configurations(playbook_id);
-- Add index for lookup by name (used in diagram loading)
CREATE INDEX idx_personnel_configurations_playbook_name 
ON personnel_configurations(playbook_id, name);
-- Add comment
COMMENT ON TABLE personnel_configurations IS 
  'Personnel groupings (11 Personnel, 12 Personnel, etc.) defined at playbook level. Each configuration describes a set of skill position players.';
-- ===========================================
-- 2. CREATE PERSONNEL_PLAYERS TABLE
-- ===========================================

CREATE TABLE personnel_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES personnel_configurations(id) ON DELETE CASCADE,
  player_position TEXT NOT NULL CHECK (player_position IN ('QB', 'RB', 'TE', 'WR')), -- Skill positions only (renamed from 'position' to avoid reserved keyword)
  label TEXT NOT NULL, -- e.g., "Q", "R", "T", "X", "Y" (max 3 chars, uppercase)
  sort_order INTEGER NOT NULL, -- Display order (0 = QB, locked at top)
  is_wildcat_qb BOOLEAN DEFAULT false, -- For trick plays where non-QB takes snap
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique sort order per configuration
  UNIQUE(config_id, sort_order),
  
  -- Validate label format (3 chars max, uppercase alphanumeric)
  CHECK (label ~ '^[A-Z0-9]{1,3}$')
);
-- Add index for fast lookups by configuration
CREATE INDEX idx_personnel_players_config_id 
ON personnel_players(config_id);
-- Add index for ordered retrieval (QB always first)
CREATE INDEX idx_personnel_players_config_sort 
ON personnel_players(config_id, sort_order);
-- Add comment
COMMENT ON TABLE personnel_players IS 
  'Individual player positions within a personnel configuration. QB is always sort_order=0 (locked). Other positions are skill positions: RB, TE, WR.';
-- ===========================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on both tables
ALTER TABLE personnel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_players ENABLE ROW LEVEL SECURITY;
-- ========================================
-- RLS: personnel_configurations
-- ========================================

-- Policy: Users can view personnel configurations for their team's playbooks
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
-- Policy: Coaches can insert personnel configurations
CREATE POLICY "Coaches can create personnel configurations"
ON personnel_configurations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- Policy: Coaches can update personnel configurations
CREATE POLICY "Coaches can update personnel configurations"
ON personnel_configurations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- Policy: Coaches can delete personnel configurations
CREATE POLICY "Coaches can delete personnel configurations"
ON personnel_configurations FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- ========================================
-- RLS: personnel_players
-- ========================================

-- Policy: Users can view personnel players for their team's configurations
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
-- Policy: Coaches can insert personnel players
CREATE POLICY "Coaches can create personnel players"
ON personnel_players FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pc.id = personnel_players.config_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- Policy: Coaches can update personnel players
CREATE POLICY "Coaches can update personnel players"
ON personnel_players FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pc.id = personnel_players.config_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- Policy: Coaches can delete personnel players
CREATE POLICY "Coaches can delete personnel players"
ON personnel_players FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pc.id = personnel_players.config_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);
-- ===========================================
-- 4. HELPER FUNCTIONS
-- ===========================================

-- Function: Get personnel configuration by name
-- Usage: Used by diagram system to load personnel based on play.personnel
CREATE OR REPLACE FUNCTION get_personnel_configuration_by_name(
  p_playbook_id UUID,
  p_name TEXT
)
RETURNS TABLE (
  id UUID,
  playbook_id UUID,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.playbook_id,
    pc.name,
    pc.description,
    pc.created_at,
    pc.updated_at
  FROM personnel_configurations pc
  WHERE pc.playbook_id = p_playbook_id
    AND pc.name = p_name
  LIMIT 1;
END;
$$;
-- Function: Get personnel players for a configuration (ordered by sort_order)
CREATE OR REPLACE FUNCTION get_personnel_players(
  p_config_id UUID
)
RETURNS TABLE (
  id UUID,
  config_id UUID,
  player_position TEXT,
  label TEXT,
  sort_order INTEGER,
  is_wildcat_qb BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.config_id,
    pp.player_position,
    pp.label,
    pp.sort_order,
    pp.is_wildcat_qb
  FROM personnel_players pp
  WHERE pp.config_id = p_config_id
  ORDER BY pp.sort_order ASC;
END;
$$;
-- ===========================================
-- 5. SEED DEFAULT 11 PERSONNEL
-- ===========================================

-- For each existing playbook, create a default "11 Personnel" configuration
-- This ensures backward compatibility and gives users a starting point

DO $$
DECLARE
  playbook_record RECORD;
  config_id UUID;
BEGIN
  -- Loop through all playbooks
  FOR playbook_record IN 
    SELECT id, name FROM playbooks
  LOOP
    -- Insert default 11 Personnel configuration
    INSERT INTO personnel_configurations (
      playbook_id,
      name,
      description
    ) VALUES (
      playbook_record.id,
      '11 Personnel',
      '1 RB, 1 TE, 2 WR'
    )
    RETURNING id INTO config_id;
    
    -- Insert default skill positions
    -- Position 0: QB (LOCKED)
    INSERT INTO personnel_players (config_id, player_position, label, sort_order, is_wildcat_qb)
    VALUES (config_id, 'QB', 'Q', 0, false);
    
    -- Position 1: RB
    INSERT INTO personnel_players (config_id, player_position, label, sort_order, is_wildcat_qb)
    VALUES (config_id, 'RB', 'R', 1, false);
    
    -- Position 2: TE
    INSERT INTO personnel_players (config_id, player_position, label, sort_order, is_wildcat_qb)
    VALUES (config_id, 'TE', 'T', 2, false);
    
    -- Position 3: WR (X receiver)
    INSERT INTO personnel_players (config_id, player_position, label, sort_order, is_wildcat_qb)
    VALUES (config_id, 'WR', 'X', 3, false);
    
    -- Position 4: WR (Y receiver)
    INSERT INTO personnel_players (config_id, player_position, label, sort_order, is_wildcat_qb)
    VALUES (config_id, 'WR', 'Y', 4, false);
    
    RAISE NOTICE 'Created default 11 Personnel for playbook: % (%)', playbook_record.name, playbook_record.id;
  END LOOP;
END $$;
-- ===========================================
-- 6. UPDATE EXISTING PLAYS
-- ===========================================

-- Update existing plays that have NULL or empty personnel to use "11 Personnel"
-- This ensures all plays have a valid personnel configuration

UPDATE plays
SET personnel = '11 Personnel'
WHERE personnel IS NULL OR personnel = '' OR personnel = 'N/A';
COMMENT ON COLUMN plays.personnel IS 
  'Personnel configuration name (e.g., "11 Personnel"). References personnel_configurations.name for the playbook.';
-- ===========================================
-- 7. UPDATED_AT TRIGGER
-- ===========================================

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personnel_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER personnel_configurations_updated_at
  BEFORE UPDATE ON personnel_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_personnel_configurations_updated_at();
-- ===========================================
-- 8. GRANTS
-- ===========================================

-- Grant access to authenticated users (RLS will control actual access)
GRANT SELECT ON personnel_configurations TO authenticated;
GRANT SELECT ON personnel_players TO authenticated;
GRANT INSERT, UPDATE, DELETE ON personnel_configurations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON personnel_players TO authenticated;
-- Note: No sequences to grant because we use uuid_generate_v4() for primary keys
-- UUIDs don't require sequences like SERIAL/BIGSERIAL would

-- ===========================================
-- MIGRATION COMPLETE ✅
-- ===========================================

-- Summary:
-- ✅ Created personnel_configurations table
-- ✅ Created personnel_players table
-- ✅ Added RLS policies for team-based access
-- ✅ Added indexes for performance
-- ✅ Added helper functions for common queries
-- ✅ Seeded default 11 Personnel for all playbooks
-- ✅ Updated existing plays to reference "11 Personnel"
-- ✅ Added updated_at trigger
-- ✅ Granted necessary permissions
--
-- Next: Phase 3 - Service Layer (personnelService.ts);
