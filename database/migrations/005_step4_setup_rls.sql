-- =============================================================================
-- GAME PLANNING SYSTEM - STEP 4: ROW LEVEL SECURITY POLICIES
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- Prerequisites: Steps 1, 2, and 3 must be completed first
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'STEP 4: Setting up Row Level Security policies...';
  
  -- Verify prerequisites
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_plan_plays') THEN
    RAISE EXCEPTION 'Step 2 must be completed first - game_plan_plays table does not exist';
  END IF;
  
  RAISE NOTICE 'Prerequisites verified - proceeding with RLS setup...';
END;
$$;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Game Plan Situations - Team members only
DROP POLICY IF EXISTS "team_members_game_plan_situations" ON game_plan_situations;
CREATE POLICY "team_members_game_plan_situations" ON game_plan_situations
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Game Plan Plays - Team members only  
DROP POLICY IF EXISTS "team_members_game_plan_plays" ON game_plan_plays;
CREATE POLICY "team_members_game_plan_plays" ON game_plan_plays
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Coach Cards - Team members only
DROP POLICY IF EXISTS "team_members_coach_cards" ON coach_cards;
CREATE POLICY "team_members_coach_cards" ON coach_cards
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Templates - Team members + public templates
DROP POLICY IF EXISTS "team_members_templates" ON game_plan_templates;
CREATE POLICY "team_members_templates" ON game_plan_templates
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR is_public = true
  );

-- Analytics - Team members only
DROP POLICY IF EXISTS "team_members_analytics" ON game_plan_analytics;
CREATE POLICY "team_members_analytics" ON game_plan_analytics
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- FINAL COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 GAME PLANNING SYSTEM MIGRATION COMPLETE! 🎉';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ STEP 4 COMPLETE: Row Level Security policies created';
  RAISE NOTICE '';
  RAISE NOTICE 'All steps completed successfully:';
  RAISE NOTICE '  ✓ Step 1: Enhanced game_plans table with Brian Billick columns';
  RAISE NOTICE '  ✓ Step 2: Created game planning tables';
  RAISE NOTICE '  ✓ Step 3: Created trigger functions and triggers';
  RAISE NOTICE '  ✓ Step 4: Set up Row Level Security policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Database is now ready for Phase 2 game planning! 🏈';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables available:';
  RAISE NOTICE '  - game_plans (enhanced)';
  RAISE NOTICE '  - game_plan_situations';
  RAISE NOTICE '  - game_plan_plays';
  RAISE NOTICE '  - coach_cards';
  RAISE NOTICE '  - game_plan_templates';
  RAISE NOTICE '  - game_plan_analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Automatic count updates via triggers';
  RAISE NOTICE '  - Row Level Security for team isolation';
  RAISE NOTICE '  - Performance indexes for fast queries';
  RAISE NOTICE '  - Brian Billick methodology support';
  RAISE NOTICE '';
  RAISE NOTICE '===============================================';
END;
$$;

-- Add table comments
COMMENT ON TABLE game_plan_situations IS 'Brian Billick methodology: Situational categories for game planning (1st & 10, Red Zone, etc.)';
COMMENT ON TABLE game_plan_plays IS 'Play assignments within situations with priority, risk analysis, and execution tracking';
COMMENT ON TABLE coach_cards IS 'Printable sideline reference cards for coaches with game plan information';
COMMENT ON TABLE game_plan_templates IS 'Reusable game plan patterns and coaching philosophies';
COMMENT ON TABLE game_plan_analytics IS 'Real-time execution tracking and performance analysis for continuous improvement';
