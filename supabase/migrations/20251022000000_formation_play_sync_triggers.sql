-- Migration: Formation-Play Synchronization Triggers
-- Description: Ensures data integrity between formations and plays tables
-- Date: 2025-10-22

-- Helper function to extract base formation name (remove direction keywords)
CREATE OR REPLACE FUNCTION extract_base_formation_name(formation_text TEXT)
RETURNS TEXT AS $$
DECLARE
  words TEXT[];
  result_words TEXT[] := ARRAY[]::TEXT[];
  word TEXT;
  direction_keywords TEXT[] := ARRAY['left', 'right', 'l', 'r', 'lt', 'rt', 'lft', 'rgt', 'middle', 'mid', 'center', 'c'];
BEGIN
  IF formation_text IS NULL OR formation_text = '' THEN
    RETURN '';
  END IF;

  -- Split into words and filter out direction keywords
  words := regexp_split_to_array(lower(formation_text), '\s+');

  FOREACH word IN ARRAY words LOOP
    IF NOT (word = ANY(direction_keywords)) THEN
      result_words := array_append(result_words, word);
    END IF;
  END LOOP;

  RETURN array_to_string(result_words, ' ');
END;
$$ LANGUAGE plpgsql;

-- Function to sync formation_id and direction when formation is updated
CREATE OR REPLACE FUNCTION sync_formation_play_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all plays that reference this formation
    UPDATE plays
    SET
        formation_id = NEW.id,
        f_dir = NEW.direction
    WHERE formation_id = OLD.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle formation deletion (set plays to null or handle gracefully)
CREATE OR REPLACE FUNCTION handle_formation_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Option 1: Set formation_id to null (allows plays to exist without formation)
    UPDATE plays
    SET formation_id = NULL
    WHERE formation_id = OLD.id;

    -- Option 2: Delete associated plays (uncomment if preferred)
    -- DELETE FROM plays WHERE formation_id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to sync formation_id when plays.formation TEXT changes
CREATE OR REPLACE FUNCTION sync_plays_formation_id()
RETURNS TRIGGER AS $$
DECLARE
  base_formation_name TEXT;
BEGIN
  -- Only process if formation TEXT field is set
  IF NEW.formation IS NOT NULL AND NEW.formation != '' THEN
    -- Extract base formation name (remove direction keywords)
    base_formation_name := extract_base_formation_name(NEW.formation);

    -- Try to find matching formation by base name in the same playbook
    SELECT f.id, f.direction INTO NEW.formation_id, NEW.f_dir
    FROM formations f
    WHERE f.playbook_id = NEW.playbook_id
      AND lower(f.name) = lower(base_formation_name)
    LIMIT 1;

    -- If no match found, set to NULL (formation might not exist yet)
    IF NOT FOUND THEN
      NEW.formation_id := NULL;
      NEW.f_dir := NULL;
    END IF;
  ELSE
    -- Clear formation_id if formation TEXT is cleared
    NEW.formation_id := NULL;
    NEW.f_dir := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

    -- Function to validate formation-play relationships
CREATE OR REPLACE FUNCTION validate_formation_play_sync()
RETURNS TRIGGER AS $$
DECLARE
  base_formation_name TEXT;
BEGIN
    -- Ensure direction consistency
    IF NEW.formation_id IS NOT NULL THEN
        -- Check if formation exists and get its direction
        IF NOT EXISTS (
            SELECT 1 FROM formations
            WHERE id = NEW.formation_id
            AND direction = NEW.f_dir
        ) THEN
            RAISE EXCEPTION 'Formation % does not exist or direction mismatch', NEW.formation_id;
        END IF;
    END IF;

    -- Also validate formation TEXT field matches
    IF NEW.formation IS NOT NULL AND NEW.formation != '' THEN
        base_formation_name := extract_base_formation_name(NEW.formation);

        IF NOT EXISTS (
            SELECT 1 FROM formations
            WHERE id = NEW.formation_id
            AND lower(name) = lower(base_formation_name)
        ) THEN
            RAISE EXCEPTION 'Formation name "%" does not match formation ID %', NEW.formation, NEW.formation_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for formation table
DROP TRIGGER IF EXISTS formation_sync_trigger ON formations;
CREATE TRIGGER formation_sync_trigger
    AFTER UPDATE ON formations
    FOR EACH ROW
    WHEN (OLD.id != NEW.id OR OLD.direction != NEW.direction)
    EXECUTE FUNCTION sync_formation_play_data();

DROP TRIGGER IF EXISTS formation_deletion_trigger ON formations;
CREATE TRIGGER formation_deletion_trigger
    BEFORE DELETE ON formations
    FOR EACH ROW
    EXECUTE FUNCTION handle_formation_deletion();

-- Triggers for plays table
DROP TRIGGER IF EXISTS play_validation_trigger ON plays;
CREATE TRIGGER play_validation_trigger
    BEFORE INSERT OR UPDATE ON plays
    FOR EACH ROW
    EXECUTE FUNCTION validate_formation_play_sync();

DROP TRIGGER IF EXISTS sync_plays_formation_id_trigger ON plays;
CREATE TRIGGER sync_plays_formation_id_trigger
    BEFORE INSERT OR UPDATE OF formation ON plays
    FOR EACH ROW
    EXECUTE FUNCTION sync_plays_formation_id();

-- Backfill existing data to ensure consistency
UPDATE plays
SET f_dir = formations.direction
FROM formations
WHERE plays.formation_id = formations.id
AND plays.f_dir != formations.direction;

-- Add helpful comments
COMMENT ON FUNCTION sync_formation_play_data() IS 'Synchronizes formation_id and direction changes to all associated plays';
COMMENT ON FUNCTION handle_formation_deletion() IS 'Handles formation deletion by nullifying formation_id in plays';
COMMENT ON FUNCTION validate_formation_play_sync() IS 'Validates formation-play relationships on insert/update';