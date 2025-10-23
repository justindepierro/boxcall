-- Migration: Data Validation Constraints
-- Description: Adds comprehensive server-side validation constraints and triggers
-- Date: 2025-10-22

-- =====================================================
-- FORMATION VALIDATION CONSTRAINTS
-- =====================================================

-- Function to validate formation data on insert/update
CREATE OR REPLACE FUNCTION validate_formation_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Name validation
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
        RAISE EXCEPTION 'Formation name cannot be empty';
    END IF;

    IF length(trim(NEW.name)) > 100 THEN
        RAISE EXCEPTION 'Formation name cannot exceed 100 characters';
    END IF;

    -- Direction validation
    IF NEW.direction IS NOT NULL AND NEW.direction NOT IN ('left', 'right') THEN
        RAISE EXCEPTION 'Formation direction must be "left", "right", or NULL';
    END IF;

    -- Player positions validation
    IF NEW.player_positions IS NULL OR jsonb_array_length(NEW.player_positions) = 0 THEN
        RAISE EXCEPTION 'Formation must have at least one player position';
    END IF;

    -- Strength validation
    IF NEW.run_strength NOT IN ('left', 'right', 'balanced') THEN
        RAISE EXCEPTION 'Run strength must be "left", "right", or "balanced"';
    END IF;

    IF NEW.pass_strength NOT IN ('left', 'right', 'balanced') THEN
        RAISE EXCEPTION 'Pass strength must be "left", "right", or "balanced"';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for formation validation
DROP TRIGGER IF EXISTS formation_validation_trigger ON formations;
CREATE TRIGGER formation_validation_trigger
    BEFORE INSERT OR UPDATE ON formations
    FOR EACH ROW
    EXECUTE FUNCTION validate_formation_data();

-- =====================================================
-- PLAY VALIDATION CONSTRAINTS
-- =====================================================

-- Function to validate play data on insert/update
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

    -- Play type validation
    IF NEW.p_type NOT IN ('Pass', 'Run', 'RPO', 'Play Action') THEN
        RAISE EXCEPTION 'Play type must be one of: Pass, Run, RPO, Play Action';
    END IF;

    -- Direction validation
    IF NEW.f_dir IS NOT NULL AND NEW.f_dir NOT IN ('L', 'R', 'Left', 'Right', 'left', 'right') THEN
        RAISE EXCEPTION 'Formation direction must be valid (L, R, Left, Right, left, right, or null)';
    END IF;

    IF NEW.p_dir IS NOT NULL AND NEW.p_dir NOT IN ('L', 'R', 'Left', 'Right', 'left', 'right') THEN
        RAISE EXCEPTION 'Play direction must be valid (L, R, Left, Right, left, right, or null)';
    END IF;

    -- Confidence validation
    IF NEW.confidence_base IS NOT NULL AND (NEW.confidence_base < 0 OR NEW.confidence_base > 100) THEN
        RAISE EXCEPTION 'Confidence must be between 0 and 100';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for play validation
DROP TRIGGER IF EXISTS play_validation_trigger ON plays;
CREATE TRIGGER play_validation_trigger
    BEFORE INSERT OR UPDATE ON plays
    FOR EACH ROW
    EXECUTE FUNCTION validate_play_data();

-- =====================================================
-- PERSONNEL VALIDATION CONSTRAINTS
-- =====================================================

-- Function to validate personnel configuration data
CREATE OR REPLACE FUNCTION validate_personnel_data()
RETURNS TRIGGER AS $$
DECLARE
    qb_count INTEGER;
    duplicate_labels INTEGER;
BEGIN
    -- Name validation
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
        RAISE EXCEPTION 'Personnel configuration name cannot be empty';
    END IF;

    IF length(trim(NEW.name)) > 10 THEN
        RAISE EXCEPTION 'Personnel name cannot exceed 10 characters';
    END IF;

    -- Name should be numeric
    IF NOT (NEW.name ~ '^[0-9]+$') THEN
        RAISE EXCEPTION 'Personnel name should be numeric (e.g., "11", "12")';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for personnel validation
DROP TRIGGER IF EXISTS personnel_validation_trigger ON personnel_configurations;
CREATE TRIGGER personnel_validation_trigger
    BEFORE INSERT OR UPDATE ON personnel_configurations
    FOR EACH ROW
    EXECUTE FUNCTION validate_personnel_data();

-- Function to validate personnel players
CREATE OR REPLACE FUNCTION validate_personnel_players()
RETURNS TRIGGER AS $$
DECLARE
    qb_count INTEGER;
    duplicate_labels INTEGER;
BEGIN
    -- Position validation
    IF NEW.player_position NOT IN ('QB', 'RB', 'TE', 'WR') THEN
        RAISE EXCEPTION 'Player position must be one of: QB, RB, TE, WR';
    END IF;

    -- Label validation
    IF NEW.label IS NULL OR trim(NEW.label) = '' THEN
        RAISE EXCEPTION 'Player label cannot be empty';
    END IF;

    IF length(trim(NEW.label)) > 3 THEN
        RAISE WARNING 'Player label "%" is long (max 3 characters recommended)', NEW.label;
    END IF;

    -- QB validation (must be sort_order 0)
    IF NEW.player_position = 'QB' AND NEW.sort_order != 0 THEN
        RAISE EXCEPTION 'QB must have sort_order = 0';
    END IF;

    -- Check for duplicate labels in same configuration
    SELECT COUNT(*) INTO duplicate_labels
    FROM personnel_players
    WHERE config_id = NEW.config_id
      AND label = NEW.label
      AND id != COALESCE(NEW.id, '');

    IF duplicate_labels > 0 THEN
        RAISE EXCEPTION 'Duplicate player label "%" in personnel configuration', NEW.label;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for personnel players validation
DROP TRIGGER IF EXISTS personnel_players_validation_trigger ON personnel_players;
CREATE TRIGGER personnel_players_validation_trigger
    BEFORE INSERT OR UPDATE ON personnel_players
    FOR EACH ROW
    EXECUTE FUNCTION validate_personnel_players();

-- =====================================================
-- TEAM VALIDATION CONSTRAINTS
-- =====================================================

-- Function to validate team data
CREATE OR REPLACE FUNCTION validate_team_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Name validation
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
        RAISE EXCEPTION 'Team name cannot be empty';
    END IF;

    IF length(trim(NEW.name)) > 100 THEN
        RAISE EXCEPTION 'Team name cannot exceed 100 characters';
    END IF;

    -- Season year validation
    IF NEW.season_year IS NOT NULL THEN
        IF NEW.season_year < 2000 OR NEW.season_year > extract(year from now()) + 10 THEN
            RAISE EXCEPTION 'Season year must be between 2000 and %', extract(year from now()) + 10;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for team validation
DROP TRIGGER IF EXISTS team_validation_trigger ON teams;
CREATE TRIGGER team_validation_trigger
    BEFORE INSERT OR UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION validate_team_data();

-- =====================================================
-- CROSS-REFERENCE VALIDATION
-- =====================================================

-- Function to validate formation-play references
CREATE OR REPLACE FUNCTION validate_formation_play_references()
RETURNS TRIGGER AS $$
BEGIN
    -- If formation_id is set, ensure formation exists and belongs to same playbook
    IF NEW.formation_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM formations
            WHERE id = NEW.formation_id
              AND playbook_id = NEW.playbook_id
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Referenced formation does not exist or belongs to different playbook';
        END IF;
    END IF;

    -- If personnel_id is set, ensure personnel exists and belongs to same playbook
    IF NEW.personnel_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM personnel_configurations
            WHERE id = NEW.personnel_id
              AND playbook_id = NEW.playbook_id
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Referenced personnel configuration does not exist or belongs to different playbook';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for formation-play reference validation
DROP TRIGGER IF EXISTS formation_play_reference_trigger ON plays;
CREATE TRIGGER formation_play_reference_trigger
    BEFORE INSERT OR UPDATE ON plays
    FOR EACH ROW
    EXECUTE FUNCTION validate_formation_play_references();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes to support validation queries
CREATE INDEX IF NOT EXISTS idx_formations_playbook_name ON formations(playbook_id, lower(trim(name)));
CREATE INDEX IF NOT EXISTS idx_personnel_configurations_playbook_name ON personnel_configurations(playbook_id, lower(trim(name)));
CREATE INDEX IF NOT EXISTS idx_plays_formation_id ON plays(formation_id);
CREATE INDEX IF NOT EXISTS idx_plays_personnel_id ON plays(personnel_id);
CREATE INDEX IF NOT EXISTS idx_personnel_players_config_label ON personnel_players(config_id, lower(trim(label)));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION validate_formation_data() IS 'Validates formation data integrity before insert/update';
COMMENT ON FUNCTION validate_play_data() IS 'Validates play data integrity before insert/update';
COMMENT ON FUNCTION validate_personnel_data() IS 'Validates personnel configuration data before insert/update';
COMMENT ON FUNCTION validate_personnel_players() IS 'Validates personnel player data before insert/update';
COMMENT ON FUNCTION validate_team_data() IS 'Validates team data integrity before insert/update';
COMMENT ON FUNCTION validate_formation_play_references() IS 'Validates cross-references between formations, personnel, and plays';