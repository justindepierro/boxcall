-- Add missing foreign-key supporting indexes for all PUBLIC schema foreign keys.
--
-- Why:
-- - Supabase "Missing Foreign-Key Indexes" reports can include many PUBLIC FKs beyond
--   the smaller subset flagged in a single lints CSV.
--
-- Safety:
-- - Only creates an index if no existing valid index already begins with the FK column list.
-- - Only touches schema = 'public' (skips Supabase-managed schemas like auth/storage).
-- - Uses deterministic, collision-resistant index names.

DO $$
DECLARE
  r record;
  fk_cols text;
  index_name text;
  fk_attnums smallint[];
  has_index boolean;
  name_hash text;
BEGIN
  FOR r IN (
    SELECT
      c.oid AS constraint_oid,
      c.conname,
      c.conrelid AS table_oid,
      n.nspname AS schema_name,
      t.relname AS table_name,
      c.conkey AS fk_attnums
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
  ) LOOP
    fk_attnums := r.fk_attnums;

    SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord)
      INTO fk_cols
      FROM unnest(fk_attnums) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a
        ON a.attrelid = r.table_oid
       AND a.attnum = k.attnum
       AND a.attisdropped = false;

    IF fk_cols IS NULL OR fk_cols = '' THEN
      RAISE NOTICE 'Could not resolve FK columns for %; skipping', r.conname;
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
        FROM pg_index i
       WHERE i.indrelid = r.table_oid
         AND i.indisvalid
         AND (i.indkey::smallint[])[1:array_length(fk_attnums, 1)] = fk_attnums
    )
    INTO has_index;

    IF has_index THEN
      CONTINUE;
    END IF;

    name_hash := substr(md5(r.schema_name || '.' || r.table_name || ':' || r.conname), 1, 12);
    index_name := 'idx_fk_' || left(r.table_name, 40) || '_' || name_hash;

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%s)',
      index_name,
      r.schema_name,
      r.table_name,
      fk_cols
    );

    RAISE NOTICE 'Created index % on %.% (%); source FK %', index_name, r.schema_name, r.table_name, fk_cols, r.conname;
  END LOOP;
END $$;
