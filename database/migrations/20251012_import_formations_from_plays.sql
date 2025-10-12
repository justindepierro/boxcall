-- Migration: Import Formations from Existing Plays
-- Date: October 12, 2025
-- Purpose: Create formation records from unique formation names in plays table
-- This populates the formations table with formations that already exist in plays

-- Insert unique formations from plays into formations table
INSERT INTO formations (
  playbook_id,
  name,
  description,
  category,
  personnel_packages,
  direction,
  is_custom,
  created_by,
  created_at,
  updated_at
)
SELECT DISTINCT
  p.playbook_id,
  p.formation AS name,
  'Imported from plays' AS description,
  'spread' AS category, -- Default to spread, can be updated later
  ARRAY[]::UUID[] AS personnel_packages, -- Empty array, can be updated later
  'base' AS direction, -- Default to base
  true AS is_custom,
  p.created_by,
  NOW() AS created_at,
  NOW() AS updated_at
FROM plays p
WHERE p.formation IS NOT NULL 
  AND p.formation != ''
  AND NOT EXISTS (
    -- Don't insert if formation already exists for this playbook
    SELECT 1 FROM formations f 
    WHERE f.playbook_id = p.playbook_id 
    AND f.name = p.formation
  )
ORDER BY p.formation;

-- Show what was imported
DO $$
DECLARE
  formation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO formation_count FROM formations;
  RAISE NOTICE 'Import complete! Total formations in database: %', formation_count;
  
  -- Show formations by playbook
  FOR formation_count IN 
    SELECT COUNT(*) as cnt, playbook_id 
    FROM formations 
    GROUP BY playbook_id
  LOOP
    RAISE NOTICE 'Playbook has % formations', formation_count;
  END LOOP;
END $$;
