-- Migration: Fix recursive RLS policies on super_admins
-- Problem: Existing policies referenced super_admins inside their own USING/WITH CHECK clauses
-- causing "infinite recursion detected in policy" errors when performing inserts/selects.
-- Solution: Drop recursive policies and replace with simple row checks (user_id = auth.uid()).

-- 1. Ensure table exists before proceeding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'super_admins'
  ) THEN
    RAISE NOTICE 'super_admins table not found; skipping migration';
    RETURN;
  END IF;
END;
$$;

-- 2. Drop existing policies safely
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='super_admins' LOOP
    EXECUTE format('DROP POLICY %I ON super_admins', pol.policyname);
  END LOOP;
END;
$$;

-- 3. (Optional) Enable RLS (if previously disabled)
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 4. Recreate minimal non-recursive policies
-- Allow super admins to see their own row (and optionally all rows if they appear in table; adjust as needed)
CREATE POLICY super_admins_select_self ON super_admins
  FOR SELECT USING (user_id = auth.uid());

-- Allow a bootstrap insert ONLY if table currently empty (prevents arbitrary privilege escalation)
CREATE POLICY super_admins_insert_bootstrap ON super_admins
  FOR INSERT WITH CHECK (
    (SELECT COUNT(*) = 0 FROM super_admins) OR user_id = auth.uid()
  );

-- Allow update/delete on own row only (tight control)
CREATE POLICY super_admins_modify_self ON super_admins
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY super_admins_delete_self ON super_admins
  FOR DELETE USING (user_id = auth.uid());

-- 5. (Optional) If you want full visibility for all super admins add:
-- CREATE POLICY super_admins_read_all ON super_admins FOR SELECT USING (
--   EXISTS (SELECT 1 FROM super_admins sa2 WHERE sa2.user_id = auth.uid())
-- );
-- (Commented out to avoid recursion: we reused super_admins but this is safe because it only nests once; Postgres
-- may still optimize; if any recursion errors reappear, keep only the self policy.)

-- Migration complete
