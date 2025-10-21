-- Migration: Add execution notes and tags
-- Phase 12.1: Execution Quality Notes
-- Allows coaches to add contextual notes and tags to play executions

-- Add notes and tags columns to play_executions
ALTER TABLE play_executions 
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for tag searches (useful for filtering by tags later)
CREATE INDEX IF NOT EXISTS idx_play_executions_tags 
  ON play_executions USING GIN (tags);

-- Add comment for documentation
COMMENT ON COLUMN play_executions.notes IS 'Optional coach notes about execution quality, context, or observations';
COMMENT ON COLUMN play_executions.tags IS 'Quick tags like great-blocking, missed-assignment, perfect-execution, etc.';

-- Common tags we expect (for reference, not enforced):
-- "great-blocking", "missed-assignment", "perfect-execution", "broken-tackle",
-- "great-catch", "dropped-pass", "good-protection", "pressure", "great-read",
-- "wrong-route", "adjustment-made", "audible", "hot-route", "check-with-me"
