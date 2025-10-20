-- Migration: Create play_assignments table
-- Date: October 20, 2025
-- Purpose: Store player assignments for each play in the playbook
-- Allows coaches to write instructions for each position and players to view them

-- =============================================
-- CREATE TABLE: play_assignments
-- =============================================

CREATE TABLE IF NOT EXISTS play_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  playbook_id UUID NOT NULL REFERENCES playbooks(idx) ON DELETE CASCADE,
  
  -- Position and assignment details
  position TEXT NOT NULL, -- e.g., "QB", "RB", "WR1", "LT", etc. - dynamic based on personnel
  assignment_text TEXT, -- The actual assignment/instruction for this position
  
  -- Tagging and mentions
  player_tags JSONB DEFAULT '[]'::jsonb, -- Array of player IDs tagged in this assignment
  hashtags JSONB DEFAULT '[]'::jsonb, -- Array of hashtags used (e.g., ["route", "blocking"])
  
  -- Overall play notes (shared across all positions for this play)
  play_notes TEXT, -- General notes for the entire play
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one assignment per position per play
  UNIQUE(play_id, position)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_play_assignments_play_id ON play_assignments(play_id);
CREATE INDEX IF NOT EXISTS idx_play_assignments_playbook_id ON play_assignments(playbook_id);
CREATE INDEX IF NOT EXISTS idx_play_assignments_position ON play_assignments(position);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_play_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS trigger_update_play_assignments_updated_at ON play_assignments;

CREATE TRIGGER trigger_update_play_assignments_updated_at
  BEFORE UPDATE ON play_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_play_assignments_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE play_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for safe re-runs)
DROP POLICY IF EXISTS "Coaches can view play assignments" ON play_assignments;
DROP POLICY IF EXISTS "Players can view play assignments" ON play_assignments;
DROP POLICY IF EXISTS "Coaches can create play assignments" ON play_assignments;
DROP POLICY IF EXISTS "Coaches can update play assignments" ON play_assignments;
DROP POLICY IF EXISTS "Coaches can delete play assignments" ON play_assignments;
DROP POLICY IF EXISTS "Players can add their own assignment notes" ON play_assignments;

-- Policy 1: Coaches can view assignments for their team's playbooks
CREATE POLICY "Coaches can view play assignments"
  ON play_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Policy 2: Players can view assignments for their team's playbooks
CREATE POLICY "Players can view play assignments"
  ON play_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role = 'player'
    )
  );

-- Policy 3: Coaches can create assignments for their team's plays
CREATE POLICY "Coaches can create play assignments"
  ON play_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Policy 4: Coaches can update assignments for their team's plays
CREATE POLICY "Coaches can update play assignments"
  ON play_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Policy 5: Coaches can delete assignments for their team's plays
CREATE POLICY "Coaches can delete play assignments"
  ON play_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Policy 6: Players can suggest updates (optional - for collaborative editing)
-- Players can add comments/suggestions but not directly modify coach assignments
-- This could be implemented as a separate "assignment_suggestions" table if needed
-- For now, we'll allow players to add their own notes but not modify coach assignments

CREATE POLICY "Players can add their own assignment notes"
  ON play_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM playbooks pb
      INNER JOIN team_members tm ON tm.team_id = pb.team_id
      WHERE pb.id = play_assignments.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role = 'player'
    )
    AND created_by = auth.uid()
  );

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE play_assignments IS 'Stores position-specific assignments and instructions for plays. Coaches create assignments, players view them.';
COMMENT ON COLUMN play_assignments.position IS 'Position name (e.g., QB, RB, WR1). Dynamic based on personnel grouping.';
COMMENT ON COLUMN play_assignments.assignment_text IS 'The instruction/assignment for this position on this play.';
COMMENT ON COLUMN play_assignments.player_tags IS 'JSON array of player IDs mentioned/tagged in this assignment.';
COMMENT ON COLUMN play_assignments.hashtags IS 'JSON array of hashtags for categorization and search.';
COMMENT ON COLUMN play_assignments.play_notes IS 'General notes about the entire play (shared across all positions).';
