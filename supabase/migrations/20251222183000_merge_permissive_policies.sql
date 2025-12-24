-- =============================================================================
-- Merge multiple permissive policies into one (performance)
-- =============================================================================
--
-- Supabase linter warning:
--   multiple_permissive_policies
--
-- Postgres semantics for PERMISSIVE policies are effectively OR across policies
-- for the same command. Multiple permissive policies are equivalent to a single
-- permissive policy whose predicates are OR'd together.
--
-- This migration:
-- 1) Finds groups of PERMISSIVE policies that share (table, command, roles set)
-- 2) Drops them and re-creates a single policy with OR'd USING / WITH CHECK.
--
-- Additionally, we remove `anon`/`PUBLIC` from two sensitive tables where anon
-- should never be able to pass auth-dependent predicates:
-- - public.plays
-- - public.personnel_configurations
--
-- NOTE: We intentionally do NOT merge RESTRICTIVE policies.
-- =============================================================================

DO $$
DECLARE
  grp record;
  keep_policy text;
  pn text;

  merged_using text;
  merged_check text;

  base_roles text[];
  roles_sql text;

  create_sql text;
BEGIN
  FOR grp IN
    SELECT
      schemaname,
      tablename,
      cmd,
      permissive,
      norm_roles,
      array_agg(policyname ORDER BY policyname) AS policy_names
    FROM (
      SELECT
        schemaname,
        tablename,
        policyname,
        cmd,
        permissive,
        array(SELECT unnest(roles) ORDER BY 1) AS norm_roles
      FROM pg_policies
      WHERE schemaname = 'public'
        AND policyname IS NOT NULL
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
    ) p
    GROUP BY
      schemaname,
      tablename,
      cmd,
      permissive,
      norm_roles
    HAVING COUNT(*) > 1
  LOOP
    keep_policy := NULL;

    -- Prefer keeping bulletproof-named policy if present
    SELECT n
    INTO keep_policy
    FROM unnest(grp.policy_names) n
    WHERE n ILIKE '%bulletproof%'
    ORDER BY length(n) DESC
    LIMIT 1;

    IF keep_policy IS NULL THEN
      SELECT n
      INTO keep_policy
      FROM unnest(grp.policy_names) n
      WHERE n ILIKE '%' || grp.tablename || '%'
      ORDER BY length(n) ASC
      LIMIT 1;
    END IF;

    IF keep_policy IS NULL THEN
      keep_policy := grp.policy_names[1];
    END IF;

    -- Build merged predicates from existing policies
    IF grp.cmd IN ('SELECT', 'UPDATE', 'DELETE', 'ALL') THEN
      SELECT string_agg('(' || coalesce(qual, 'TRUE') || ')', ' OR ')
      INTO merged_using
      FROM pg_policies
      WHERE schemaname = grp.schemaname
        AND tablename = grp.tablename
        AND cmd = grp.cmd
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
        AND array(SELECT unnest(roles) ORDER BY 1) = grp.norm_roles;
    ELSE
      merged_using := NULL;
    END IF;

    IF grp.cmd IN ('INSERT', 'UPDATE', 'ALL') THEN
      SELECT string_agg('(' || coalesce(with_check, 'TRUE') || ')', ' OR ')
      INTO merged_check
      FROM pg_policies
      WHERE schemaname = grp.schemaname
        AND tablename = grp.tablename
        AND cmd = grp.cmd
        AND permissive IS DISTINCT FROM 'RESTRICTIVE'
        AND array(SELECT unnest(roles) ORDER BY 1) = grp.norm_roles;
    ELSE
      merged_check := NULL;
    END IF;

    -- Adjust roles for two sensitive tables: remove anon/public, ensure authenticated
    base_roles := grp.norm_roles;
    IF grp.tablename IN ('plays', 'personnel_configurations') THEN
      base_roles := array_remove(base_roles, 'public');
      base_roles := array_remove(base_roles, 'anon');
      IF base_roles IS NULL OR array_length(base_roles, 1) IS NULL THEN
        base_roles := ARRAY['authenticated'];
      ELSIF array_position(base_roles, 'authenticated') IS NULL THEN
        base_roles := array_append(base_roles, 'authenticated');
      END IF;
    END IF;

    SELECT string_agg(CASE WHEN r = 'public' THEN 'PUBLIC' ELSE quote_ident(r) END, ', ')
    INTO roles_sql
    FROM unnest(base_roles) r;

    -- Drop all existing policies in group
    FOREACH pn IN ARRAY grp.policy_names LOOP
      EXECUTE format('DROP POLICY %I ON %I.%I', pn, grp.schemaname, grp.tablename);
    END LOOP;

    -- Re-create merged policy
    create_sql := format(
      'CREATE POLICY %I ON %I.%I FOR %s %s',
      keep_policy,
      grp.schemaname,
      grp.tablename,
      grp.cmd,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END
    );

    IF merged_using IS NOT NULL THEN
      create_sql := create_sql || ' USING (' || merged_using || ')';
    END IF;

    IF merged_check IS NOT NULL THEN
      create_sql := create_sql || ' WITH CHECK (' || merged_check || ')';
    END IF;

    EXECUTE create_sql;
  END LOOP;
END
$$;
