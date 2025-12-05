-- Migration: Remove play type constraint to allow custom play types
-- Date: 2025-12-04
-- Description: Removes the CHECK constraint on p_type column and updates the validation trigger
--              to allow coaches to create custom play types beyond the original 4

-- Step 1: Drop the CHECK constraint on the plays table
-- First, we need to find and drop the constraint
-- PostgreSQL names CHECK constraints automatically, so we need to find it first
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name for p_type CHECK
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'plays' 
    AND con.contype = 'c' 
    AND pg_get_constraintdef(con.oid) LIKE '%p_type%';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE plays DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END IF;
END $$;

-- Step 2: Update the validate_play_data trigger function to remove p_type validation
-- This allows any non-empty string as a play type
CREATE OR REPLACE FUNCTION validate_play_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Required fields validation
    IF NEW.play_name IS NULL OR trim(NEW.play_name) = '' THEN
        RAISE EXCEPTION 'Play name cannot be empty';
    END IF;

    IF length(trim(NEW.play_name)) > 200 THEN
        RAISE EXCEPTION 'Play name cannot exceed 200 characters';
    END IF;

    -- Play type validation - now just checks it's not empty
    IF NEW.p_type IS NULL OR trim(NEW.p_type) = '' THEN
        RAISE EXCEPTION 'Play type cannot be empty';
    END IF;

    IF length(trim(NEW.p_type)) > 50 THEN
        RAISE EXCEPTION 'Play type cannot exceed 50 characters';
    END IF;

    -- Direction validation
    IF NEW.f_dir IS NOT NULL AND NEW.f_dir NOT IN ('L', 'R', 'Left', 'Right', 'left', 'right') THEN
        RAISE EXCEPTION 'Formation direction must be valid (L, R, Left, Right, left, right, or null)';
    END IF;

    IF NEW.p_dir IS NOT NULL AND NEW.p_dir NOT IN ('L', 'R', 'Left', 'Right', 'left', 'right') THEN
        RAISE EXCEPTION 'Play direction must be valid (L, R, Left, Right, left, right, or null)';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the change
COMMENT ON COLUMN plays.p_type IS 'Play type (e.g., Pass, Run, RPO, Play Action, Screen, Option, Draw, Boot, etc.) - custom types allowed';
