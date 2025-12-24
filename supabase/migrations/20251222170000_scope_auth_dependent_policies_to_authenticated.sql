-- =============================================================================
-- Reduce multiple_permissive_policies (anon) by scoping auth-dependent policies
-- =============================================================================
--
-- Supabase linter warning:
--   multiple_permissive_policies: Table `public.*` has multiple permissive
--   policies for role `anon` ...
--
-- Root cause:
--   Many policies were created without an explicit `TO authenticated`, so they
--   defaulted to `TO PUBLIC` (applies to anon + authenticated). If a policy
--   references auth.uid()/auth.role(), it can never grant access to `anon`
--   anyway (auth.uid() is NULL), so restricting it to `authenticated` is
--   semantics-preserving while removing the linter warning.
--
-- This migration avoids DROP/CREATE. It uses ALTER POLICY and is conditional.
-- =============================================================================

DO $$
DECLARE
  pol record;
  new_roles text[];
  roles_sql text;
BEGIN
  FOR pol IN
    SELECT
      schemaname,
      tablename,
      policyname,
      roles,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles IS NOT NULL
      AND array_position(roles, 'public') IS NOT NULL
      AND (
        (qual LIKE '%auth.uid()%' OR qual LIKE '%(SELECT auth.uid())%' OR qual LIKE '%auth.role()%' OR qual LIKE '%(SELECT auth.role())%')
        OR (with_check LIKE '%auth.uid()%' OR with_check LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%auth.role()%' OR with_check LIKE '%(SELECT auth.role())%')
      )
  LOOP
    new_roles := array_remove(pol.roles, 'public');

    IF new_roles IS NULL OR array_length(new_roles, 1) IS NULL THEN
      new_roles := ARRAY['authenticated'];
    ELSIF array_position(new_roles, 'authenticated') IS NULL THEN
      new_roles := array_append(new_roles, 'authenticated');
    END IF;

    SELECT string_agg(quote_ident(r), ', ')
    INTO roles_sql
    FROM unnest(new_roles) r;

    IF roles_sql IS NULL OR roles_sql = '' THEN
      roles_sql := 'authenticated';
    END IF;

    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO %s',
      pol.policyname,
      pol.schemaname,
      pol.tablename,
      roles_sql
    );
  END LOOP;
END
$$;
