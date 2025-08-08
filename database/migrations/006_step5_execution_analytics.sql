-- =============================================================================
-- MIGRATION 006 STEP 5: EXECUTION TRACKING AND ANALYTICS
-- Performance tracking and analytics tables
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- PRACTICE EXECUTION TRACKING - Real Performance Data
-- =============================================================================

CREATE TABLE practice_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES practice_activities(id),
  
  -- Execution Context
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_duration_minutes INTEGER,
  participants_present INTEGER,
  weather_conditions TEXT,
  field_conditions TEXT,
  
  -- Performance Metrics
  execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
  completion_rate DECIMAL(5,2), -- Percentage (0.00 to 100.00)
  success_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  
  -- Coaching Observations
  what_went_well TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  coaching_adjustments_made TEXT[] DEFAULT '{}',
  player_standouts TEXT[] DEFAULT '{}', -- User IDs or names
  
  -- Metrics and Analytics
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
  injury_incidents INTEGER DEFAULT 0,
  equipment_issues TEXT[] DEFAULT '{}',
  
  -- Follow-up Actions
  needs_repeat BOOLEAN DEFAULT false,
  repeat_reason TEXT,
  next_practice_notes TEXT,
  
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PRACTICE ANALYTICS AND INSIGHTS
-- =============================================================================

CREATE TABLE practice_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practice_schedules(id),
  
  -- Aggregated Performance Data
  total_practices INTEGER DEFAULT 0,
  avg_practice_duration INTEGER, -- Minutes
  avg_execution_quality DECIMAL(3,2),
  avg_completion_rate DECIMAL(5,2),
  
  -- Time Distribution Analysis
  warmup_time_pct DECIMAL(5,2),
  individual_time_pct DECIMAL(5,2),
  group_time_pct DECIMAL(5,2),
  team_time_pct DECIMAL(5,2),
  conditioning_time_pct DECIMAL(5,2),
  
  -- Effectiveness Metrics
  most_effective_activities TEXT[] DEFAULT '{}',
  least_effective_activities TEXT[] DEFAULT '{}',
  optimal_practice_duration INTEGER, -- Recommended duration
  fatigue_point_minutes INTEGER, -- When performance drops
  
  -- Trend Analysis
  improvement_areas TEXT[] DEFAULT '{}',
  performance_trends JSONB DEFAULT '{}',
  seasonal_patterns JSONB DEFAULT '{}',
  
  -- Period Analysis
  analysis_period TEXT NOT NULL, -- 'weekly', 'monthly', 'season'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY - EXECUTION AND ANALYTICS
-- =============================================================================

-- Enable RLS on execution and analytics tables
ALTER TABLE practice_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_analytics ENABLE ROW LEVEL SECURITY;

-- Practice Executions - Coaches can insert, all team members can read
CREATE POLICY "practice_executions_read" ON practice_executions
  FOR SELECT TO authenticated
  USING (
    practice_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "practice_executions_coaches_write" ON practice_executions
  FOR INSERT TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Practice Analytics - Team members read, system generates
CREATE POLICY "practice_analytics_team_read" ON practice_analytics
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- BASIC INDEXES - EXECUTION AND ANALYTICS
-- =============================================================================

-- Basic indexes for practice_executions
CREATE INDEX IF NOT EXISTS idx_practice_executions_practice_date 
  ON practice_executions(practice_id, executed_at);
CREATE INDEX IF NOT EXISTS idx_practice_executions_activity 
  ON practice_executions(activity_id);
CREATE INDEX IF NOT EXISTS idx_practice_executions_quality 
  ON practice_executions(execution_quality, completion_rate);

-- Basic indexes for practice_analytics
CREATE INDEX IF NOT EXISTS idx_practice_analytics_team_period 
  ON practice_analytics(team_id, analysis_period, period_start);
CREATE INDEX IF NOT EXISTS idx_practice_analytics_practice 
  ON practice_analytics(practice_id) WHERE practice_id IS NOT NULL;

-- =============================================================================
-- STEP 5 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 5: Execution Tracking and Analytics
-- ✅ practice_executions table created
-- ✅ practice_analytics table created
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Ready for Step 6: Performance Optimization and Composite Indexes
