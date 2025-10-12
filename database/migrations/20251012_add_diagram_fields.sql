-- Migration: Add diagram fields to plays table
-- Date: October 12, 2025
-- Purpose: Add JSONB diagram storage and version tracking to support DiagramEditor

BEGIN;

-- Add diagram_data column (JSONB for structured diagram documents)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_data JSONB;

-- Add diagram_version column (track diagram format version 1-10)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_version INTEGER;

-- Verify diagram_url exists (should already be there, but add if missing)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_url TEXT;

-- Add created_by if missing (required by Play TypeScript interface)
-- Note: This may fail if column already exists with NOT NULL constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plays' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE plays ADD COLUMN created_by TEXT NOT NULL DEFAULT 'system';
  END IF;
END $$;

-- Add is_archived if missing (for soft delete support)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create GIN indexes for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_plays_diagram_data 
ON plays USING GIN (diagram_data);

-- Index for querying plays by player positions in diagram
CREATE INDEX IF NOT EXISTS idx_plays_diagram_players 
ON plays USING GIN ((diagram_data->'players'));

-- Index for version-based queries (useful for migrations)
CREATE INDEX IF NOT EXISTS idx_plays_diagram_version 
ON plays (diagram_version)
WHERE diagram_version IS NOT NULL;

-- Add helpful column comments
COMMENT ON COLUMN plays.diagram_data IS 
'JSONB diagram document (version 2+). Contains players array, routes, field settings (hash marks, yard lines), and drawing elements. Queried using GIN index for performance.';

COMMENT ON COLUMN plays.diagram_version IS 
'Diagram format version number (1-10). Used for backward compatibility during format migrations. Version 1 = simple array, Version 2+ = structured document with metadata.';

COMMENT ON COLUMN plays.diagram_url IS 
'PNG thumbnail image URL only (e.g., from Supabase Storage). Do NOT store diagram JSON here. Use diagram_data field for actual diagram structure.';

COMMIT;

-- Verification query (run after migration)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'plays'
--   AND column_name IN ('diagram_data', 'diagram_version', 'diagram_url', 'created_by', 'is_archived')
-- ORDER BY column_name;
