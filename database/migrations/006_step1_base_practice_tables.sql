-- =============================================================================
-- MIGRATION 006 STEP 1: BASE PRACTICE TABLES
-- Core practice scheduling and templates infrastructure
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- BASE PRACTICE SCHEDULES TABLE - Core Scheduling Infrastructure
-- =============================================================================

-- Create practice_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS practice_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_scheduled DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  field_type TEXT,
  weather_conditions TEXT,
  total_duration INTEGER, -- minutes
  created_by TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Service compatibility fields
  equipment_required TEXT[],
  coaching_notes TEXT,
  objectives TEXT[],
  completion_status TEXT DEFAULT 'scheduled' CHECK (completion_status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- =============================================================================
-- PRACTICE TEMPLATES - Reusable Practice Structures
-- =============================================================================

CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Template Identification
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'preseason', 'regular_season', 'playoffs', 'off_season',
    'game_prep', 'fundamentals', 'conditioning', 'walkthrough'
  )),
  
  -- Template Configuration
  total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  recommended_participants INTEGER,
  equipment_list TEXT[] DEFAULT '{}',
  field_requirements TEXT[] DEFAULT '{}',
  
  -- Usage and Performance
  usage_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  last_used_date DATE,
  
  -- Template Metadata
  is_public BOOLEAN DEFAULT false, -- Can other teams use this template?
  created_by TEXT NOT NULL,
  shared_by_coach TEXT, -- Original creator if shared
  coaching_level TEXT[] DEFAULT '{}', -- 'youth', 'high_school', 'college', 'pro'
  
  -- Seasonal Information
  best_season TEXT[] DEFAULT '{}', -- 'preseason', 'early_season', 'mid_season', 'playoffs'
  weather_suitability TEXT[] DEFAULT '{"any"}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - BASE TABLES
-- =============================================================================

-- Enable RLS on base tables
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;

-- Practice Schedules - Team members only
CREATE POLICY "practice_schedules_team_access" ON practice_schedules
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

-- Practice Templates - Team access + public templates
CREATE POLICY "practice_templates_access" ON practice_templates
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "practice_templates_modify" ON practice_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- =============================================================================
-- INITIAL DATA SETUP - PRACTICE TEMPLATES
-- =============================================================================

-- Insert default practice template categories
INSERT INTO practice_templates (
  id, team_id, name, description, category, total_duration_minutes,
  recommended_participants, is_public, created_by, coaching_level
) VALUES
  -- Public templates available to all teams
  (
    uuid_generate_v4(), 
    NULL, -- Public template
    'Standard Game Week Practice',
    'Comprehensive practice structure for regular season game preparation',
    'game_prep',
    120,
    40,
    true,
    'system',
    ARRAY['high_school', 'college']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Fundamentals Focus - Youth',
    'Basic skill development practice for youth football',
    'fundamentals',
    90,
    25,
    true,
    'system',
    ARRAY['youth']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Two-A-Day Morning Session',
    'High-intensity morning practice for preseason camps',
    'preseason',
    100,
    50,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Playoff Preparation',
    'Focused practice structure for playoff game preparation',
    'playoffs',
    110,
    45,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Walkthrough and Film',
    'Light practice with film study and mental preparation',
    'walkthrough',
    60,
    40,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  );

-- =============================================================================
-- BASIC INDEXES FOR BASE TABLES
-- =============================================================================

-- Basic indexes for practice_schedules
CREATE INDEX IF NOT EXISTS idx_practice_schedules_team_date 
  ON practice_schedules(team_id, date_scheduled DESC);
CREATE INDEX IF NOT EXISTS idx_practice_schedules_status 
  ON practice_schedules(completion_status, team_id);

-- Basic indexes for practice_templates
CREATE INDEX IF NOT EXISTS idx_practice_templates_team_category 
  ON practice_templates(team_id, category);
CREATE INDEX IF NOT EXISTS idx_practice_templates_public 
  ON practice_templates(is_public, category) WHERE is_public = true;

-- =============================================================================
-- STEP 1 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 1: Base Practice Tables
-- ✅ practice_schedules table created
-- ✅ practice_templates table created  
-- ✅ Row Level Security policies implemented
-- ✅ Initial template data inserted
-- ✅ Basic indexes created

-- Ready for Step 2: Practice Blocks and Activities
