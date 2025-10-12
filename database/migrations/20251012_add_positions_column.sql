-- Migration: Add missing positions column to formations table
-- Date: October 12, 2025
-- Purpose: Fix schema mismatch - add positions column that was missing from initial migration

-- Check current schema and add missing column
DO $$
BEGIN
  -- Add positions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' 
    AND column_name = 'positions'
  ) THEN
    ALTER TABLE formations 
    ADD COLUMN positions JSONB NOT NULL DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'Added positions column to formations table';
  ELSE
    RAISE NOTICE 'positions column already exists';
  END IF;

  -- Rename player_positions to positions if player_positions exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' 
    AND column_name = 'player_positions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' 
    AND column_name = 'positions'
  ) THEN
    ALTER TABLE formations 
    RENAME COLUMN player_positions TO positions;
    
    RAISE NOTICE 'Renamed player_positions to positions';
  END IF;

  -- Verify the fix
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' 
    AND column_name = 'positions'
  ) THEN
    RAISE NOTICE '✅ positions column exists - schema is correct!';
  ELSE
    RAISE EXCEPTION '❌ positions column still missing after migration!';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN formations.positions IS 'JSONB array of player positions with coordinates and labels (empty array initially, populated via canvas UI)';
