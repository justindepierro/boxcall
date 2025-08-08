-- =============================================================================
-- MIGRATION 006 STEP 4: 8-BOX LAYOUT SYSTEM
-- Visual practice organization and layout boxes
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- 8-BOX LAYOUT SYSTEM - Visual Practice Organization
-- =============================================================================

CREATE TABLE practice_layout_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  
  -- Box Position in 2x4 Grid
  box_number INTEGER NOT NULL CHECK (box_number BETWEEN 1 AND 8),
  grid_row INTEGER NOT NULL CHECK (grid_row IN (1, 2)),
  grid_column INTEGER NOT NULL CHECK (grid_column BETWEEN 1 AND 4),
  
  -- Box Content
  title TEXT NOT NULL,
  subtitle TEXT,
  primary_color TEXT DEFAULT '#3B82F6', -- Blue
  accent_color TEXT DEFAULT '#1E40AF', -- Dark blue
  icon_name TEXT, -- For UI icons
  
  -- Time Allocation
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  start_time TIME, -- Actual time (e.g., 3:30 PM)
  end_time TIME,
  
  -- Content References
  block_ids UUID[] DEFAULT '{}', -- References to practice_blocks
  activity_count INTEGER DEFAULT 0,
  key_activities TEXT[] DEFAULT '{}', -- Summary of main activities
  
  -- Visual Customization
  layout_style TEXT DEFAULT 'standard' CHECK (layout_style IN (
    'standard', 'compact', 'detailed', 'time_focused'
  )),
  show_time BOOLEAN DEFAULT true,
  show_equipment BOOLEAN DEFAULT true,
  show_personnel BOOLEAN DEFAULT false,
  
  -- Print and Export Settings
  print_priority INTEGER DEFAULT 1 CHECK (print_priority BETWEEN 1 AND 3),
  include_in_coach_card BOOLEAN DEFAULT true,
  include_in_player_card BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(schedule_id, box_number),
  UNIQUE(schedule_id, grid_row, grid_column)
);

-- =============================================================================
-- AUTO-CALCULATE BOX TIMES TRIGGER
-- =============================================================================

-- Auto-calculate box times based on sequence
CREATE OR REPLACE FUNCTION calculate_box_times()
RETURNS TRIGGER AS $$
DECLARE
  practice_start TIME;
  cumulative_minutes INTEGER := 0;
  box_rec RECORD;
BEGIN
  -- Check if practice_schedules table exists and has start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_schedules' 
    AND column_name = 'start_time'
  ) THEN
    -- If column doesn't exist, just return NEW without time calculation
    RETURN NEW;
  END IF;

  -- Get practice start time
  SELECT start_time INTO practice_start
  FROM practice_schedules
  WHERE id = NEW.schedule_id;
  
  -- If no start time found, skip calculation
  IF practice_start IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate cumulative time for all previous boxes
  FOR box_rec IN 
    SELECT duration_minutes 
    FROM practice_layout_boxes 
    WHERE schedule_id = NEW.schedule_id 
    AND box_number < NEW.box_number 
    ORDER BY box_number
  LOOP
    cumulative_minutes := cumulative_minutes + box_rec.duration_minutes;
  END LOOP;
  
  -- Set start and end times
  NEW.start_time := practice_start + (cumulative_minutes || ' minutes')::INTERVAL;
  NEW.end_time := practice_start + ((cumulative_minutes + NEW.duration_minutes) || ' minutes')::INTERVAL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_box_times
  BEFORE INSERT OR UPDATE ON practice_layout_boxes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_box_times();

-- =============================================================================
-- ROW LEVEL SECURITY - LAYOUT BOXES
-- =============================================================================

-- Enable RLS on layout boxes table
ALTER TABLE practice_layout_boxes ENABLE ROW LEVEL SECURITY;

-- Practice Layout Boxes - Team members access
CREATE POLICY "practice_layout_boxes_team_access" ON practice_layout_boxes
  FOR ALL TO authenticated
  USING (
    schedule_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- BASIC INDEXES - LAYOUT BOXES
-- =============================================================================

-- Basic indexes for practice_layout_boxes
CREATE INDEX IF NOT EXISTS idx_practice_layout_boxes_schedule 
  ON practice_layout_boxes(schedule_id, box_number);
CREATE INDEX IF NOT EXISTS idx_practice_layout_boxes_grid 
  ON practice_layout_boxes(grid_row, grid_column);

-- =============================================================================
-- STEP 4 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 4: 8-Box Layout System
-- ✅ practice_layout_boxes table created
-- ✅ Box time calculation trigger created with safety checks
-- ✅ Row Level Security policy implemented
-- ✅ Basic indexes created

-- Ready for Step 5: Execution Tracking and Analytics
