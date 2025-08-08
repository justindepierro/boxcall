-- =============================================================================
-- MIGRATION 006 STEP 6: PERFORMANCE OPTIMIZATION
-- Composite indexes and query optimization for production scale
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- Composite indexes for common query patterns
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) for migration scripts
-- In production, these could be recreated with CONCURRENTLY if needed

CREATE INDEX IF NOT EXISTS idx_practice_blocks_schedule_time 
  ON practice_blocks(schedule_id, start_offset_minutes, duration_minutes);

CREATE INDEX IF NOT EXISTS idx_practice_activities_execution 
  ON practice_activities(activity_type, duration_minutes) 
  WHERE repetitions > 1;

CREATE INDEX IF NOT EXISTS idx_practice_executions_performance 
  ON practice_executions(execution_quality, completion_rate, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_templates_search 
  ON practice_templates(category, coaching_level, is_public) 
  WHERE is_public = true;

-- Additional performance indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_practice_schedules_date_status
  ON practice_schedules(date_scheduled DESC, completion_status, team_id);

CREATE INDEX IF NOT EXISTS idx_practice_blocks_type_focus
  ON practice_blocks(block_type, focus_area, intensity_level);

CREATE INDEX IF NOT EXISTS idx_practice_activities_competitive
  ON practice_activities(is_competitive, difficulty_level, injury_risk_level)
  WHERE is_competitive = true;

CREATE INDEX IF NOT EXISTS idx_practice_layout_boxes_print
  ON practice_layout_boxes(schedule_id, print_priority, box_number)
  WHERE include_in_coach_card = true;

-- =============================================================================
-- QUERY OPTIMIZATION VIEWS (OPTIONAL)
-- =============================================================================

-- Materialized view for practice performance summary (optional - can be added later)
-- This would be useful for dashboard queries but adds complexity

-- =============================================================================
-- STEP 6 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 6: Performance Optimization
-- ✅ Composite indexes created for common query patterns
-- ✅ Additional performance indexes for complex scenarios
-- ✅ Indexes created without CONCURRENTLY (migration script compatible)
-- ✅ Conditional indexes for filtered queries
-- 
-- Note: In production with large datasets, these indexes could be recreated
-- using CONCURRENTLY outside of migration scripts to avoid table locks

-- Migration 006 Complete: Practice Planning System Ready for Production
-- 
-- SUMMARY OF ALL TABLES CREATED:
-- ✅ practice_schedules - Core practice scheduling
-- ✅ practice_templates - Reusable practice structures  
-- ✅ practice_blocks - Timeline segments for organization
-- ✅ practice_activities - Detailed activity breakdown
-- ✅ practice_layout_boxes - 8-box visual layout system
-- ✅ practice_executions - Real performance tracking
-- ✅ practice_analytics - Performance insights and analytics
--
-- FEATURES IMPLEMENTED:
-- ✅ Complete Row Level Security for team-based isolation
-- ✅ Automated triggers for duration calculation and time management
-- ✅ Performance-optimized indexes for production scale
-- ✅ Initial template data for immediate use
-- ✅ Professional coaching workflow support
