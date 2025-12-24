-- =============================================================================
-- Consolidate PERMISSIVE policies for role authenticated per action
-- =============================================================================
--
-- Supabase linter warning:
--   multiple_permissive_policies (role `authenticated`)
--
-- Remaining warnings are largely caused by:
-- - A table having both an action-specific policy (e.g. FOR SELECT)
--   and a FOR ALL policy (ALL applies to SELECT too), or
-- - Multiple action-specific permissive policies for authenticated.
--
-- For PERMISSIVE policies, Postgres evaluates predicates as OR across policies
-- for the same command. Therefore, a single policy with OR'd predicates is
-- semantics-preserving.
--
-- This migration:
-- - For each (table, action), gathers all PERMISSIVE policies that apply to
--   role `authenticated` for that action (cmd in (action, 'ALL')).
-- - If more than one exists, removes `authenticated` from those policies
--   (or drops them if they were authenticated-only), and creates a single
--   merged policy FOR that action TO authenticated.
--
-- It does not touch RESTRICTIVE policies.
-- =============================================================================

DO $$
DECLARE
  t record;
  action text;
  pol_names text[];
  pn text;
  roles_new text[];
  roles_sql text;

  merged_using text;
  merged_check text;

  merged_name text;
  create_sql text;
BEGIN
  FOR t IN
    SELECT DISTINCT schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND permissive IS DISTINCT FROM 'RESTRICTIVE'
      AND array_position(roles, 'authenticated') IS NOT NULL
  LOOP
    FOREACH action IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
      SELECT array_agg(policyname ORDER BY policyname)
      INTO pol_names
      FROM pg_policies
      WHERE schemaname = t.schemaname
        AND tablename = t.tablename
        AND policyname IS NOT NULL
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
        AND array_position(roles, 'authenticated') IS NOT NULL
        AND cmd IN (action, 'ALL');

      IF pol_names IS NULL OR array_length(pol_names, 1) IS NULL OR array_length(pol_names, 1) <= 1 THEN
        CONTINUE;
      END IF;

      -- Merge predicates for this action across all applicable policies.
      merged_using := NULL;
      merged_check := NULL;

      IF action IN ('SELECT', 'UPDATE', 'DELETE') THEN
        SELECT string_agg('(' || coalesce(qual, 'TRUE') || ')', ' OR ')
        INTO merged_using
        FROM pg_policies
        WHERE schemaname = t.schemaname
          AND tablename = t.tablename
          AND policyname = ANY(pol_names)
          AND cmd IN (action, 'ALL')
          AND permissive IS DISTINCT FROM 'RESTRICTIVE'
          AND array_position(roles, 'authenticated') IS NOT NULL;
      END IF;

      IF action IN ('INSERT', 'UPDATE') THEN
        SELECT string_agg('(' || coalesce(with_check, 'TRUE') || ')', ' OR ')
        INTO merged_check
        FROM pg_policies
        WHERE schemaname = t.schemaname
          AND tablename = t.tablename
          AND policyname = ANY(pol_names)
          AND cmd IN (action, 'ALL')
          AND permissive IS DISTINCT FROM 'RESTRICTIVE'
          AND array_position(roles, 'authenticated') IS NOT NULL;
      END IF;

      -- Remove authenticated from existing policies (or drop if it was the only role).
      FOREACH pn IN ARRAY pol_names LOOP
        SELECT roles
        INTO roles_new
        FROM pg_policies
        WHERE schemaname = t.schemaname
          AND tablename = t.tablename
          AND policyname = pn;

        IF roles_new IS NULL THEN
          CONTINUE;
        END IF;

        roles_new := array_remove(roles_new, 'authenticated');

        IF roles_new IS NULL OR array_length(roles_new, 1) IS NULL THEN
          EXECUTE format('DROP POLICY %I ON %I.%I', pn, t.schemaname, t.tablename);
        ELSE
          SELECT string_agg(CASE WHEN r = 'public' THEN 'PUBLIC' ELSE quote_ident(r) END, ', ')
          INTO roles_sql
          FROM unnest(roles_new) r;

          EXECUTE format('ALTER POLICY %I ON %I.%I TO %s', pn, t.schemaname, t.tablename, roles_sql);
        END IF;
      END LOOP;

      -- Create merged authenticated policy for this action.
      merged_name := left('bc_auth_' || t.tablename || '_' || lower(action) || '_merged', 63);

      IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = t.schemaname
          AND tablename = t.tablename
          AND policyname = merged_name
      ) THEN
        EXECUTE format('DROP POLICY %I ON %I.%I', merged_name, t.schemaname, t.tablename);
      END IF;

      create_sql := format(
        'CREATE POLICY %I ON %I.%I FOR %s TO authenticated',
        merged_name,
        t.schemaname,
        t.tablename,
        action
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
