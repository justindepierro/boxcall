-- =============================================================================
-- Fix remaining multiple_permissive_policies (authenticated)
-- =============================================================================
--
-- Remaining lints are down to a small set of core tables where:
-- - Policies still include PUBLIC, which also applies to authenticated, and/or
-- - There are multiple permissive policies for authenticated for the same
--   action.
--
-- This migration is conservative but effective:
-- 1) For a known-safe set of team-data tables, remove PUBLIC/anon from policies.
-- 2) Split any PERMISSIVE FOR ALL policies into action-specific policies so we
--    can adjust authenticated without impacting other actions.
-- 3) For each (table, action), ensure only ONE policy applies to authenticated
--    by creating a merged authenticated policy and removing authenticated from
--    other policies.
-- =============================================================================

DO $$
DECLARE
  target_tables text[] := ARRAY[
    'achievements',
    'calendar_events',
    'equipment',
    'formations',
    'game_plan_plays',
    'game_plans',
    'game_results',
    'helmet_stickers',
    'personnel_configurations',
    'personnel_players',
    'playbooks',
    'plays',
    'practice_attendance',
    'practice_schedules',
    'practice_script_plays',
    'practice_scripts',
    'practice_templates',
    'team_announcements',
    'team_events',
    'team_members',
    'team_players',
    'team_posts',
    'teams'
  ];

  pol record;
  action text;
  pn text;

  roles_new text[];
  roles_sql text;

  split_name text;
  qual_expr text;
  check_expr text;

  pol_names text[];
  merged_using text;
  merged_check text;
  merged_name text;
  create_sql text;
BEGIN
  -- ---------------------------------------------------------------------------
  -- 1) Remove PUBLIC/anon from policies on these tables (team data only)
  -- ---------------------------------------------------------------------------
  FOR pol IN
    SELECT *
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY(target_tables)
      AND roles IS NOT NULL
      AND (array_position(roles, 'public') IS NOT NULL OR array_position(roles, 'anon') IS NOT NULL)
  LOOP
    roles_new := pol.roles;
    roles_new := array_remove(roles_new, 'public');
    roles_new := array_remove(roles_new, 'anon');

    IF roles_new IS NULL OR array_length(roles_new, 1) IS NULL THEN
      roles_new := ARRAY['authenticated'];
    ELSIF array_position(roles_new, 'authenticated') IS NULL THEN
      roles_new := array_append(roles_new, 'authenticated');
    END IF;

    SELECT string_agg(quote_ident(r), ', ')
    INTO roles_sql
    FROM unnest(roles_new) r;

    EXECUTE format('ALTER POLICY %I ON %I.%I TO %s', pol.policyname, pol.schemaname, pol.tablename, roles_sql);
  END LOOP;

  -- ---------------------------------------------------------------------------
  -- 2) Split any PERMISSIVE FOR ALL policies to avoid cross-action side effects
  -- ---------------------------------------------------------------------------
  FOR pol IN
    SELECT *
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY(target_tables)
      AND cmd = 'ALL'
      AND permissive IS DISTINCT FROM 'RESTRICTIVE'
  LOOP
    -- Use qual as USING; WITH CHECK defaults to USING if omitted.
    qual_expr := coalesce(pol.qual, 'TRUE');
    check_expr := coalesce(pol.with_check, pol.qual, 'TRUE');

    SELECT string_agg(CASE WHEN r = 'public' THEN 'PUBLIC' ELSE quote_ident(r) END, ', ')
    INTO roles_sql
    FROM unnest(pol.roles) r;

    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    split_name := left(pol.policyname || '__all_select', 63);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR SELECT %s USING (%s)',
      split_name, pol.schemaname, pol.tablename,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END,
      qual_expr
    );

    split_name := left(pol.policyname || '__all_insert', 63);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR INSERT %s WITH CHECK (%s)',
      split_name, pol.schemaname, pol.tablename,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END,
      check_expr
    );

    split_name := left(pol.policyname || '__all_update', 63);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR UPDATE %s USING (%s) WITH CHECK (%s)',
      split_name, pol.schemaname, pol.tablename,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END,
      qual_expr,
      check_expr
    );

    split_name := left(pol.policyname || '__all_delete', 63);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR DELETE %s USING (%s)',
      split_name, pol.schemaname, pol.tablename,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END,
      qual_expr
    );
  END LOOP;

  -- ---------------------------------------------------------------------------
  -- 3) For each (table, action), ensure a single policy applies to authenticated
  -- ---------------------------------------------------------------------------
  FOREACH action IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
    FOR pol IN
      SELECT DISTINCT schemaname, tablename
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = ANY(target_tables)
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
        AND cmd = action
        AND array_position(roles, 'authenticated') IS NOT NULL
    LOOP
      SELECT array_agg(policyname ORDER BY policyname)
      INTO pol_names
      FROM pg_policies
      WHERE schemaname = pol.schemaname
        AND tablename = pol.tablename
        AND cmd = action
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
        AND array_position(roles, 'authenticated') IS NOT NULL;

      IF pol_names IS NULL OR array_length(pol_names, 1) IS NULL OR array_length(pol_names, 1) <= 1 THEN
        CONTINUE;
      END IF;

      merged_using := NULL;
      merged_check := NULL;

      IF action IN ('SELECT', 'UPDATE', 'DELETE') THEN
        SELECT string_agg('(' || coalesce(qual, 'TRUE') || ')', ' OR ')
        INTO merged_using
        FROM pg_policies
        WHERE schemaname = pol.schemaname
          AND tablename = pol.tablename
          AND cmd = action
          AND policyname = ANY(pol_names)
          AND permissive IS DISTINCT FROM 'RESTRICTIVE'
          AND array_position(roles, 'authenticated') IS NOT NULL;
      END IF;

      IF action IN ('INSERT', 'UPDATE') THEN
        SELECT string_agg('(' || coalesce(with_check, qual, 'TRUE') || ')', ' OR ')
        INTO merged_check
        FROM pg_policies
        WHERE schemaname = pol.schemaname
          AND tablename = pol.tablename
          AND cmd = action
          AND policyname = ANY(pol_names)
          AND permissive IS DISTINCT FROM 'RESTRICTIVE'
          AND array_position(roles, 'authenticated') IS NOT NULL;
      END IF;

      -- Remove authenticated from existing policies (drop if it was the only role)
      FOREACH pn IN ARRAY pol_names LOOP
        SELECT roles INTO roles_new
        FROM pg_policies
        WHERE schemaname = pol.schemaname
          AND tablename = pol.tablename
          AND policyname = pn;

        roles_new := array_remove(roles_new, 'authenticated');

        IF roles_new IS NULL OR array_length(roles_new, 1) IS NULL THEN
          EXECUTE format('DROP POLICY %I ON %I.%I', pn, pol.schemaname, pol.tablename);
        ELSE
          SELECT string_agg(CASE WHEN r = 'public' THEN 'PUBLIC' ELSE quote_ident(r) END, ', ')
          INTO roles_sql
          FROM unnest(roles_new) r;

          EXECUTE format('ALTER POLICY %I ON %I.%I TO %s', pn, pol.schemaname, pol.tablename, roles_sql);
        END IF;
      END LOOP;

      merged_name := left('bc_auth_' || pol.tablename || '_' || lower(action) || '_final', 63);

      IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = pol.schemaname
          AND tablename = pol.tablename
          AND policyname = merged_name
      ) THEN
        EXECUTE format('DROP POLICY %I ON %I.%I', merged_name, pol.schemaname, pol.tablename);
      END IF;

      create_sql := format('CREATE POLICY %I ON %I.%I FOR %s TO authenticated',
        merged_name, pol.schemaname, pol.tablename, action
      );

      IF action IN ('SELECT', 'DELETE') THEN
        create_sql := create_sql || ' USING (' || coalesce(merged_using, 'TRUE') || ')';
      ELSIF action = 'INSERT' THEN
        create_sql := create_sql || ' WITH CHECK (' || coalesce(merged_check, 'TRUE') || ')';
      ELSIF action = 'UPDATE' THEN
        create_sql := create_sql || ' USING (' || coalesce(merged_using, 'TRUE') || ')'
                     || ' WITH CHECK (' || coalesce(merged_check, 'TRUE') || ')';
      END IF;

      EXECUTE create_sql;
    END LOOP;
  END LOOP;
END
$$;
