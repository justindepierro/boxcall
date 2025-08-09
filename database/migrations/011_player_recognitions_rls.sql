-- Migration 011: RLS & Integrity for player_recognitions
-- Applies row level security and immutability guard for key columns.
-- Safe to run once; uses DROP POLICY IF EXISTS for idempotence during development.

-- 1. Enable RLS
ALTER TABLE player_recognitions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-running (dev convenience)
DROP POLICY IF EXISTS player_recognitions_select ON player_recognitions;
DROP POLICY IF EXISTS player_recognitions_insert ON player_recognitions;
DROP POLICY IF EXISTS player_recognitions_update ON player_recognitions;
DROP POLICY IF EXISTS player_recognitions_delete ON player_recognitions;

-- 3. SELECT: Any authenticated user who is a member of the team
CREATE POLICY player_recognitions_select ON player_recognitions
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    )
  );

-- 4. INSERT: Coaching / staff roles only (head_coach, assistant_coach, coordinator, manager)
CREATE POLICY player_recognitions_insert ON player_recognitions
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
        AND tm.role IN ('head_coach','assistant_coach','coordinator','manager')
    )
  );

-- 5. UPDATE: Same restriction + cannot change team_id
CREATE POLICY player_recognitions_update ON player_recognitions
  FOR UPDATE TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
        AND tm.role IN ('head_coach','assistant_coach','coordinator','manager')
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
        AND tm.role IN ('head_coach','assistant_coach','coordinator','manager')
    )
  );

-- 6. DELETE: Same as update
CREATE POLICY player_recognitions_delete ON player_recognitions
  FOR DELETE TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm 
      WHERE tm.user_id = auth.uid() 
        AND tm.role IN ('head_coach','assistant_coach','coordinator','manager')
    )
  );

-- 7. Immutable column protection (recognition_type, source_table)
DROP FUNCTION IF EXISTS enforce_player_recognitions_immutable();
CREATE FUNCTION enforce_player_recognitions_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.recognition_type <> OLD.recognition_type THEN
      RAISE EXCEPTION 'recognition_type is immutable';
    END IF;
    IF NEW.source_table IS DISTINCT FROM OLD.source_table THEN
      RAISE EXCEPTION 'source_table is immutable';
    END IF;
    IF NEW.team_id <> OLD.team_id THEN
      RAISE EXCEPTION 'team_id cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_player_recognitions_immutable ON player_recognitions;
CREATE TRIGGER trg_player_recognitions_immutable
  BEFORE UPDATE ON player_recognitions
  FOR EACH ROW EXECUTE FUNCTION enforce_player_recognitions_immutable();

COMMENT ON POLICY player_recognitions_select ON player_recognitions IS 'Team members can view recognitions for their teams';
COMMENT ON POLICY player_recognitions_insert ON player_recognitions IS 'Coaching roles can insert new recognitions';
COMMENT ON POLICY player_recognitions_update ON player_recognitions IS 'Coaching roles can update (immutable columns guarded)';
COMMENT ON POLICY player_recognitions_delete ON player_recognitions IS 'Coaching roles can delete recognitions';
