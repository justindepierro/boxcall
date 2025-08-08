-- Custom Fields Enhancement Migration
-- Adds flexible custom field support to plays and team-level field definitions

-- Add custom fields support to plays table
ALTER TABLE plays 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_rate NUMERIC,
ADD COLUMN IF NOT EXISTS diagram_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create custom field definitions table for team-specific templates
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'boolean', 'select', 'multi_select', 'date', 'url')),
  field_label TEXT NOT NULL,
  field_description TEXT,
  field_options JSONB, -- For select/multi_select types: ["Option 1", "Option 2"]
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general', -- 'formation', 'execution', 'analysis', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, field_name)
);

-- Create indexes for custom fields
CREATE INDEX IF NOT EXISTS idx_plays_custom_fields ON plays USING GIN(custom_fields);
CREATE INDEX IF NOT EXISTS idx_plays_tags ON plays USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_team ON custom_field_definitions(team_id, category, display_order);

-- Insert some common custom field templates for new teams
INSERT INTO custom_field_definitions (team_id, field_name, field_type, field_label, field_description, category, display_order)
SELECT 
  t.id,
  unnest(ARRAY['coach_rating', 'install_date', 'last_practiced', 'scout_notes', 'weather_conditions', 'field_condition']),
  unnest(ARRAY['number', 'date', 'date', 'text', 'select', 'select']),
  unnest(ARRAY['Coach Rating (1-10)', 'Install Date', 'Last Practiced', 'Scout Notes', 'Weather Preference', 'Field Condition']),
  unnest(ARRAY['Rate this play 1-10 for execution difficulty', 'When was this play first installed?', 'Last date this play was practiced', 'Notes from film study/scouting', 'Best weather conditions for this play', 'Best field condition for execution']),
  unnest(ARRAY['analysis', 'tracking', 'tracking', 'analysis', 'conditions', 'conditions']),
  unnest(ARRAY[1, 2, 3, 4, 5, 6])
FROM teams t
WHERE NOT EXISTS (
  SELECT 1 FROM custom_field_definitions cfd WHERE cfd.team_id = t.id
);

-- Set field options for select fields
UPDATE custom_field_definitions 
SET field_options = '["Sunny/Dry", "Light Rain", "Heavy Rain", "Snow", "Wind 15+mph", "Any"]'::jsonb
WHERE field_name = 'weather_conditions';

UPDATE custom_field_definitions 
SET field_options = '["Natural Grass", "Artificial Turf", "Wet Field", "Muddy Field", "Any"]'::jsonb
WHERE field_name = 'field_condition';

-- Update search vector to include custom fields and tags
-- Note: Using a trigger-based approach since generated columns can't use to_tsvector
DROP INDEX IF EXISTS idx_plays_search;
ALTER TABLE plays DROP COLUMN IF EXISTS search_vector CASCADE;

-- Add search_vector column (not generated)
ALTER TABLE plays ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_plays_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.play_name, '') || ' ' || 
    COALESCE(NEW.formation, '') || ' ' || 
    COALESCE(NEW.p_type, '') || ' ' ||
    COALESCE(NEW.notes, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(NEW.custom_fields::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
DROP TRIGGER IF EXISTS plays_search_vector_update ON plays;
CREATE TRIGGER plays_search_vector_update
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW EXECUTE FUNCTION update_plays_search_vector();

-- Update existing plays search vectors
UPDATE plays SET search_vector = to_tsvector('english', 
  COALESCE(play_name, '') || ' ' || 
  COALESCE(formation, '') || ' ' || 
  COALESCE(p_type, '') || ' ' ||
  COALESCE(notes, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), '') || ' ' ||
  COALESCE(custom_fields::text, '')
);

CREATE INDEX idx_plays_search ON plays USING GIN(search_vector);

-- Add some example custom field data to existing plays (optional)
UPDATE plays 
SET 
  tags = CASE 
    WHEN formation ILIKE '%shotgun%' AND tags IS NULL THEN ARRAY['shotgun']
    WHEN formation ILIKE '%pistol%' AND tags IS NULL THEN ARRAY['pistol']
    WHEN p_type = 'Pass' AND tags IS NULL THEN ARRAY['passing']
    WHEN p_type = 'Run' AND tags IS NULL THEN ARRAY['rushing']
    ELSE COALESCE(tags, ARRAY[]::TEXT[])
  END,
  custom_fields = '{
    "coach_rating": 7,
    "last_practiced": "2024-08-01",
    "scout_notes": "Works well against 3-4 fronts"
  }'::jsonb
WHERE id IN (SELECT id FROM plays LIMIT 5);

COMMENT ON TABLE custom_field_definitions IS 'Team-specific custom field definitions for plays';
COMMENT ON COLUMN plays.custom_fields IS 'Flexible JSON storage for team-defined custom fields';
COMMENT ON COLUMN plays.tags IS 'Array of tags for categorization and searching';
