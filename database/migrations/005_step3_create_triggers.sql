-- =============================================================================
-- GAME PLANNING SYSTEM - STEP 3: CREATE TRIGGER FUNCTIONS AND TRIGGERS
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- Prerequisites: Steps 1 and 2 must be completed first
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'STEP 3: Creating trigger functions and triggers...';
  
  -- Verify prerequisites
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_plan_situations') THEN
    RAISE EXCEPTION 'Step 2 must be completed first - game_plan_situations table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'total_situations') THEN
    RAISE EXCEPTION 'Step 1 must be completed first - game_plans table missing total_situations column';
  END IF;
  
  RAISE NOTICE 'Prerequisites verified - proceeding with trigger creation...';
END;
$$;

-- =============================================================================
-- TRIGGER FUNCTIONS
-- =============================================================================

-- Function to update game plan situation counts
CREATE OR REPLACE FUNCTION update_game_plan_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE game_plans 
    SET total_situations = (
      SELECT COUNT(*) FROM game_plan_situations 
      WHERE game_plan_id = NEW.game_plan_id AND is_active = true
    )
    WHERE id = NEW.game_plan_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE game_plans 
    SET total_situations = (
      SELECT COUNT(*) FROM game_plan_situations 
      WHERE game_plan_id = OLD.game_plan_id AND is_active = true
    )
    WHERE id = OLD.game_plan_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update play counts
CREATE OR REPLACE FUNCTION update_play_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update situation play count
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = NEW.situation_id AND is_active = true
    )
    WHERE id = NEW.situation_id;
    
    -- Update game plan total
    UPDATE game_plans 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays gpp
      JOIN game_plan_situations gps ON gps.id = gpp.situation_id
      WHERE gps.game_plan_id = NEW.game_plan_id AND gpp.is_active = true
    )
    WHERE id = NEW.game_plan_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update situation play count
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = OLD.situation_id AND is_active = true
    )
    WHERE id = OLD.situation_id;
    
    -- Update game plan total
    UPDATE game_plans 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays gpp
      JOIN game_plan_situations gps ON gps.id = gpp.situation_id
      WHERE gps.game_plan_id = OLD.game_plan_id AND gpp.is_active = true
    )
    WHERE id = OLD.game_plan_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Creating triggers...';
  
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS trigger_game_plan_situation_count ON game_plan_situations;
  DROP TRIGGER IF EXISTS trigger_game_plan_play_count ON game_plan_plays;
  
  -- Create situation count trigger
  CREATE TRIGGER trigger_game_plan_situation_count
    AFTER INSERT OR UPDATE OR DELETE ON game_plan_situations
    FOR EACH ROW
    EXECUTE FUNCTION update_game_plan_counts();
    
  RAISE NOTICE '✓ Created situation count trigger';
    
  -- Create play count trigger
  CREATE TRIGGER trigger_game_plan_play_count
    AFTER INSERT OR UPDATE OR DELETE ON game_plan_plays
    FOR EACH ROW
    EXECUTE FUNCTION update_play_counts();
    
  RAISE NOTICE '✓ Created play count trigger';
END;
$$;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✓ STEP 3 COMPLETE: Trigger functions and triggers created successfully';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  - trigger_game_plan_situation_count';
  RAISE NOTICE '  - trigger_game_plan_play_count';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run Step 4 to set up Row Level Security policies';
END;
$$;
