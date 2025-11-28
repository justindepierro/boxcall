-- Relax formation player_positions constraint
-- Migration: 20251128130000_relax_formation_player_positions_constraint.sql
-- 
-- The original constraint required ALL formations to have player_positions defined.
-- This is too strict - many legacy formations and simple text-based formations
-- don't need detailed position data. We'll make it optional.

-- Replace the validation function to make player_positions optional
CREATE OR REPLACE FUNCTION validate_formation_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Name validation (still required)
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
        RAISE EXCEPTION 'Formation name cannot be empty';
    END IF;

    IF length(trim(NEW.name)) > 100 THEN
        RAISE EXCEPTION 'Formation name cannot exceed 100 characters';
    END IF;

    -- Direction validation (optional)
    IF NEW.direction IS NOT NULL AND NEW.direction NOT IN ('left', 'right') THEN
        RAISE EXCEPTION 'Formation direction must be "left", "right", or NULL';
    END IF;

    -- Player positions validation - NOW OPTIONAL
    -- Only validate if player_positions is provided and non-empty
    -- This allows legacy formations without detailed position data
    -- (No validation needed - can be NULL or empty array)

    -- Strength validation - only if columns exist and are provided
    IF NEW.run_strength IS NOT NULL AND NEW.run_strength NOT IN ('left', 'right', 'balanced') THEN
        RAISE EXCEPTION 'Run strength must be "left", "right", or "balanced"';
    END IF;

    IF NEW.pass_strength IS NOT NULL AND NEW.pass_strength NOT IN ('left', 'right', 'balanced') THEN
        RAISE EXCEPTION 'Pass strength must be "left", "right", or "balanced"';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger already exists from the previous migration, so no need to recreate it
-- It will automatically use the updated function
