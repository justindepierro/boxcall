-- =============================================================================
-- Deduplicate identical RLS policies (performance)
-- =============================================================================
--
-- Supabase linter warning:
--   multiple_permissive_policies
--
-- In some environments we end up with two policies for the same table/action/
-- role set that have identical USING/WITH CHECK expressions (often a legacy
-- policy plus a newer *_bulletproof policy). When they are identical, keeping
-- both is pointless and hurts performance.
--
-- This migration is intentionally conservative:
-- - Only drops duplicates when the policy definitions are IDENTICAL:
--   (cmd, permissive flag, roles set, qual, with_check) all match.
-- - Prefers keeping a policy name containing "bulletproof" when present.
-- - Otherwise keeps a name that contains the tablename.
-- - Otherwise keeps the first name in sorted order.
-- =============================================================================

DO $$
DECLARE
  grp record;
  keep_policy text;
  pn text;
BEGIN
  FOR grp IN
    SELECT
      schemaname,
      tablename,
      cmd,
      permissive,
      qual,
      with_check,
      norm_roles,
      array_agg(policyname ORDER BY policyname) AS policy_names
    FROM (
      SELECT
        schemaname,
        tablename,
        policyname,
        cmd,
        permissive,
        qual,
        with_check,
        array(SELECT unnest(roles) ORDER BY 1) AS norm_roles
      FROM pg_policies
      WHERE schemaname = 'public'
        AND policyname IS NOT NULL
    ) p
    GROUP BY
      schemaname,
      tablename,
      cmd,
      permissive,
      qual,
      with_check,
      norm_roles
    HAVING COUNT(*) > 1
  LOOP
    keep_policy := NULL;

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

    FOREACH pn IN ARRAY grp.policy_names LOOP
      IF pn IS DISTINCT FROM keep_policy THEN
        EXECUTE format('DROP POLICY %I ON %I.%I', pn, grp.schemaname, grp.tablename);
      END IF;
    END LOOP;
  END LOOP;
END
$$;
