-- Drop duplicate indexes created by the "auto-index all public foreign keys" migration.
--
-- Context:
-- - The migration `20251222223500_add_fk_indexes_for_all_public_foreign_keys.sql` creates indexes
--   named `idx_fk_*` when a FK doesn't have a supporting index.
-- - Some tables already had existing hand-named indexes (e.g. `idx_<table>_<col>`) that are
--   definition-identical, causing Supabase lints: `duplicate_index`.
--
-- Goal:
-- - Keep existing non-generated indexes when they are identical.
-- - Drop only the extra generated `idx_fk_*` duplicates.
--
-- Safety:
-- - Never drop an index that backs a constraint (PK/UNIQUE/EXCLUDE).
-- - Only operates on schema `public`.

DO $$
DECLARE
  r record;
  keep_oid oid;
  drop_oid oid;
  drop_schema text;
  drop_name text;
BEGIN
  -- Build groups of identical index definitions per table.
  FOR r IN (
    WITH idx AS (
      SELECT
        t.oid                          AS table_oid,
        n.nspname                      AS schema_name,
        t.relname                      AS table_name,
        i.indexrelid                   AS index_oid,
        ic.relname                     AS index_name,
        -- Normalize away the index name so identical indexes compare cleanly.
        regexp_replace(
          pg_get_indexdef(i.indexrelid),
          '^CREATE( UNIQUE)? INDEX [^ ]+ ON ',
          'CREATE\\1 INDEX ON '
        ) AS normalized_def,
        EXISTS (
          SELECT 1
          FROM pg_constraint c
          WHERE c.conindid = i.indexrelid
        ) AS backs_constraint
      FROM pg_index i
      JOIN pg_class t ON t.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_class ic ON ic.oid = i.indexrelid
      WHERE n.nspname = 'public'
        AND i.indisvalid
    ),
    dup_groups AS (
      SELECT
        table_oid,
        normalized_def,
        count(*) AS cnt
      FROM idx
      GROUP BY table_oid, normalized_def
      HAVING count(*) > 1
    ),
    candidates AS (
      SELECT
        idx.*
      FROM idx
      JOIN dup_groups g
        ON g.table_oid = idx.table_oid
       AND g.normalized_def = idx.normalized_def
    ),
    chosen_keep AS (
      SELECT DISTINCT ON (table_oid, normalized_def)
        table_oid,
        normalized_def,
        -- Prefer a constraint-backed index, otherwise prefer a non-idx_fk_* index.
        index_oid AS keep_oid
      FROM candidates
      ORDER BY
        table_oid,
        normalized_def,
        backs_constraint DESC,
        (index_name NOT LIKE 'idx_fk_%') DESC,
        index_name ASC
    )
    SELECT
      c.schema_name,
      c.index_name,
      c.index_oid,
      c.backs_constraint,
      k.keep_oid
    FROM candidates c
    JOIN chosen_keep k
      ON k.table_oid = c.table_oid
     AND k.normalized_def = c.normalized_def
    WHERE c.index_oid <> k.keep_oid
      AND c.index_name LIKE 'idx_fk_%'
      AND c.backs_constraint = false
  ) LOOP
    drop_schema := r.schema_name;
    drop_name := r.index_name;

    EXECUTE format('DROP INDEX IF EXISTS %I.%I', drop_schema, drop_name);

    RAISE NOTICE 'Dropped duplicate generated index %.% (kept index oid=%)', drop_schema, drop_name, r.keep_oid;
  END LOOP;
END $$;
