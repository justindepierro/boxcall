

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."is_user_team_coach"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND status = 'active'
  );
END;
$$;


ALTER FUNCTION "public"."is_user_team_coach"("team_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_team_member"("team_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$;


ALTER FUNCTION "public"."is_user_team_member"("team_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievement_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" DEFAULT 'trophy'::"text" NOT NULL,
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "trigger_type" "text" NOT NULL,
    "trigger_target" "text" NOT NULL,
    "trigger_count" integer,
    "points" integer DEFAULT 10 NOT NULL,
    "rarity" "text" DEFAULT 'common'::"text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "achievement_definitions_category_check" CHECK (("category" = ANY (ARRAY['gameplay'::"text", 'social'::"text", 'teamwork'::"text", 'leadership'::"text", 'milestone'::"text", 'special'::"text"]))),
    CONSTRAINT "achievement_definitions_rarity_check" CHECK (("rarity" = ANY (ARRAY['common'::"text", 'uncommon'::"text", 'rare'::"text", 'epic'::"text", 'legendary'::"text"]))),
    CONSTRAINT "achievement_definitions_trigger_type_check" CHECK (("trigger_type" = ANY (ARRAY['action_count'::"text", 'streak'::"text", 'milestone'::"text", 'special'::"text"])))
);


ALTER TABLE "public"."achievement_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievement_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "current_count" integer DEFAULT 0,
    "is_completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."achievement_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "player_id" "uuid",
    "achievement_type" "text" NOT NULL,
    "description" "text",
    "earned_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "event_date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "event_type" "text" DEFAULT 'other'::"text",
    "location" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "calendar_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['game'::"text", 'practice'::"text", 'meeting'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "quantity" integer DEFAULT 1,
    "condition" "text" DEFAULT 'good'::"text",
    "last_checked" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "equipment_condition_check" CHECK (("condition" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text"])))
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_plan_plays" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "situation_id" "uuid",
    "play_id" "uuid",
    "priority" integer DEFAULT 1,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."game_plan_plays" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_plan_situations" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "game_plan_id" "uuid",
    "situation_type" "text" NOT NULL,
    "yard_line" integer,
    "down" integer,
    "distance" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."game_plan_situations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_plans" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "opponent" "text" NOT NULL,
    "game_date" "date" NOT NULL,
    "venue" "text",
    "home_away" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "game_plans_home_away_check" CHECK (("home_away" = ANY (ARRAY['home'::"text", 'away'::"text"])))
);


ALTER TABLE "public"."game_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_results" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "opponent" "text" NOT NULL,
    "game_date" "date" NOT NULL,
    "our_score" integer DEFAULT 0,
    "opponent_score" integer DEFAULT 0,
    "result" "text",
    "venue" "text",
    "home_away" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "game_results_home_away_check" CHECK (("home_away" = ANY (ARRAY['home'::"text", 'away'::"text"]))),
    CONSTRAINT "game_results_result_check" CHECK (("result" = ANY (ARRAY['win'::"text", 'loss'::"text", 'tie'::"text"])))
);


ALTER TABLE "public"."game_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."helmet_stickers" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "player_id" "uuid",
    "sticker_type" "text" NOT NULL,
    "earned_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."helmet_stickers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."play_calls" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid",
    "play_id" "uuid",
    "quarter" integer,
    "time_remaining" "text",
    "yard_line" integer,
    "down" integer,
    "distance" integer,
    "result" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."play_calls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."playbooks" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "name" "text" DEFAULT 'Main Playbook'::"text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "play_count" integer DEFAULT 0,
    "last_modified_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."playbooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."plays" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "playbook_id" "uuid",
    "formation" "text" NOT NULL,
    "play_name" "text" NOT NULL,
    "one_word_play" "text",
    "p_type" "text" NOT NULL,
    "personnel" "text",
    "f_type" "text",
    "f_dir" "text",
    "protection" "text",
    "p_dir" "text",
    "r_str" "text",
    "p_str" "text",
    "pref_down" "text",
    "pref_dis" "text",
    "pref_hash" "text",
    "pref_cov" "text",
    "pref_front" "text",
    "ftag1" "text",
    "ftag2" "text",
    "p_tag1" "text",
    "p_tag2" "text",
    "back_align" "text",
    "shift" "text",
    "motion" "text",
    "key_player1" "text",
    "key_player2" "text",
    "check_into" "text",
    "notes" "text",
    "confidence_base" integer DEFAULT 70,
    "times_called" integer DEFAULT 0,
    "times_successful" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "plays_p_type_check" CHECK (("p_type" = ANY (ARRAY['Pass'::"text", 'Run'::"text", 'RPO'::"text", 'Play Action'::"text"])))
);


ALTER TABLE "public"."plays" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "parent_comment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_attendance" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "practice_id" "uuid",
    "player_id" "uuid",
    "status" "text" DEFAULT 'present'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "practice_attendance_status_check" CHECK (("status" = ANY (ARRAY['present'::"text", 'absent'::"text", 'late'::"text", 'excused'::"text"])))
);


ALTER TABLE "public"."practice_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_schedules" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "practice_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "location" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."practice_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_scripts" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "duration" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."practice_scripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_templates" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "duration" integer,
    "is_public" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."practice_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'player'::"text",
    "bio" "text",
    "phone" "text",
    "email" "text",
    "display_name" "text",
    "address" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "position" "text",
    "jersey_number" integer,
    "emergency_contact" "text",
    "emergency_phone" "text",
    "grade_level" "text",
    "height_inches" integer,
    "weight_lbs" integer,
    "is_active" boolean DEFAULT true,
    "notification_preferences" "jsonb" DEFAULT '{"push": true, "email": true, "social": true}'::"jsonb",
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_players" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "jersey_number" integer,
    "position" "text",
    "grade_level" "text",
    "height_inches" integer,
    "weight_lbs" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "school_name" "text",
    "mascot" "text",
    "season_year" integer DEFAULT EXTRACT(year FROM "now"()),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "play_count" integer DEFAULT 0,
    "last_backup_at" timestamp with time zone,
    "backup_version" integer DEFAULT 1
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."season_stats" AS
 SELECT "tp"."id" AS "player_id",
    "tp"."first_name",
    "tp"."last_name",
    "tp"."jersey_number",
    "tp"."position",
    "t"."name" AS "team_name",
    "t"."season_year",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'complete'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "pass_completions",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'incomplete'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "pass_attempts",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'touchdown'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "passing_touchdowns",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'interception'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "interceptions",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'rush'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "rush_attempts",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'rush_td'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "rushing_touchdowns",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'reception'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "receptions",
    COALESCE("sum"(
        CASE
            WHEN ("pc"."result" = 'receiving_td'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) AS "receiving_touchdowns",
    "count"(DISTINCT "a"."id") AS "achievements_count",
    "count"(DISTINCT "hs"."id") AS "stickers_count"
   FROM (((("public"."team_players" "tp"
     JOIN "public"."teams" "t" ON (("t"."id" = "tp"."team_id")))
     LEFT JOIN "public"."play_calls" "pc" ON (("pc"."game_id" IN ( SELECT "gr"."id"
           FROM "public"."game_results" "gr"
          WHERE ("gr"."team_id" = "t"."id")))))
     LEFT JOIN "public"."achievements" "a" ON (("a"."player_id" = "tp"."id")))
     LEFT JOIN "public"."helmet_stickers" "hs" ON (("hs"."player_id" = "tp"."id")))
  WHERE ("tp"."is_active" = true)
  GROUP BY "tp"."id", "tp"."first_name", "tp"."last_name", "tp"."jersey_number", "tp"."position", "t"."name", "t"."season_year";


ALTER VIEW "public"."season_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_events" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "event_date" "date" NOT NULL,
    "event_type" "text" DEFAULT 'general'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "team_role" "text" NOT NULL,
    "capabilities" "jsonb" DEFAULT '{"can_manage_team": false, "can_manage_games": false, "can_manage_social": false, "can_manage_players": false, "can_view_analytics": false, "can_manage_playbook": false, "can_manage_practice": false, "can_manage_equipment": false}'::"jsonb",
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "role_notes" "text",
    CONSTRAINT "team_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'pending'::"text"]))),
    CONSTRAINT "team_members_team_role_check" CHECK (("team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text", 'manager'::"text", 'coach'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_posts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievement_definitions"
    ADD CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_plan_plays"
    ADD CONSTRAINT "game_plan_plays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_plan_situations"
    ADD CONSTRAINT "game_plan_situations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_plans"
    ADD CONSTRAINT "game_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_results"
    ADD CONSTRAINT "game_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."helmet_stickers"
    ADD CONSTRAINT "helmet_stickers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."play_calls"
    ADD CONSTRAINT "play_calls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."playbooks"
    ADD CONSTRAINT "playbooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plays"
    ADD CONSTRAINT "plays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."practice_attendance"
    ADD CONSTRAINT "practice_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_schedules"
    ADD CONSTRAINT "practice_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_scripts"
    ADD CONSTRAINT "practice_scripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_templates"
    ADD CONSTRAINT "practice_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_events"
    ADD CONSTRAINT "team_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."team_players"
    ADD CONSTRAINT "team_players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_posts"
    ADD CONSTRAINT "team_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_calendar_events_team_date" ON "public"."calendar_events" USING "btree" ("team_id", "event_date");



CREATE INDEX "idx_equipment_team_category" ON "public"."equipment" USING "btree" ("team_id", "category");



CREATE INDEX "idx_game_plans_team_date" ON "public"."game_plans" USING "btree" ("team_id", "game_date");



CREATE INDEX "idx_game_results_team_date" ON "public"."game_results" USING "btree" ("team_id", "game_date");



CREATE INDEX "idx_playbooks_team_active" ON "public"."playbooks" USING "btree" ("team_id", "is_active");



CREATE INDEX "idx_plays_playbook" ON "public"."plays" USING "btree" ("playbook_id");



CREATE INDEX "idx_plays_type" ON "public"."plays" USING "btree" ("p_type");



CREATE INDEX "idx_post_comments_post" ON "public"."post_comments" USING "btree" ("post_id");



CREATE INDEX "idx_post_likes_post" ON "public"."post_likes" USING "btree" ("post_id");



CREATE INDEX "idx_post_shares_post" ON "public"."post_shares" USING "btree" ("post_id");



CREATE INDEX "idx_practice_attendance_practice" ON "public"."practice_attendance" USING "btree" ("practice_id");



CREATE INDEX "idx_practice_schedules_team_date" ON "public"."practice_schedules" USING "btree" ("team_id", "practice_date");



CREATE INDEX "idx_profiles_is_active" ON "public"."profiles" USING "btree" ("is_active");



CREATE INDEX "idx_team_events_team_date" ON "public"."team_events" USING "btree" ("team_id", "event_date");



CREATE INDEX "idx_team_members_team_user" ON "public"."team_members" USING "btree" ("team_id", "user_id");



CREATE INDEX "idx_team_members_user_status" ON "public"."team_members" USING "btree" ("user_id", "status");



CREATE INDEX "idx_team_players_team_active" ON "public"."team_players" USING "btree" ("team_id", "is_active");



CREATE INDEX "idx_team_posts_author" ON "public"."team_posts" USING "btree" ("author_id");



CREATE INDEX "idx_team_posts_team_created" ON "public"."team_posts" USING "btree" ("team_id", "created_at" DESC);



CREATE INDEX "idx_teams_season_year" ON "public"."teams" USING "btree" ("season_year");



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."achievement_progress"
    ADD CONSTRAINT "achievement_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."team_players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_plan_plays"
    ADD CONSTRAINT "game_plan_plays_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "public"."plays"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_plan_plays"
    ADD CONSTRAINT "game_plan_plays_situation_id_fkey" FOREIGN KEY ("situation_id") REFERENCES "public"."game_plan_situations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_plan_situations"
    ADD CONSTRAINT "game_plan_situations_game_plan_id_fkey" FOREIGN KEY ("game_plan_id") REFERENCES "public"."game_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_plans"
    ADD CONSTRAINT "game_plans_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_results"
    ADD CONSTRAINT "game_results_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."helmet_stickers"
    ADD CONSTRAINT "helmet_stickers_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."team_players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."play_calls"
    ADD CONSTRAINT "play_calls_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "public"."plays"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."playbooks"
    ADD CONSTRAINT "playbooks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plays"
    ADD CONSTRAINT "plays_playbook_id_fkey" FOREIGN KEY ("playbook_id") REFERENCES "public"."playbooks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."team_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."team_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."team_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_attendance"
    ADD CONSTRAINT "practice_attendance_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."team_players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_attendance"
    ADD CONSTRAINT "practice_attendance_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "public"."practice_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_schedules"
    ADD CONSTRAINT "practice_schedules_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_scripts"
    ADD CONSTRAINT "practice_scripts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_templates"
    ADD CONSTRAINT "practice_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."practice_templates"
    ADD CONSTRAINT "practice_templates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_events"
    ADD CONSTRAINT "team_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."team_events"
    ADD CONSTRAINT "team_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_players"
    ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_posts"
    ADD CONSTRAINT "team_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_posts"
    ADD CONSTRAINT "team_posts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view active achievement definitions" ON "public"."achievement_definitions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Team coaches can manage achievements" ON "public"."achievements" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = ( SELECT "team_players"."team_id"
           FROM "public"."team_players"
          WHERE ("team_players"."id" = "achievements"."player_id"))) AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage all posts" ON "public"."team_posts" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_posts"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage calendar events" ON "public"."calendar_events" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "calendar_events"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage equipment" ON "public"."equipment" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "equipment"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage game plan plays" ON "public"."game_plan_plays" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."game_plan_situations" "gps" ON (("gps"."game_plan_id" = "tm"."team_id")))
  WHERE (("gps"."id" = "game_plan_plays"."situation_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage game plans" ON "public"."game_plans" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "game_plans"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage game results" ON "public"."game_results" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "game_results"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage game situations" ON "public"."game_plan_situations" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."game_plans" "gp" ON (("gp"."team_id" = "tm"."team_id")))
  WHERE (("gp"."id" = "game_plan_situations"."game_plan_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage helmet stickers" ON "public"."helmet_stickers" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = ( SELECT "team_players"."team_id"
           FROM "public"."team_players"
          WHERE ("team_players"."id" = "helmet_stickers"."player_id"))) AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage playbooks" ON "public"."playbooks" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "playbooks"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage plays" ON "public"."plays" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."playbooks" "pb" ON (("pb"."team_id" = "tm"."team_id")))
  WHERE (("pb"."id" = "plays"."playbook_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage practice attendance" ON "public"."practice_attendance" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."practice_schedules" "ps" ON (("ps"."team_id" = "tm"."team_id")))
  WHERE (("ps"."id" = "practice_attendance"."practice_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage practice schedules" ON "public"."practice_schedules" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "practice_schedules"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage practice scripts" ON "public"."practice_scripts" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "practice_scripts"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage practice templates" ON "public"."practice_templates" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "practice_templates"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage team events" ON "public"."team_events" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_events"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team coaches can manage team members" ON "public"."team_members" USING ("public"."is_user_team_coach"("team_id"));



CREATE POLICY "Team coaches can manage teams" ON "public"."teams" USING ("public"."is_user_team_coach"("id"));



CREATE POLICY "Team coaches can update their teams" ON "public"."teams" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "teams"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."team_role" = ANY (ARRAY['head_coach'::"text", 'assistant_coach'::"text", 'coordinator'::"text"])) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can comment on posts" ON "public"."post_comments" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."team_posts" "tp" ON (("tp"."team_id" = "tm"."team_id")))
  WHERE (("tp"."id" = "post_comments"."post_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can create team posts" ON "public"."team_posts" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_posts"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))) AND ("author_id" = "auth"."uid"())));



CREATE POLICY "Team members can like posts" ON "public"."post_likes" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."team_posts" "tp" ON (("tp"."team_id" = "tm"."team_id")))
  WHERE (("tp"."id" = "post_likes"."post_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can share posts" ON "public"."post_shares" USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."team_posts" "tp" ON (("tp"."team_id" = "tm"."team_id")))
  WHERE (("tp"."id" = "post_shares"."post_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view achievements" ON "public"."achievements" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = ( SELECT "team_players"."team_id"
           FROM "public"."team_players"
          WHERE ("team_players"."id" = "achievements"."player_id"))) AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view calendar events" ON "public"."calendar_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "calendar_events"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view equipment" ON "public"."equipment" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "equipment"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view game plan plays" ON "public"."game_plan_plays" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."game_plan_situations" "gps" ON (("gps"."game_plan_id" = "tm"."team_id")))
  WHERE (("gps"."id" = "game_plan_plays"."situation_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view game plans" ON "public"."game_plans" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "game_plans"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view game results" ON "public"."game_results" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "game_results"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view game situations" ON "public"."game_plan_situations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."game_plans" "gp" ON (("gp"."team_id" = "tm"."team_id")))
  WHERE (("gp"."id" = "game_plan_situations"."game_plan_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view helmet stickers" ON "public"."helmet_stickers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = ( SELECT "team_players"."team_id"
           FROM "public"."team_players"
          WHERE ("team_players"."id" = "helmet_stickers"."player_id"))) AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view playbooks" ON "public"."playbooks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "playbooks"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view plays" ON "public"."plays" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."playbooks" "pb" ON (("pb"."team_id" = "tm"."team_id")))
  WHERE (("pb"."id" = "plays"."playbook_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view practice attendance" ON "public"."practice_attendance" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."team_members" "tm"
     JOIN "public"."practice_schedules" "ps" ON (("ps"."team_id" = "tm"."team_id")))
  WHERE (("ps"."id" = "practice_attendance"."practice_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view practice schedules" ON "public"."practice_schedules" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "practice_schedules"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view practice scripts" ON "public"."practice_scripts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "practice_scripts"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view practice templates" ON "public"."practice_templates" FOR SELECT USING ((("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))) OR ("is_public" = true)));



CREATE POLICY "Team members can view team events" ON "public"."team_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_events"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Team members can view team posts" ON "public"."team_posts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_posts"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Users can insert their own profiles" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can update their own achievement progress" ON "public"."achievement_progress" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own posts" ON "public"."team_posts" FOR UPDATE USING (("author_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profiles" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view profiles of team members" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."user_id" = "profiles"."id") AND "public"."is_user_team_member"("tm"."team_id"))))));



CREATE POLICY "Users can view team members for their teams" ON "public"."team_members" FOR SELECT USING ("public"."is_user_team_member"("team_id"));



CREATE POLICY "Users can view teams they belong to" ON "public"."teams" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "teams"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "Users can view their own achievement progress" ON "public"."achievement_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their teams" ON "public"."teams" FOR SELECT USING ("public"."is_user_team_member"("id"));



ALTER TABLE "public"."achievement_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievement_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_plan_plays" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_plan_situations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."helmet_stickers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."play_calls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."playbooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plays" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_attendance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_scripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_team_coach"("team_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_team_coach"("team_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_team_coach"("team_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_team_member"("team_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_team_member"("team_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_team_member"("team_uuid" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."achievement_definitions" TO "anon";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."achievement_progress" TO "anon";
GRANT ALL ON TABLE "public"."achievement_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."achievement_progress" TO "service_role";



GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."equipment" TO "anon";
GRANT ALL ON TABLE "public"."equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment" TO "service_role";



GRANT ALL ON TABLE "public"."game_plan_plays" TO "anon";
GRANT ALL ON TABLE "public"."game_plan_plays" TO "authenticated";
GRANT ALL ON TABLE "public"."game_plan_plays" TO "service_role";



GRANT ALL ON TABLE "public"."game_plan_situations" TO "anon";
GRANT ALL ON TABLE "public"."game_plan_situations" TO "authenticated";
GRANT ALL ON TABLE "public"."game_plan_situations" TO "service_role";



GRANT ALL ON TABLE "public"."game_plans" TO "anon";
GRANT ALL ON TABLE "public"."game_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."game_plans" TO "service_role";



GRANT ALL ON TABLE "public"."game_results" TO "anon";
GRANT ALL ON TABLE "public"."game_results" TO "authenticated";
GRANT ALL ON TABLE "public"."game_results" TO "service_role";



GRANT ALL ON TABLE "public"."helmet_stickers" TO "anon";
GRANT ALL ON TABLE "public"."helmet_stickers" TO "authenticated";
GRANT ALL ON TABLE "public"."helmet_stickers" TO "service_role";



GRANT ALL ON TABLE "public"."play_calls" TO "anon";
GRANT ALL ON TABLE "public"."play_calls" TO "authenticated";
GRANT ALL ON TABLE "public"."play_calls" TO "service_role";



GRANT ALL ON TABLE "public"."playbooks" TO "anon";
GRANT ALL ON TABLE "public"."playbooks" TO "authenticated";
GRANT ALL ON TABLE "public"."playbooks" TO "service_role";



GRANT ALL ON TABLE "public"."plays" TO "anon";
GRANT ALL ON TABLE "public"."plays" TO "authenticated";
GRANT ALL ON TABLE "public"."plays" TO "service_role";



GRANT ALL ON TABLE "public"."post_comments" TO "anon";
GRANT ALL ON TABLE "public"."post_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_comments" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."post_shares" TO "anon";
GRANT ALL ON TABLE "public"."post_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."post_shares" TO "service_role";



GRANT ALL ON TABLE "public"."practice_attendance" TO "anon";
GRANT ALL ON TABLE "public"."practice_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."practice_schedules" TO "anon";
GRANT ALL ON TABLE "public"."practice_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."practice_scripts" TO "anon";
GRANT ALL ON TABLE "public"."practice_scripts" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_scripts" TO "service_role";



GRANT ALL ON TABLE "public"."practice_templates" TO "anon";
GRANT ALL ON TABLE "public"."practice_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_templates" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."team_players" TO "anon";
GRANT ALL ON TABLE "public"."team_players" TO "authenticated";
GRANT ALL ON TABLE "public"."team_players" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."season_stats" TO "anon";
GRANT ALL ON TABLE "public"."season_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."season_stats" TO "service_role";



GRANT ALL ON TABLE "public"."team_events" TO "anon";
GRANT ALL ON TABLE "public"."team_events" TO "authenticated";
GRANT ALL ON TABLE "public"."team_events" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."team_posts" TO "anon";
GRANT ALL ON TABLE "public"."team_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."team_posts" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
