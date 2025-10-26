-- Add version control system for diagram data
-- Enables history tracking, branching, and rollback capabilities for plays

-- Create play_versions table to store historical versions
CREATE TABLE play_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  diagram_data JSONB NOT NULL,
  change_description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure version numbers are sequential per play
  UNIQUE(play_id, version_number)
);

-- Add version tracking columns to plays table
ALTER TABLE plays
ADD COLUMN current_version INTEGER DEFAULT 1,
ADD COLUMN version_created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN version_created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_play_versions_play_id ON play_versions(play_id);
CREATE INDEX idx_play_versions_created_at ON play_versions(created_at DESC);
CREATE INDEX idx_plays_current_version ON plays(current_version);

-- Create function to automatically create version on diagram_data update
CREATE OR REPLACE FUNCTION create_play_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if diagram_data actually changed
  IF OLD.diagram_data IS DISTINCT FROM NEW.diagram_data THEN
    -- Increment version number
    NEW.current_version := COALESCE(OLD.current_version, 0) + 1;
    NEW.version_created_at := NOW();
    NEW.version_created_by := auth.uid();

    -- Insert the old version into play_versions
    INSERT INTO play_versions (
      play_id,
      version_number,
      diagram_data,
      change_description,
      created_by
    ) VALUES (
      OLD.id,
      NEW.current_version,
      OLD.diagram_data,
      'Auto-saved version before update',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically version diagram changes
CREATE TRIGGER trigger_create_play_version
  BEFORE UPDATE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION create_play_version();

-- Create function to manually create a version with description
CREATE OR REPLACE FUNCTION create_named_play_version(
  p_play_id UUID,
  p_description TEXT DEFAULT 'Manual version save'
)
RETURNS INTEGER AS $$
DECLARE
  v_current_version INTEGER;
  v_diagram_data JSONB;
BEGIN
  -- Get current play data
  SELECT current_version, diagram_data
  INTO v_current_version, v_diagram_data
  FROM plays
  WHERE id = p_play_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Play not found';
  END IF;

  -- Create new version
  INSERT INTO play_versions (
    play_id,
    version_number,
    diagram_data,
    change_description,
    created_by
  ) VALUES (
    p_play_id,
    v_current_version + 1,
    v_diagram_data,
    p_description,
    auth.uid()
  );

  -- Update play version
  UPDATE plays
  SET
    current_version = v_current_version + 1,
    version_created_at = NOW(),
    version_created_by = auth.uid()
  WHERE id = p_play_id;

  RETURN v_current_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to rollback to a specific version
CREATE OR REPLACE FUNCTION rollback_play_to_version(
  p_play_id UUID,
  p_version_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_version_data JSONB;
BEGIN
  -- Get the version data
  SELECT diagram_data
  INTO v_version_data
  FROM play_versions
  WHERE play_id = p_play_id AND version_number = p_version_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version not found';
  END IF;

  -- Update the play with the version data
  UPDATE plays
  SET
    diagram_data = v_version_data,
    current_version = p_version_number,
    version_created_at = NOW(),
    version_created_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_play_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for play_versions
ALTER TABLE play_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of plays they have access to
CREATE POLICY "Users can view play versions" ON play_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM plays p
      JOIN playbooks pb ON p.playbook_id = pb.id
      JOIN team_members tm ON pb.team_id = tm.team_id
      WHERE p.id = play_versions.play_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Users can create versions for plays they can edit
CREATE POLICY "Users can create play versions" ON play_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM plays p
      JOIN playbooks pb ON p.playbook_id = pb.id
      JOIN team_members tm ON pb.team_id = tm.team_id
      WHERE p.id = play_versions.play_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.capabilities->>'can_manage_playbook' = 'true'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE play_versions IS 'Historical versions of play diagrams for version control and rollback';
COMMENT ON COLUMN play_versions.version_number IS 'Sequential version number for this play (1, 2, 3, etc.)';
COMMENT ON COLUMN play_versions.change_description IS 'Optional description of what changed in this version';
COMMENT ON COLUMN plays.current_version IS 'Current version number of the diagram';
COMMENT ON COLUMN plays.version_created_at IS 'When the current version was created';
COMMENT ON COLUMN plays.version_created_by IS 'Who created the current version';