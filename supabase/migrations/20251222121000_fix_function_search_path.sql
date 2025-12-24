-- Supabase Database Linter Fix: 0011_function_search_path_mutable (WARN)
--
-- Sets a fixed search_path for flagged public functions to prevent object-shadowing attacks.
-- Applies to all overloads of each function name.

CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
DECLARE
  function_names text[] := ARRAY[
    'update_announcement_comments_updated_at',
    'update_play_diagram',
    'get_play_with_diagram',
    'count_diagram_players',
    'calculate_formation_metadata_completeness',
    'get_formation_metadata_quality',
    'update_formation_metadata_quality',
    'update_notifications_updated_at',
    'update_announcement_view_count',
    'link_formations_bidirectional',
    'unlink_formations_bidirectional',
    'validate_personnel_players',
    'validate_team_data',
    'get_personnel_configuration_by_name',
    'get_personnel_players',
    'check_formation_circular_reference',
    'increment_formation_version',
    'link_formations_transaction',
    'formation_has_variants',
    'get_formation_variants',
    'is_base_formation',
    'validate_key_players',
    'accept_player_invitation',
    'cleanup_expired_invitations',
    'add_play_tag',
    'remove_play_tag',
    'get_all_play_tags',
    'sync_play_tags',
    'create_play_version',
    'sync_plays_on_formation_rename',
    'auto_populate_personnel_id',
    'update_team_announcements_updated_at',
    'get_diagram_player_count',
    'get_diagram_players_by_team',
    'update_practice_session_stats',
    'update_game_session_stats',
    'update_play_assignments_updated_at',
    'sync_plays_on_formation_direction_change',
    'update_updated_at_column',
    'validate_formation_play_references',
    'update_execution_tracking_updated_at',
    'update_profiles_updated_at',
    'validate_play_type',
    'get_user_mentions',
    'create_named_play_version',
    'rollback_play_to_version',
    'sync_plays_formation_id',
    'validate_formation_play_sync',
    'validate_play_data',
    'extract_base_formation_name',
    'sync_formation_play_data',
    'handle_formation_deletion',
    'update_formation_usage_count',
    'flip_formation_positions',
    'is_team_coach',
    'validate_personnel_data',
    'update_personnel_configurations_updated_at',
    'update_formations_updated_at',
    'update_practice_script_plays_updated_at',
    'validate_formation_data',
    'auto_populate_formation_id',
    'cascade_formation_rename',
    'cascade_personnel_rename',
    'boxcall_global_search',
    'soft_delete_formation',
    'restore_formation',
    'soft_delete_personnel_config',
    'restore_personnel_config',
    'auto_infer_formation_direction',
    'validate_formation_personnel_compatibility',
    'check_formation_variant_consistency',
    'fix_formation_variant_links',
    'batch_link_plays_to_formations',
    'batch_link_plays_to_personnel',
    'distance_bucket',
    'detect_opposite_formations',
    'ensure_bidirectional_formation_link',
    'sync_play_personnel_name',
    'sync_play_formation_name',
    'handle_new_user'
  ];
  fn_name text;
  rec record;
BEGIN
  FOREACH fn_name IN ARRAY function_names
  LOOP
    FOR rec IN
      SELECT p.oid
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = fn_name
    LOOP
      BEGIN
        EXECUTE format(
          'ALTER FUNCTION public.%I(%s) SET search_path = pg_catalog, public, extensions',
          fn_name,
          pg_get_function_identity_arguments(rec.oid)
        );
      EXCEPTION
        WHEN insufficient_privilege THEN
          RAISE NOTICE 'Skipping ALTER FUNCTION %.% (insufficient privileges)', fn_name, pg_get_function_identity_arguments(rec.oid);
        WHEN others THEN
          RAISE NOTICE 'Skipping ALTER FUNCTION %.% (%).', fn_name, pg_get_function_identity_arguments(rec.oid), SQLERRM;
      END;
    END LOOP;
  END LOOP;
END
$$;
