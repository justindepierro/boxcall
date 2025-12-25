-- Align playbook/play write RLS with centralized coaching helper
--
-- Problem:
-- Some environments still have write policies that do not consult
-- `public.is_coaching_team_member(...)` (or omit newer roles like 'coach'),
-- leading to "can SELECT but cannot UPDATE" behavior.
--
-- Fix:
-- Update whichever policy set exists (legacy or "bulletproof") so that
-- playbooks + plays writes are authorized by `public.is_coaching_team_member`.
--
-- Notes:
-- - This is intentionally conditional and idempotent.
-- - Uses (SELECT auth.uid()) to encourage initplan caching.

DO $$
BEGIN
  -- ---------------------------------------------------------------------------
  -- PLAYS (bulletproof policy names)
  -- ---------------------------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
      AND policyname = 'plays_update_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "plays_update_bulletproof" ON public.plays
      USING (
        public.is_coaching_team_member(
          (SELECT auth.uid()),
          public.get_playbook_team_id(plays.playbook_id)
        )
      )
      WITH CHECK (
        public.is_coaching_team_member(
          (SELECT auth.uid()),
          public.get_playbook_team_id(plays.playbook_id)
        )
      )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
      AND policyname = 'plays_insert_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "plays_insert_bulletproof" ON public.plays
      WITH CHECK (
        public.is_coaching_team_member(
          (SELECT auth.uid()),
          public.get_playbook_team_id(plays.playbook_id)
        )
      )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
      AND policyname = 'plays_delete_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "plays_delete_bulletproof" ON public.plays
      USING (
        public.is_coaching_team_member(
          (SELECT auth.uid()),
          public.get_playbook_team_id(plays.playbook_id)
        )
      )
    $sql$;
  END IF;

  -- ---------------------------------------------------------------------------
  -- PLAYS (legacy policy name)
  -- ---------------------------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
      AND policyname = 'Team coaches can manage plays'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage plays" ON public.plays$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage plays" ON public.plays
        FOR ALL
        USING (
          public.is_coaching_team_member(
            (SELECT auth.uid()),
            public.get_playbook_team_id(plays.playbook_id)
          )
        )
        WITH CHECK (
          public.is_coaching_team_member(
            (SELECT auth.uid()),
            public.get_playbook_team_id(plays.playbook_id)
          )
        )
    $sql$;
  END IF;

  -- ---------------------------------------------------------------------------
  -- PLAYBOOKS (bulletproof policy names)
  -- ---------------------------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbooks'
      AND policyname = 'playbooks_update_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "playbooks_update_bulletproof" ON public.playbooks
      USING (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
      WITH CHECK (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbooks'
      AND policyname = 'playbooks_insert_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "playbooks_insert_bulletproof" ON public.playbooks
      WITH CHECK (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbooks'
      AND policyname = 'playbooks_delete_bulletproof'
  ) THEN
    EXECUTE $sql$
      ALTER POLICY "playbooks_delete_bulletproof" ON public.playbooks
      USING (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
    $sql$;
  END IF;

  -- ---------------------------------------------------------------------------
  -- PLAYBOOKS (legacy policy name)
  -- ---------------------------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbooks'
      AND policyname = 'Team coaches can manage playbooks'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage playbooks" ON public.playbooks$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage playbooks" ON public.playbooks
        FOR ALL
        USING (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
        WITH CHECK (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
    $sql$;
  END IF;
END
$$;
