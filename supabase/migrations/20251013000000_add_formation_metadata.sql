-- =====================================================
-- Formation Metadata Migration
-- =====================================================
-- Adds formation-level metadata (type, run/pass strength)
-- and play-level modifiers (back position relative to QB)
--
-- This allows formations to define base characteristics
-- that are inherited by all plays, with optional play-level
-- adjustments based on back alignment.
-- =====================================================

-- Add formation metadata columns
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS formation_type TEXT CHECK (formation_type IN (
  'I Formation',
  'Singleback',
  'Pistol',
  'Shotgun',
  'Empty',
  'Trips',
  'Bunch',
  'Stack',
  'Wing',
  'Other'
)),
ADD COLUMN IF NOT EXISTS run_strength TEXT CHECK (run_strength IN ('left', 'right', 'balanced')) DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS pass_strength TEXT CHECK (pass_strength IN ('left', 'right', 'balanced')) DEFAULT 'balanced';

-- Add indexes for filtering formations by metadata
CREATE INDEX IF NOT EXISTS idx_formations_formation_type ON formations(formation_type) WHERE formation_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_formations_run_strength ON formations(run_strength);
CREATE INDEX IF NOT EXISTS idx_formations_pass_strength ON formations(pass_strength);

-- Add comments for documentation
COMMENT ON COLUMN formations.formation_type IS 'Base formation type/category (I Formation, Shotgun, etc.)';
COMMENT ON COLUMN formations.run_strength IS 'Default run strength for this formation: left, right, or balanced';
COMMENT ON COLUMN formations.pass_strength IS 'Default pass strength for this formation: left, right, or balanced';

-- Add play-level strength modifiers
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS back_left_of_qb BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS back_right_of_qb BOOLEAN DEFAULT FALSE;

-- Add indexes for filtering plays by back position
CREATE INDEX IF NOT EXISTS idx_plays_back_left_of_qb ON plays(back_left_of_qb) WHERE back_left_of_qb = TRUE;
CREATE INDEX IF NOT EXISTS idx_plays_back_right_of_qb ON plays(back_right_of_qb) WHERE back_right_of_qb = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN plays.back_left_of_qb IS 'TRUE if running back aligns left of QB (modifies formation run strength)';
COMMENT ON COLUMN plays.back_right_of_qb IS 'TRUE if running back aligns right of QB (modifies formation run strength)';

-- Optional: Migrate existing play data to formations
-- This attempts to set formation metadata based on the most common
-- values from plays that use each formation
DO $$
DECLARE
  formation_record RECORD;
  most_common_f_type TEXT;
  most_common_r_str TEXT;
  most_common_p_str TEXT;
BEGIN
  FOR formation_record IN 
    SELECT id FROM formations WHERE formation_type IS NULL
  LOOP
    -- Get most common f_type for this formation
    SELECT p.f_type INTO most_common_f_type
    FROM plays p
    WHERE p.formation_id = formation_record.id
      AND p.f_type IS NOT NULL
    GROUP BY p.f_type
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Get most common r_str for this formation
    SELECT p.r_str INTO most_common_r_str
    FROM plays p
    WHERE p.formation_id = formation_record.id
      AND p.r_str IS NOT NULL
    GROUP BY p.r_str
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Get most common p_str for this formation
    SELECT p.p_str INTO most_common_p_str
    FROM plays p
    WHERE p.formation_id = formation_record.id
      AND p.p_str IS NOT NULL
    GROUP BY p.p_str
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Update formation with most common values
    UPDATE formations
    SET 
      formation_type = CASE 
        WHEN most_common_f_type IN ('I Formation', 'Singleback', 'Pistol', 'Shotgun', 'Empty', 'Trips', 'Bunch', 'Stack', 'Wing', 'Other')
        THEN most_common_f_type
        ELSE NULL
      END,
      run_strength = CASE 
        WHEN LOWER(most_common_r_str) IN ('left', 'right', 'balanced')
        THEN LOWER(most_common_r_str)
        ELSE 'balanced'
      END,
      pass_strength = CASE 
        WHEN LOWER(most_common_p_str) IN ('left', 'right', 'balanced')
        THEN LOWER(most_common_p_str)
        ELSE 'balanced'
      END
    WHERE id = formation_record.id;
  END LOOP;
END $$;
