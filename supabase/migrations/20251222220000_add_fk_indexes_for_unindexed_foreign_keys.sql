-- Add missing foreign-key supporting indexes for Supabase linter: unindexed_foreign_keys
--
-- Notes:
-- - Uses constraint names from the linter output and discovers columns via pg_constraint.
-- - Creates indexes only when no existing index already begins with the FK column list.
-- - Skips constraints that don't exist in the current environment (safe across drift).

DO $$
DECLARE
  fk_constraint_names text[] := ARRAY[
    -- Achievements
    'achievement_definitions_team_id_fkey',
    'achievement_progress_achievement_id_fkey',
    'achievements_player_id_fkey',

    -- Calendar
    'calendar_events_created_by_fkey',

    -- Social/comments
    'comments_parent_id_fkey',
    'comments_user_id_fkey',
    'follows_following_id_fkey',
    'post_comments_author_id_fkey',
    'post_comments_parent_comment_id_fkey',

    -- Invitations
    'invitation_attempts_attempted_by_fkey',
    'invitation_attempts_player_id_fkey',

    -- Notifications
    'notifications_comment_id_fkey',
    'notifications_triggered_by_user_id_fkey',

    -- Playbook / execution tracking
    'formations_created_by_fkey',
    'play_calls_play_id_fkey',
    'play_executions_formation_id_fkey',
    'play_executions_recorded_by_fkey',
    'plays_version_created_by_fkey',

    -- Assignments
    'play_assignments_created_by_fkey',
    'play_assignments_updated_by_fkey',

    -- Practice
    'practice_templates_created_by_fkey',
    'practice_templates_team_id_fkey',

    -- Games
    'games_game_plan_id_fkey',

    -- Helmet stickers
    'helmet_stickers_player_id_fkey'
  ];

  constraint_name text;
  constraint_oid oid;
  table_oid oid;
  schema_name text;
  table_name text;
  index_name text;
  fk_cols text;
  fk_attnums smallint[];
  has_index boolean;
BEGIN
  FOREACH constraint_name IN ARRAY fk_constraint_names LOOP
    SELECT c.oid,
           c.conrelid,
           n.nspname,
           t.relname,
           c.conkey
      INTO constraint_oid, table_oid, schema_name, table_name, fk_attnums
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
     WHERE c.contype = 'f'
       AND c.conname = constraint_name
     LIMIT 1;

    IF constraint_oid IS NULL THEN
      RAISE NOTICE 'FK constraint % not found; skipping', constraint_name;
      CONTINUE;
    END IF;

    SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord)
      INTO fk_cols
      FROM unnest(fk_attnums) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a
        ON a.attrelid = table_oid
       AND a.attnum = k.attnum
       AND a.attisdropped = false;

    IF fk_cols IS NULL OR fk_cols = '' THEN
      RAISE NOTICE 'Could not resolve FK columns for %; skipping', constraint_name;
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1
        FROM pg_index i
       WHERE i.indrelid = table_oid
         AND i.indisvalid
         AND (i.indkey::smallint[])[1:array_length(fk_attnums, 1)] = fk_attnums
    )
    INTO has_index;

    IF has_index THEN
      RAISE NOTICE 'Index already exists for % on %.% (%); skipping', constraint_name, schema_name, table_name, fk_cols;
      CONTINUE;
    END IF;

    index_name := 'idx_' || constraint_name;
    IF length(index_name) > 60 THEN
      index_name := left('idx_' || constraint_name, 46) || '_' || substr(md5(constraint_name), 1, 12);
    END IF;

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%s)',
      index_name,
      schema_name,
      table_name,
      fk_cols
    );

    RAISE NOTICE 'Created index % on %.% (%); source FK %', index_name, schema_name, table_name, fk_cols, constraint_name;
  END LOOP;
END $$;
