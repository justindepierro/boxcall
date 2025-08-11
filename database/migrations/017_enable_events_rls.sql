-- 017_enable_events_rls.sql
-- Purpose: Secure events table with basic row level security policies.
-- Strategy:
--  * Enable RLS
--  * Allow authenticated users to INSERT their own events (no user_id spoofing check yet – kept simple)
--  * Allow selecting only via service role (or future analytics role) – regular clients do not query events directly.
--  * Future: add policy for users to read only their own events if needed.

BEGIN;

ALTER TABLE events ENABLE ROW LEVEL SECURITY; -- idempotent

-- Idempotent creation of insert policy (CREATE POLICY lacks IF NOT EXISTS in PG <16)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'events'
      AND policyname = 'events_insert_auth'
  ) THEN
    EXECUTE 'CREATE POLICY events_insert_auth ON public.events FOR INSERT TO authenticated WITH CHECK (true)'; -- (optionally: user_id = auth.uid())
  END IF;
END;
$$;

-- Policy: service role (bypasses RLS) will handle analytics querying.
-- Optional read policy placeholder (disabled by default):
-- CREATE POLICY IF NOT EXISTS "events_select_self" ON events
--   FOR SELECT
--   TO authenticated
--   USING (user_id IS NULL OR user_id = auth.uid());

COMMIT;
