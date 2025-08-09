-- Migration: Add created_by column to teams and align with production expectations
-- Purpose: Ensure teams rows record creator user id and support RLS policies
-- Safe to run multiple times? Partially (guard clauses used for column / index / policy existence where feasible)

-- 1. Add column if missing (simplified, IF NOT EXISTS supported on modern Postgres)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by UUID; -- temporarily nullable for backfill

-- 2. Backfill created_by using first associated team_members entry if available
WITH first_member AS (
  SELECT DISTINCT ON (team_id) team_id, user_id
  FROM team_members
  ORDER BY team_id, user_id -- stable deterministic first user per team
)
UPDATE teams t
SET created_by = f.user_id
FROM first_member f
WHERE t.id = f.team_id
  AND t.created_by IS NULL;

-- 2b. Fallback: if any teams still NULL (no members yet), optionally set to a system user UUID placeholder
-- You may replace the below UUID with an existing service/admin user id.
UPDATE teams
SET created_by = '00000000-0000-0000-0000-000000000001'
WHERE created_by IS NULL;

-- 3. Add foreign key constraint if not present (safe check without nested exception block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_created_by_fkey'
  ) THEN
    -- Ensure auth.users exists before attempting FK
    IF EXISTS (
      SELECT 1 FROM pg_catalog.pg_namespace n
      JOIN pg_catalog.pg_class c ON c.relnamespace = n.oid
      WHERE n.nspname = 'auth' AND c.relname = 'users'
    ) THEN
      EXECUTE 'ALTER TABLE public.teams ADD CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT';
    ELSE
      RAISE NOTICE 'Skipping FK creation for teams.created_by (auth.users missing)';
    END IF;
  END IF;
END;
$$;

-- 4. Make column NOT NULL (after backfill)
ALTER TABLE teams ALTER COLUMN created_by SET NOT NULL;

-- 5. Index for common access patterns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relname='idx_teams_created_by' AND n.nspname='public'
  ) THEN
    CREATE INDEX idx_teams_created_by ON teams(created_by);
  END IF;
END;
$$;

-- 6. Enable RLS if not already
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 7. Policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='teams_insert_own') THEN
    CREATE POLICY teams_insert_own ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='teams_select_members') THEN
    CREATE POLICY teams_select_members ON teams FOR SELECT USING (
      auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='teams_update_owner') THEN
    CREATE POLICY teams_update_owner ON teams FOR UPDATE USING (auth.uid() = created_by);
  END IF;
END;
$$;

-- 8. Optional: updated_at trigger for automatic timestamp maintenance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='trg_teams_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $bcupd$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $bcupd$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

-- 9. (Future) sport column placeholder - uncomment if/when needed
-- ALTER TABLE teams ADD COLUMN sport TEXT; -- Add appropriate constraint or enum if desired

-- Migration complete
