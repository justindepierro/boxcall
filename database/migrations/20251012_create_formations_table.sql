-- Migration: Create Formations System
-- Date: October 12, 2025
-- Purpose: Fully integrated formation system with personnel linkage and Left/Right variants
-- Dependencies: Requires personnel_configurations table and playbooks table

-- =====================================================
-- FORMATIONS TABLE
-- =====================================================

CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('spread', 'pro', 'power', 'special', 'goal_line', 'short_yardage')),
  
  -- Personnel Reference (connected system!)
  personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL,
  personnel_name TEXT, -- Denormalized: "11", "12", "21" - for quick display
  
  -- Left/Right Variant System
  base_formation_id UUID REFERENCES formations(id) ON DELETE CASCADE, -- NULL = this IS the base
  direction TEXT NOT NULL DEFAULT 'base' CHECK (direction IN ('base', 'left', 'right')),
  
  -- Formation Strength (which player sets alignment)
  strength_player_position TEXT, -- "X", "Y", "Z", "H", "F", etc.
  strength_player_label TEXT,    -- "Blue", "Black", "Green" from personnel
  
  -- Player Positions (JSONB array)
  -- Structure: [{position: "X", x: 10, y: 25, label: "Blue", isStrengthSetter: true, role: "WR"}, ...]
  player_positions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- ["twins", "compressed", "unbalanced", "stack"]
  is_custom BOOLEAN DEFAULT true,      -- TRUE = user created, FALSE = system template
  usage_count INTEGER DEFAULT 0,       -- How many plays reference this formation
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Unique constraint: can't have duplicate names in same playbook
  CONSTRAINT unique_formation_name_per_playbook UNIQUE(playbook_id, name)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_formations_playbook ON formations(playbook_id);
CREATE INDEX idx_formations_personnel ON formations(personnel_id) WHERE personnel_id IS NOT NULL;
CREATE INDEX idx_formations_base ON formations(base_formation_id) WHERE base_formation_id IS NOT NULL;
CREATE INDEX idx_formations_direction ON formations(direction);
CREATE INDEX idx_formations_category ON formations(category);
CREATE INDEX idx_formations_tags ON formations USING GIN(tags);

-- =====================================================
-- UPDATE PLAYS TABLE
-- =====================================================

-- Add formation relationship to plays (keep old formation TEXT for backwards compatibility)
ALTER TABLE plays 
  ADD COLUMN IF NOT EXISTS formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS formation_direction TEXT CHECK (formation_direction IN ('base', 'left', 'right'));

-- Index for play-formation lookups
CREATE INDEX IF NOT EXISTS idx_plays_formation ON plays(formation_id) WHERE formation_id IS NOT NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_formations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_formations_updated_at();

-- =====================================================
-- TRIGGER TO UPDATE USAGE COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION update_formation_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a play is created with a formation_id
  IF TG_OP = 'INSERT' AND NEW.formation_id IS NOT NULL THEN
    UPDATE formations 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.formation_id;
  END IF;
  
  -- When a play's formation_id changes
  IF TG_OP = 'UPDATE' THEN
    -- Decrement old formation
    IF OLD.formation_id IS NOT NULL AND OLD.formation_id != NEW.formation_id THEN
      UPDATE formations 
      SET usage_count = GREATEST(0, usage_count - 1)
      WHERE id = OLD.formation_id;
    END IF;
    
    -- Increment new formation
    IF NEW.formation_id IS NOT NULL AND OLD.formation_id != NEW.formation_id THEN
      UPDATE formations 
      SET usage_count = usage_count + 1 
      WHERE id = NEW.formation_id;
    END IF;
  END IF;
  
  -- When a play is deleted
  IF TG_OP = 'DELETE' AND OLD.formation_id IS NOT NULL THEN
    UPDATE formations 
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.formation_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_play_formation_usage
  AFTER INSERT OR UPDATE OR DELETE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION update_formation_usage_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- Users can view formations in playbooks they have access to
CREATE POLICY formations_select_policy ON formations
  FOR SELECT
  USING (
    playbook_id IN (
      SELECT p.id 
      FROM playbooks p
      LEFT JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Users can create formations in playbooks they have access to
CREATE POLICY formations_insert_policy ON formations
  FOR INSERT
  WITH CHECK (
    playbook_id IN (
      SELECT p.id 
      FROM playbooks p
      LEFT JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Users can update formations they created or have permission for
CREATE POLICY formations_update_policy ON formations
  FOR UPDATE
  USING (
    playbook_id IN (
      SELECT p.id 
      FROM playbooks p
      LEFT JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Users can delete formations they created or have permission for
CREATE POLICY formations_delete_policy ON formations
  FOR DELETE
  USING (
    playbook_id IN (
      SELECT p.id 
      FROM playbooks p
      LEFT JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to flip formation coordinates (for creating Left/Right variants)
CREATE OR REPLACE FUNCTION flip_formation_positions(positions JSONB, field_width NUMERIC DEFAULT 53.3)
RETURNS JSONB AS $$
DECLARE
  flipped JSONB;
  player JSONB;
  flipped_array JSONB := '[]'::jsonb;
BEGIN
  -- Iterate through each player position
  FOR player IN SELECT * FROM jsonb_array_elements(positions)
  LOOP
    -- Flip the x coordinate: new_x = field_width - old_x
    flipped := player || jsonb_build_object(
      'x', field_width - (player->>'x')::numeric
    );
    
    flipped_array := flipped_array || jsonb_build_array(flipped);
  END LOOP;
  
  RETURN flipped_array;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get all variants (base + left + right) for a formation
CREATE OR REPLACE FUNCTION get_formation_variants(formation_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  direction TEXT,
  player_positions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.name, f.direction, f.player_positions
  FROM formations f
  WHERE f.id = formation_id 
     OR f.base_formation_id = formation_id
     OR f.base_formation_id = (SELECT base_formation_id FROM formations WHERE id = formation_id)
  ORDER BY 
    CASE f.direction
      WHEN 'base' THEN 1
      WHEN 'left' THEN 2
      WHEN 'right' THEN 3
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE formations IS 'Formation library - stores all offensive formations with personnel linkage and Left/Right variants';
COMMENT ON COLUMN formations.base_formation_id IS 'NULL for base formation, references base formation ID for left/right variants';
COMMENT ON COLUMN formations.direction IS 'Indicates if this is the base formation or a left/right variant';
COMMENT ON COLUMN formations.strength_player_position IS 'Position code (X, Y, Z, H, F) that sets formation strength/alignment';
COMMENT ON COLUMN formations.strength_player_label IS 'Personnel label (Blue, Black, Green) for the strength-setting player';
COMMENT ON COLUMN formations.player_positions IS 'JSONB array of player positions with coordinates and labels';
COMMENT ON COLUMN formations.usage_count IS 'Auto-incremented count of plays using this formation';

COMMENT ON FUNCTION flip_formation_positions IS 'Utility function to flip formation coordinates horizontally for creating opposite-side variants';
COMMENT ON FUNCTION get_formation_variants IS 'Returns all variants (base, left, right) for a given formation ID';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Formation system migration complete!';
  RAISE NOTICE '- formations table created with RLS policies';
  RAISE NOTICE '- plays.formation_id and plays.formation_direction added';
  RAISE NOTICE '- Triggers configured for usage tracking';
  RAISE NOTICE '- Helper functions created for flipping and querying variants';
END $$;
