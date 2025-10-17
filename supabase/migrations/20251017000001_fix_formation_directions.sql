-- Migration: Fix Formation Directions Based on Plays
-- Date: October 17, 2025
-- Purpose: Update existing formations to have proper direction values
--          Currently formations have direction=null but plays have f_dir='L'/'R'

-- =====================================================
-- ANALYSIS OF CURRENT STATE
-- =====================================================
-- formations table: 2 formations ("Trips", "Twins") with direction=null
-- plays table: 7 plays with f_dir='L' or 'R'
-- 
-- Plays breakdown:
-- - "Twins" with f_dir='L' (4 plays)
-- - "Trips" with f_dir='R' (3 plays)
--
-- Strategy: Create left/right variants for each formation based on plays

-- =====================================================
-- STEP 1: Create Formation Variants with Direction
-- =====================================================

-- For each formation that has plays with f_dir, create directional variants
DO $$
DECLARE
  base_formation RECORD;
  left_formation_id UUID;
  right_formation_id UUID;
  plays_with_left INTEGER;
  plays_with_right INTEGER;
BEGIN
  -- Process each formation that currently has direction=null
  FOR base_formation IN 
    SELECT id, name, playbook_id, created_by, category, description, personnel_id, personnel_name, player_positions
    FROM formations
    WHERE direction IS NULL
  LOOP
    RAISE NOTICE '🔍 Processing formation: %', base_formation.name;
    
    -- Check if this formation is used in plays with f_dir
    SELECT COUNT(*) INTO plays_with_left
    FROM plays
    WHERE formation = base_formation.name
      AND playbook_id = base_formation.playbook_id
      AND UPPER(f_dir) IN ('L', 'LEFT', 'LT');
    
    SELECT COUNT(*) INTO plays_with_right
    FROM plays
    WHERE formation = base_formation.name
      AND playbook_id = base_formation.playbook_id
      AND UPPER(f_dir) IN ('R', 'RIGHT', 'RT');
    
    RAISE NOTICE '  - Plays with left: %, Plays with right: %', plays_with_left, plays_with_right;
    
    -- Create LEFT variant if needed
    IF plays_with_left > 0 THEN
      RAISE NOTICE '  ✅ Creating LEFT variant for %', base_formation.name;
      
      INSERT INTO formations (
        playbook_id,
        name,
        description,
        category,
        personnel_id,
        personnel_name,
        direction,
        player_positions,
        created_by,
        usage_count
      ) VALUES (
        base_formation.playbook_id,
        base_formation.name,
        COALESCE(base_formation.description, '') || ' (Left variant - auto-created from plays)',
        base_formation.category,
        base_formation.personnel_id,
        base_formation.personnel_name,
        'left',
        base_formation.player_positions,
        base_formation.created_by,
        plays_with_left
      )
      RETURNING id INTO left_formation_id;
      
      RAISE NOTICE '  → Created left variant: %', left_formation_id;
    END IF;
    
    -- Create RIGHT variant if needed
    IF plays_with_right > 0 THEN
      RAISE NOTICE '  ✅ Creating RIGHT variant for %', base_formation.name;
      
      INSERT INTO formations (
        playbook_id,
        name,
        description,
        category,
        personnel_id,
        personnel_name,
        direction,
        player_positions,
        created_by,
        usage_count
      ) VALUES (
        base_formation.playbook_id,
        base_formation.name,
        COALESCE(base_formation.description, '') || ' (Right variant - auto-created from plays)',
        base_formation.category,
        base_formation.personnel_id,
        base_formation.personnel_name,
        'right',
        base_formation.player_positions,
        base_formation.created_by,
        plays_with_right
      )
      RETURNING id INTO right_formation_id;
      
      RAISE NOTICE '  → Created right variant: %', right_formation_id;
    END IF;
    
    -- Link left and right variants as opposites (if both exist)
    IF plays_with_left > 0 AND plays_with_right > 0 THEN
      RAISE NOTICE '  🔗 Linking left and right variants as opposites';
      
      UPDATE formations
      SET opposite_formation_id = right_formation_id
      WHERE id = left_formation_id;
      
      UPDATE formations
      SET opposite_formation_id = left_formation_id
      WHERE id = right_formation_id;
    END IF;
    
  END LOOP;
  
  RAISE NOTICE '✅ Formation direction fix complete!';
END $$;

-- =====================================================
-- STEP 2: Update Formation Names to Include Direction
-- =====================================================

-- Optional: Update formation names to be more descriptive
-- Uncomment if you want formation names to show direction
-- UPDATE formations 
-- SET name = name || ' Left'
-- WHERE direction = 'left';

-- UPDATE formations 
-- SET name = name || ' Right'
-- WHERE direction = 'right';

-- =====================================================
-- STEP 3: Verification
-- =====================================================

-- Show results
DO $$
DECLARE
  total_formations INTEGER;
  left_formations INTEGER;
  right_formations INTEGER;
  null_formations INTEGER;
  linked_pairs INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_formations FROM formations;
  SELECT COUNT(*) INTO left_formations FROM formations WHERE direction = 'left';
  SELECT COUNT(*) INTO right_formations FROM formations WHERE direction = 'right';
  SELECT COUNT(*) INTO null_formations FROM formations WHERE direction IS NULL;
  SELECT COUNT(*) INTO linked_pairs FROM formations WHERE opposite_formation_id IS NOT NULL;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Formation Migration Results';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Total formations: %', total_formations;
  RAISE NOTICE 'Left variants: %', left_formations;
  RAISE NOTICE 'Right variants: %', right_formations;
  RAISE NOTICE 'Null direction: %', null_formations;
  RAISE NOTICE 'Formations with opposites linked: %', linked_pairs;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
