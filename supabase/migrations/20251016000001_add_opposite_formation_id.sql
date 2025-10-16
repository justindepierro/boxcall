-- =====================================================
-- Add opposite_formation_id for simplified formation linking
-- =====================================================
-- This migration simplifies the formation direction system:
-- - Removes directionality_type (mirror/built-in/symmetric/unspecified)
-- - Removes base_formation_id concept
-- - Adds direct opposite_formation_id link between pairs
-- - Updates direction to allow NULL (standalone formations)
-- =====================================================

-- Step 1: Add new opposite_formation_id column
ALTER TABLE formations
ADD COLUMN opposite_formation_id UUID REFERENCES formations(id) ON DELETE SET NULL;

-- Step 2: Create index for performance
CREATE INDEX idx_formations_opposite_formation_id ON formations(opposite_formation_id);

-- Step 3: Migrate existing base_formation_id relationships to opposite_formation_id
-- Convert left ↔ right pairs to direct links
WITH variant_pairs AS (
  SELECT 
    left_f.id as left_id,
    right_f.id as right_id
  FROM formations left_f
  JOIN formations right_f ON right_f.base_formation_id = left_f.base_formation_id
  WHERE left_f.direction = 'left' 
    AND right_f.direction = 'right'
    AND left_f.base_formation_id IS NOT NULL
)
-- Update left formations to point to right
UPDATE formations
SET opposite_formation_id = vp.right_id
FROM variant_pairs vp
WHERE formations.id = vp.left_id;

WITH variant_pairs AS (
  SELECT 
    left_f.id as left_id,
    right_f.id as right_id
  FROM formations left_f
  JOIN formations right_f ON right_f.base_formation_id = left_f.base_formation_id
  WHERE left_f.direction = 'left' 
    AND right_f.direction = 'right'
    AND left_f.base_formation_id IS NOT NULL
)
-- Update right formations to point to left
UPDATE formations
SET opposite_formation_id = vp.left_id
FROM variant_pairs vp
WHERE formations.id = vp.right_id;

-- Step 4: Drop NOT NULL constraint on direction column (if it exists)
ALTER TABLE formations
ALTER COLUMN direction DROP NOT NULL;

-- Step 5: Update "base" formations to NULL direction (standalone)
-- This must happen BEFORE adding the new CHECK constraint
UPDATE formations
SET direction = NULL
WHERE direction = 'base';

-- Step 6: Drop old direction constraint and add new one (allows NULL)
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_direction_check;

ALTER TABLE formations
ADD CONSTRAINT formations_direction_check 
CHECK (direction IN ('left', 'right') OR direction IS NULL);

-- Step 7: Create bidirectional linking trigger
-- Ensures opposite_formation_id is always bidirectional
CREATE OR REPLACE FUNCTION ensure_bidirectional_formation_link()
RETURNS TRIGGER AS $$
BEGIN
  -- If opposite_formation_id is being set, ensure the opposite formation links back
  IF NEW.opposite_formation_id IS NOT NULL THEN
    -- Only update if not already linked back (prevents infinite loop)
    UPDATE formations
    SET opposite_formation_id = NEW.id,
        updated_at = NOW()
    WHERE id = NEW.opposite_formation_id
      AND (opposite_formation_id IS NULL OR opposite_formation_id != NEW.id);
  END IF;
  
  -- If opposite_formation_id is being cleared, clear the opposite side too
  IF NEW.opposite_formation_id IS NULL AND OLD.opposite_formation_id IS NOT NULL THEN
    UPDATE formations
    SET opposite_formation_id = NULL,
        updated_at = NOW()
    WHERE id = OLD.opposite_formation_id
      AND opposite_formation_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_formation_link_bidirectional
AFTER INSERT OR UPDATE OF opposite_formation_id ON formations
FOR EACH ROW
EXECUTE FUNCTION ensure_bidirectional_formation_link();

-- Step 8: Create RPC function for atomic bidirectional linking
CREATE OR REPLACE FUNCTION link_formations_bidirectional(
  formation1_id UUID,
  formation2_id UUID,
  formation1_direction TEXT DEFAULT NULL,
  formation2_direction TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  f1_dir TEXT;
  f2_dir TEXT;
BEGIN
  -- Get current directions
  SELECT direction INTO f1_dir FROM formations WHERE id = formation1_id;
  SELECT direction INTO f2_dir FROM formations WHERE id = formation2_id;
  
  -- Use provided directions or infer from current
  f1_dir := COALESCE(formation1_direction, f1_dir, 'left');
  f2_dir := COALESCE(formation2_direction, f2_dir, 'right');
  
  -- Validation: formations must be in same playbook
  IF NOT EXISTS (
    SELECT 1 FROM formations f1
    JOIN formations f2 ON f2.playbook_id = f1.playbook_id
    WHERE f1.id = formation1_id AND f2.id = formation2_id
  ) THEN
    RAISE EXCEPTION 'Formations must be in same playbook';
  END IF;
  
  -- Validation: neither can already be linked
  IF EXISTS (
    SELECT 1 FROM formations
    WHERE id IN (formation1_id, formation2_id)
      AND opposite_formation_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'One or both formations already linked';
  END IF;
  
  -- Update formation 1
  UPDATE formations
  SET 
    opposite_formation_id = formation2_id,
    direction = f1_dir,
    updated_at = NOW()
  WHERE id = formation1_id;
  
  -- Update formation 2
  UPDATE formations
  SET 
    opposite_formation_id = formation1_id,
    direction = f2_dir,
    updated_at = NOW()
  WHERE id = formation2_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create RPC function for atomic bidirectional unlinking
CREATE OR REPLACE FUNCTION unlink_formations_bidirectional(
  formation_id UUID
)
RETURNS VOID AS $$
DECLARE
  opposite_id UUID;
BEGIN
  -- Get opposite formation ID
  SELECT opposite_formation_id INTO opposite_id
  FROM formations
  WHERE id = formation_id;
  
  -- Unlink current formation
  UPDATE formations
  SET 
    opposite_formation_id = NULL,
    direction = NULL,
    updated_at = NOW()
  WHERE id = formation_id;
  
  -- Unlink opposite formation
  IF opposite_id IS NOT NULL THEN
    UPDATE formations
    SET 
      opposite_formation_id = NULL,
      direction = NULL,
      updated_at = NOW()
    WHERE id = opposite_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Drop old columns (OPTIONAL - comment out if you want to keep for rollback)
-- Uncomment these after verifying migration works correctly

-- ALTER TABLE formations DROP COLUMN IF EXISTS base_formation_id;
-- ALTER TABLE formations DROP COLUMN IF EXISTS directionality_type;

-- Step 11: Add comment to table
COMMENT ON COLUMN formations.opposite_formation_id IS 
'Direct link to opposite-side formation variant. Used for left/right pairing. NULL if standalone formation.';

COMMENT ON COLUMN formations.direction IS 
'Formation direction: "left", "right", or NULL. NULL indicates standalone formation (no directional variant).';

-- =====================================================
-- Verification Queries (run these after migration)
-- =====================================================

-- Check bidirectional links are correct
-- SELECT 
--   f1.id, f1.name, f1.direction, f1.opposite_formation_id,
--   f2.id as opp_id, f2.name as opp_name, f2.direction as opp_dir, f2.opposite_formation_id as opp_opposite,
--   CASE 
--     WHEN f1.opposite_formation_id = f2.id AND f2.opposite_formation_id = f1.id THEN '✅ Valid'
--     WHEN f1.opposite_formation_id IS NULL AND f2.id IS NULL THEN '✅ Standalone'
--     ELSE '❌ Broken'
--   END as link_status
-- FROM formations f1
-- LEFT JOIN formations f2 ON f1.opposite_formation_id = f2.id
-- ORDER BY link_status DESC, f1.name;

-- Count formation types
-- SELECT 
--   CASE 
--     WHEN opposite_formation_id IS NOT NULL THEN 'Paired'
--     WHEN direction IS NULL THEN 'Standalone'
--     ELSE 'Unpaired (needs link)'
--   END as formation_type,
--   COUNT(*) as count
-- FROM formations
-- GROUP BY formation_type;
