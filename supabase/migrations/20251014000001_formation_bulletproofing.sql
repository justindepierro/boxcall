-- =====================================================
-- FORMATION SYSTEM BULLETPROOFING MIGRATION
-- Date: October 14, 2025
-- Purpose: Add critical safety constraints and validation
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD NEW COLUMNS
-- =====================================================

-- Add directionality_type column to distinguish formation types
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS directionality_type VARCHAR(20) DEFAULT 'unspecified'
CHECK (directionality_type IN ('mirror', 'built-in', 'symmetric', 'unspecified'));

-- Add version column for optimistic locking (conflict resolution)
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add index for directionality filtering
CREATE INDEX IF NOT EXISTS idx_formations_directionality 
ON formations(directionality_type);

-- =====================================================
-- 2. CRITICAL SAFETY CONSTRAINTS
-- =====================================================

-- Constraint 1: No self-reference (formation can't point to itself)
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_no_self_reference CASCADE;

ALTER TABLE formations
ADD CONSTRAINT formations_no_self_reference
CHECK (base_formation_id IS NULL OR base_formation_id != id);

-- Constraint 2: Base formations (direction='base') must have base_formation_id=NULL
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_base_has_no_parent CASCADE;

ALTER TABLE formations
ADD CONSTRAINT formations_base_has_no_parent
CHECK (
  (direction = 'base' AND base_formation_id IS NULL) OR
  (direction != 'base')
);

-- Constraint 3: Variants (direction='left'|'right') must have base_formation_id set
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_variants_have_parent CASCADE;

ALTER TABLE formations
ADD CONSTRAINT formations_variants_have_parent
CHECK (
  (direction IN ('left', 'right') AND base_formation_id IS NOT NULL) OR
  (direction = 'base')
);

-- Constraint 4: Unique variant per direction (prevents duplicate LEFT or RIGHT)
-- Drop existing unique constraint on name (we'll handle this differently)
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS unique_formation_name_per_playbook CASCADE;

-- Create unique index for variants (one LEFT and one RIGHT per base)
DROP INDEX IF EXISTS idx_formations_unique_variant CASCADE;
CREATE UNIQUE INDEX idx_formations_unique_variant
ON formations (base_formation_id, direction)
WHERE base_formation_id IS NOT NULL;

-- Recreation of name constraint but allow duplicates for variants
-- (e.g., "Trips" base and "Trips" left variant can both exist with same name)
CREATE UNIQUE INDEX idx_formations_unique_base_name
ON formations (playbook_id, name)
WHERE base_formation_id IS NULL;

-- =====================================================
-- 3. CIRCULAR REFERENCE PREVENTION TRIGGER
-- =====================================================

-- Function to check for circular references in formation chains
CREATE OR REPLACE FUNCTION check_formation_circular_reference()
RETURNS TRIGGER AS $$
DECLARE
  visited UUID[];
  current_id UUID;
  depth INTEGER := 0;
  max_depth INTEGER := 10;
BEGIN
  -- Only check if base_formation_id is being set
  IF NEW.base_formation_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Start from the new base_formation_id
  current_id := NEW.base_formation_id;
  visited := ARRAY[NEW.id];
  
  -- Walk up the chain
  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    -- Check for cycle
    IF current_id = ANY(visited) THEN
      RAISE EXCEPTION 'Circular formation reference detected: formation % would create a cycle', NEW.id
        USING HINT = 'Choose a base formation that is not part of a variant chain';
    END IF;
    
    -- Add to visited
    visited := array_append(visited, current_id);
    depth := depth + 1;
    
    -- Get next in chain
    SELECT base_formation_id INTO current_id
    FROM formations
    WHERE id = current_id;
  END LOOP;
  
  -- Check if we hit max depth (suspicious - might be a cycle we didn't catch)
  IF depth >= max_depth THEN
    RAISE EXCEPTION 'Formation chain too deep (max %): possible circular reference', max_depth
      USING HINT = 'Formation variant chains should only be 1 level deep';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS trigger_check_formation_circular ON formations;
CREATE TRIGGER trigger_check_formation_circular
  BEFORE INSERT OR UPDATE OF base_formation_id ON formations
  FOR EACH ROW
  EXECUTE FUNCTION check_formation_circular_reference();

-- =====================================================
-- 4. VERSION INCREMENT TRIGGER (Optimistic Locking)
-- =====================================================

-- Function to increment version on every update
CREATE OR REPLACE FUNCTION increment_formation_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if this is an actual update (not same data)
  IF NEW IS DISTINCT FROM OLD THEN
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS trigger_increment_formation_version ON formations;
CREATE TRIGGER trigger_increment_formation_version
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION increment_formation_version();

-- =====================================================
-- 5. TRANSACTION-SAFE FORMATION LINKING FUNCTION
-- =====================================================

-- Database function for atomic formation linking (all succeed or all fail)
CREATE OR REPLACE FUNCTION link_formations_transaction(
  p_base_formation_id UUID,
  p_left_formation_id UUID DEFAULT NULL,
  p_right_formation_id UUID DEFAULT NULL,
  p_personnel_packages TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS json AS $$
DECLARE
  v_base_formation RECORD;
  v_left_formation RECORD;
  v_right_formation RECORD;
  v_result json;
BEGIN
  -- Validate base formation exists
  SELECT * INTO v_base_formation
  FROM formations
  WHERE id = p_base_formation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Base formation not found: %', p_base_formation_id
      USING HINT = 'Ensure the formation exists before linking';
  END IF;
  
  -- Validate base is actually a base (not a variant)
  IF v_base_formation.base_formation_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot link to a variant formation (%). Choose the base formation instead', p_base_formation_id
      USING HINT = 'Select the formation with direction="base"';
  END IF;
  
  -- Validate left formation if provided
  IF p_left_formation_id IS NOT NULL THEN
    SELECT * INTO v_left_formation
    FROM formations
    WHERE id = p_left_formation_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Left formation not found: %', p_left_formation_id;
    END IF;
    
    -- Check if already linked as RIGHT variant elsewhere
    IF v_left_formation.direction = 'right' AND v_left_formation.base_formation_id IS NOT NULL THEN
      RAISE EXCEPTION 'Formation % is already linked as a RIGHT variant. Unlink it first or choose a different formation', p_left_formation_id
        USING HINT = 'Each formation can only be one variant type (left or right)';
    END IF;
  END IF;
  
  -- Validate right formation if provided
  IF p_right_formation_id IS NOT NULL THEN
    SELECT * INTO v_right_formation
    FROM formations
    WHERE id = p_right_formation_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Right formation not found: %', p_right_formation_id;
    END IF;
    
    -- Check if already linked as LEFT variant elsewhere
    IF v_right_formation.direction = 'left' AND v_right_formation.base_formation_id IS NOT NULL THEN
      RAISE EXCEPTION 'Formation % is already linked as a LEFT variant. Unlink it first or choose a different formation', p_right_formation_id
        USING HINT = 'Each formation can only be one variant type (left or right)';
    END IF;
  END IF;
  
  -- All validation passed - perform updates atomically
  
  -- Link left variant
  IF p_left_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'left',
        personnel_packages = p_personnel_packages,
        updated_at = NOW()
    WHERE id = p_left_formation_id;
  END IF;
  
  -- Link right variant
  IF p_right_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'right',
        personnel_packages = p_personnel_packages,
        updated_at = NOW()
    WHERE id = p_right_formation_id;
  END IF;
  
  -- Update base formation
  UPDATE formations
  SET direction = 'base',
      personnel_packages = p_personnel_packages,
      updated_at = NOW()
  WHERE id = p_base_formation_id;
  
  -- Return success result
  v_result := json_build_object(
    'success', true,
    'base_formation_id', p_base_formation_id,
    'left_formation_id', p_left_formation_id,
    'right_formation_id', p_right_formation_id
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception (will cause transaction rollback)
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. DATA CLEANUP & MIGRATION
-- =====================================================

-- Fix any orphaned variants (safety check - CASCADE should prevent this)
UPDATE formations
SET base_formation_id = NULL,
    direction = 'base'
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- Smart detection of directionality type for existing formations
UPDATE formations
SET directionality_type = CASE
  -- Formations with variants or is a variant → mirror
  WHEN base_formation_id IS NOT NULL THEN 'mirror'
  WHEN id IN (
    SELECT DISTINCT base_formation_id 
    FROM formations 
    WHERE base_formation_id IS NOT NULL
  ) THEN 'mirror'
  
  -- Built-in directional keywords
  WHEN name ~* '\y(east|west|rip|liz|strong|weak|open|closed|over|under)\y' THEN 'built-in'
  
  -- Symmetric patterns
  WHEN name ~* '\y(empty|spread|stack|bunch|quad|wide)\y' THEN 'symmetric'
  
  -- Default: unspecified (user will set on first use)
  ELSE 'unspecified'
END
WHERE directionality_type = 'unspecified';

-- Initialize version for existing formations
UPDATE formations
SET version = 1
WHERE version IS NULL;

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Drop existing functions if they exist (to avoid signature conflicts)
DROP FUNCTION IF EXISTS formation_has_variants(UUID);
DROP FUNCTION IF EXISTS get_formation_variants(UUID);
DROP FUNCTION IF EXISTS is_base_formation(UUID);

-- Function to check if a formation has variants
CREATE FUNCTION formation_has_variants(formation_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM formations 
    WHERE base_formation_id = formation_id
  );
$$ LANGUAGE sql STABLE;

-- Function to get all variants of a formation
CREATE FUNCTION get_formation_variants(formation_id UUID)
RETURNS TABLE (
  variant_id UUID,
  variant_direction TEXT,
  variant_name TEXT
) AS $$
  SELECT id, direction, name
  FROM formations
  WHERE base_formation_id = formation_id
  ORDER BY direction;
$$ LANGUAGE sql STABLE;

-- Function to check if formation is a base
CREATE FUNCTION is_base_formation(formation_id UUID)
RETURNS BOOLEAN AS $$
  SELECT base_formation_id IS NULL 
  FROM formations 
  WHERE id = formation_id;
$$ LANGUAGE sql STABLE;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (Run after migration)
-- =====================================================

-- Check directionality distribution
SELECT 
  directionality_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM formations
GROUP BY directionality_type
ORDER BY count DESC;

-- Check for orphaned variants (should be 0)
SELECT 
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No orphaned variants'
    ELSE '❌ Found orphaned variants - needs attention'
  END as status
FROM formations
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- Check for duplicate variants (should be 0)
SELECT 
  base_formation_id,
  direction,
  COUNT(*) as duplicate_count,
  array_agg(id) as duplicate_ids
FROM formations
WHERE base_formation_id IS NOT NULL
GROUP BY base_formation_id, direction
HAVING COUNT(*) > 1;

-- Check constraint violations (should all return 0)
SELECT 
  'Self-references' as check_type,
  COUNT(*) as violation_count
FROM formations
WHERE id = base_formation_id
UNION ALL
SELECT 
  'Base with parent' as check_type,
  COUNT(*) as violation_count
FROM formations
WHERE direction = 'base' AND base_formation_id IS NOT NULL
UNION ALL
SELECT 
  'Variant without parent' as check_type,
  COUNT(*) as violation_count
FROM formations
WHERE direction IN ('left', 'right') AND base_formation_id IS NULL;

-- Show formation variant chains
SELECT 
  b.name as base_name,
  b.directionality_type,
  l.name as left_variant_name,
  r.name as right_variant_name,
  CASE 
    WHEN l.id IS NOT NULL AND r.id IS NOT NULL THEN '✅ Complete'
    WHEN l.id IS NULL AND r.id IS NOT NULL THEN '⚠️ Missing LEFT'
    WHEN r.id IS NULL AND l.id IS NOT NULL THEN '⚠️ Missing RIGHT'
    ELSE '📝 No variants'
  END as status
FROM formations b
LEFT JOIN formations l ON l.base_formation_id = b.id AND l.direction = 'left'
LEFT JOIN formations r ON r.base_formation_id = b.id AND r.direction = 'right'
WHERE b.direction = 'base'
ORDER BY b.name;
