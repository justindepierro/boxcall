-- Migration: Add wristband_number field to plays table
-- Created: October 19, 2025
-- Purpose: Add wristband communication number for coaches using wristband systems

-- Add wristband_number column to plays table
ALTER TABLE plays
ADD COLUMN wristband_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN plays.wristband_number IS 'Wristband communication number for coaches using wristband systems';
