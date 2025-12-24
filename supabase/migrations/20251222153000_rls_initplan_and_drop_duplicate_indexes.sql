-- =============================================================================
-- RLS INITPLAN PERFORMANCE FIXES + DUPLICATE INDEX CLEANUP
-- =============================================================================
--
-- Goals:
-- 1) Encourage initplan caching for auth-dependent RLS predicates by wrapping
--    auth.uid() calls as (SELECT auth.uid()).
-- 2) Drop confirmed duplicate btree indexes that exist under multiple names.
--
-- This migration is intentionally semantics-preserving.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- IMPORTANT:
-- All changes are CONDITIONAL on the target policy/index already existing.
-- This prevents accidentally re-introducing legacy policies in environments
-- where later migrations replaced them with differently-named policies.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 1) Team access policies
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbooks'
    AND policyname = 'Team coaches can manage playbooks'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage playbooks" ON public.playbooks$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage playbooks" ON public.playbooks
        FOR ALL USING (public.is_coaching_team_member((SELECT auth.uid()), playbooks.team_id))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
    AND policyname = 'Team members can view plays'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view plays" ON public.plays$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view plays" ON public.plays
        FOR SELECT USING (
          public.is_active_team_member(
            (SELECT auth.uid()),
            public.get_playbook_team_id(plays.playbook_id)
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plays'
    AND policyname = 'Team coaches can manage plays'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage plays" ON public.plays$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage plays" ON public.plays
        FOR ALL USING (
          public.is_coaching_team_member(
            (SELECT auth.uid()),
            public.get_playbook_team_id(plays.playbook_id)
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_scripts'
    AND policyname = 'Team members can view practice scripts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view practice scripts" ON public.practice_scripts$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view practice scripts" ON public.practice_scripts
        FOR SELECT USING (public.is_active_team_member((SELECT auth.uid()), practice_scripts.team_id))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_scripts'
    AND policyname = 'Team coaches can manage practice scripts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage practice scripts" ON public.practice_scripts$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage practice scripts" ON public.practice_scripts
        FOR ALL USING (public.is_coaching_team_member((SELECT auth.uid()), practice_scripts.team_id))
    $sql$;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 2) Core / legacy policy initplan fixes
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- Profiles
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Users can update their own profiles'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can update their own profiles" ON public.profiles$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can update their own profiles" ON public.profiles
        FOR UPDATE USING (id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Users can insert their own profiles'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can insert their own profiles" ON public.profiles$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can insert their own profiles" ON public.profiles
        FOR INSERT WITH CHECK (id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Play versions
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'play_versions'
    AND policyname = 'Users can view play versions'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can view play versions" ON public.play_versions$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can view play versions" ON public.play_versions
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1
            FROM public.plays p
            JOIN public.playbooks pb ON p.playbook_id = pb.id
            JOIN public.team_members tm ON pb.team_id = tm.team_id
            WHERE p.id = play_versions.play_id
              AND tm.user_id = (SELECT auth.uid())
              AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'play_versions'
    AND policyname = 'Users can create play versions'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can create play versions" ON public.play_versions$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can create play versions" ON public.play_versions
        FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.plays p
            JOIN public.playbooks pb ON p.playbook_id = pb.id
            JOIN public.team_members tm ON pb.team_id = tm.team_id
            WHERE p.id = play_versions.play_id
              AND tm.user_id = (SELECT auth.uid())
              AND tm.status = 'active'
              AND tm.capabilities->>'can_manage_playbook' = 'true'
          )
        )
    $sql$;
  END IF;

  -- Playbook view presets
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbook_view_presets'
    AND policyname = 'Users can view their own presets'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can view their own presets" ON public.playbook_view_presets$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can view their own presets" ON public.playbook_view_presets
        FOR SELECT
        USING ((SELECT auth.uid()) = user_id)
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbook_view_presets'
    AND policyname = 'Users can view team presets'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can view team presets" ON public.playbook_view_presets$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can view team presets" ON public.playbook_view_presets
        FOR SELECT
        USING (
          team_id IN (
            SELECT tm.team_id FROM public.team_members tm
            WHERE tm.user_id = (SELECT auth.uid())
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbook_view_presets'
    AND policyname = 'Users can create their own presets'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can create their own presets" ON public.playbook_view_presets$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can create their own presets" ON public.playbook_view_presets
        FOR INSERT
        WITH CHECK ((SELECT auth.uid()) = user_id)
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbook_view_presets'
    AND policyname = 'Users can update their own presets'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can update their own presets" ON public.playbook_view_presets$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can update their own presets" ON public.playbook_view_presets
        FOR UPDATE
        USING ((SELECT auth.uid()) = user_id)
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'playbook_view_presets'
    AND policyname = 'Users can delete their own presets'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can delete their own presets" ON public.playbook_view_presets$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can delete their own presets" ON public.playbook_view_presets
        FOR DELETE
        USING ((SELECT auth.uid()) = user_id)
    $sql$;
  END IF;

  -- Team posts
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_posts'
    AND policyname = 'Team members can create team posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can create team posts" ON public.team_posts$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can create team posts" ON public.team_posts
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_posts.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          ) AND author_id = (SELECT auth.uid())
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_posts'
    AND policyname = 'Users can update their own posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Users can update their own posts" ON public.team_posts$sql$;
    EXECUTE $sql$
      CREATE POLICY "Users can update their own posts" ON public.team_posts
        FOR UPDATE USING (author_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_posts'
    AND policyname = 'Team coaches can manage all posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage all posts" ON public.team_posts$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage all posts" ON public.team_posts
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_posts.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Post interactions
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_likes'
    AND policyname = 'Team members can like posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can like posts" ON public.post_likes$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can like posts" ON public.post_likes
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.team_posts tp ON tp.team_id = tm.team_id
            WHERE tp.id = post_likes.post_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_comments'
    AND policyname = 'Team members can comment on posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can comment on posts" ON public.post_comments$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can comment on posts" ON public.post_comments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.team_posts tp ON tp.team_id = tm.team_id
            WHERE tp.id = post_comments.post_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_shares'
    AND policyname = 'Team members can share posts'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can share posts" ON public.post_shares$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can share posts" ON public.post_shares
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.team_posts tp ON tp.team_id = tm.team_id
            WHERE tp.id = post_shares.post_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Game management
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_plans'
    AND policyname = 'Team coaches can manage game plans'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage game plans" ON public.game_plans$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage game plans" ON public.game_plans
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = game_plans.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_plan_situations'
    AND policyname = 'Team coaches can manage game situations'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage game situations" ON public.game_plan_situations$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage game situations" ON public.game_plan_situations
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.game_plans gp ON gp.team_id = tm.team_id
            WHERE gp.id = game_plan_situations.game_plan_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_results'
    AND policyname = 'Team members can view game results'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view game results" ON public.game_results$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view game results" ON public.game_results
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = game_results.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_results'
    AND policyname = 'Team coaches can manage game results'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage game results" ON public.game_results$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage game results" ON public.game_results
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = game_results.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Practice management
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_schedules'
    AND policyname = 'Team coaches can manage practice schedules'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage practice schedules" ON public.practice_schedules$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage practice schedules" ON public.practice_schedules
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = practice_schedules.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_attendance'
    AND policyname = 'Team members can view practice attendance'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view practice attendance" ON public.practice_attendance$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view practice attendance" ON public.practice_attendance
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.practice_schedules ps ON ps.team_id = tm.team_id
            WHERE ps.id = practice_attendance.practice_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_attendance'
    AND policyname = 'Team coaches can manage practice attendance'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage practice attendance" ON public.practice_attendance$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage practice attendance" ON public.practice_attendance
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.practice_schedules ps ON ps.team_id = tm.team_id
            WHERE ps.id = practice_attendance.practice_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'practice_templates'
    AND policyname = 'Team coaches can manage practice templates'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage practice templates" ON public.practice_templates$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage practice templates" ON public.practice_templates
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = practice_templates.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Analytics / awards
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'achievements'
    AND policyname = 'Team coaches can manage achievements'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage achievements" ON public.achievements$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage achievements" ON public.achievements
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = (SELECT team_id FROM public.team_players WHERE id = achievements.player_id)
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'helmet_stickers'
    AND policyname = 'Team members can view helmet stickers'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view helmet stickers" ON public.helmet_stickers$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view helmet stickers" ON public.helmet_stickers
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = (SELECT team_id FROM public.team_players WHERE id = helmet_stickers.player_id)
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'helmet_stickers'
    AND policyname = 'Team coaches can manage helmet stickers'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage helmet stickers" ON public.helmet_stickers$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage helmet stickers" ON public.helmet_stickers
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = (SELECT team_id FROM public.team_players WHERE id = helmet_stickers.player_id)
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Calendar / events
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'calendar_events'
    AND policyname = 'Team members can view calendar events'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view calendar events" ON public.calendar_events$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view calendar events" ON public.calendar_events
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = calendar_events.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'calendar_events'
    AND policyname = 'Team coaches can manage calendar events'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage calendar events" ON public.calendar_events$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage calendar events" ON public.calendar_events
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = calendar_events.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_events'
    AND policyname = 'Team coaches can manage team events'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage team events" ON public.team_events$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage team events" ON public.team_events
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_events.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Equipment
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'equipment'
    AND policyname = 'Team members can view equipment'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view equipment" ON public.equipment$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view equipment" ON public.equipment
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = equipment.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'equipment'
    AND policyname = 'Team coaches can manage equipment'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage equipment" ON public.equipment$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage equipment" ON public.equipment
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = equipment.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Game plan plays
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_plan_plays'
    AND policyname = 'Team coaches can manage game plan plays'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team coaches can manage game plan plays" ON public.game_plan_plays$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team coaches can manage game plan plays" ON public.game_plan_plays
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.game_plans gp ON gp.team_id = tm.team_id
            JOIN public.game_plan_situations gps ON gps.game_plan_id = gp.id
            WHERE gps.id = game_plan_plays.situation_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_plan_plays'
    AND policyname = 'Team members can view game plan plays'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view game plan plays" ON public.game_plan_plays$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view game plan plays" ON public.game_plan_plays
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.game_plans gp ON gp.team_id = tm.team_id
            JOIN public.game_plan_situations gps ON gps.game_plan_id = gp.id
            WHERE gps.id = game_plan_plays.situation_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  -- Team announcements (older policy set)
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_announcements'
    AND policyname = 'Team members can view announcements'
  ) THEN
    EXECUTE $sql$DROP POLICY "Team members can view announcements" ON public.team_announcements$sql$;
    EXECUTE $sql$
      CREATE POLICY "Team members can view announcements" ON public.team_announcements
        FOR SELECT USING (
          deleted_at IS NULL
          AND EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_announcements.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_announcements'
    AND policyname = 'Coaches can create announcements'
  ) THEN
    EXECUTE $sql$DROP POLICY "Coaches can create announcements" ON public.team_announcements$sql$;
    EXECUTE $sql$
      CREATE POLICY "Coaches can create announcements" ON public.team_announcements
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_announcements.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
            AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_announcements'
    AND policyname = 'Coaches can update own announcements'
  ) THEN
    EXECUTE $sql$DROP POLICY "Coaches can update own announcements" ON public.team_announcements$sql$;
    EXECUTE $sql$
      CREATE POLICY "Coaches can update own announcements" ON public.team_announcements
        FOR UPDATE USING (
          created_by = (SELECT auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_announcements.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
            AND tm.team_role IN ('head_coach', 'coordinator')
          )
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_announcements'
    AND policyname = 'Coaches can delete own announcements'
  ) THEN
    EXECUTE $sql$DROP POLICY "Coaches can delete own announcements" ON public.team_announcements$sql$;
    EXECUTE $sql$
      CREATE POLICY "Coaches can delete own announcements" ON public.team_announcements
        FOR DELETE USING (
          created_by = (SELECT auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_announcements.team_id
            AND tm.user_id = (SELECT auth.uid())
            AND tm.status = 'active'
            AND tm.team_role IN ('head_coach', 'coordinator')
          )
        )
    $sql$;
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2b) Generic initplan wrapper for policies that may only exist in the live DB
-- ----------------------------------------------------------------------------
-- Some environments can have policy names that are not present in repo-managed
-- migrations (e.g. created directly in Supabase SQL editor). To avoid guessing
-- semantics, we re-create the policy using pg_policies.qual/with_check while
-- only wrapping auth.uid()/auth.role() calls.

DO $$
DECLARE
  pol record;
  roles_sql text;
  using_expr text;
  check_expr text;
  using_new text;
  check_new text;
  create_sql text;
BEGIN
  FOR pol IN
    SELECT *
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.role()%')
        OR (with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.role()%')
      )
  LOOP

    SELECT string_agg(CASE WHEN r = 'public' THEN 'PUBLIC' ELSE quote_ident(r) END, ', ')
    INTO roles_sql
    FROM unnest(pol.roles) r;

    using_expr := pol.qual;
    using_new := using_expr;
    IF using_new IS NOT NULL THEN
      using_new := replace(using_new, '(SELECT auth.uid())', '__AUTH_UID__');
      using_new := replace(using_new, '(SELECT auth.role())', '__AUTH_ROLE__');
      using_new := replace(using_new, 'auth.uid()', '(SELECT auth.uid())');
      using_new := replace(using_new, 'auth.role()', '(SELECT auth.role())');
      using_new := replace(using_new, '__AUTH_UID__', '(SELECT auth.uid())');
      using_new := replace(using_new, '__AUTH_ROLE__', '(SELECT auth.role())');
    END IF;

    check_expr := pol.with_check;
    check_new := check_expr;
    IF check_new IS NOT NULL THEN
      check_new := replace(check_new, '(SELECT auth.uid())', '__AUTH_UID__');
      check_new := replace(check_new, '(SELECT auth.role())', '__AUTH_ROLE__');
      check_new := replace(check_new, 'auth.uid()', '(SELECT auth.uid())');
      check_new := replace(check_new, 'auth.role()', '(SELECT auth.role())');
      check_new := replace(check_new, '__AUTH_UID__', '(SELECT auth.uid())');
      check_new := replace(check_new, '__AUTH_ROLE__', '(SELECT auth.role())');
    END IF;

    IF using_new IS NOT DISTINCT FROM using_expr
       AND check_new IS NOT DISTINCT FROM check_expr THEN
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    create_sql := format(
      'CREATE POLICY %I ON %I.%I %s FOR %s %s',
      pol.policyname,
      pol.schemaname,
      pol.tablename,
      CASE WHEN pol.permissive = 'RESTRICTIVE' THEN 'AS RESTRICTIVE' ELSE '' END,
      pol.cmd,
      CASE WHEN roles_sql IS NULL OR roles_sql = '' THEN '' ELSE 'TO ' || roles_sql END
    );

    IF using_new IS NOT NULL THEN
      create_sql := create_sql || ' USING (' || using_new || ')';
    END IF;

    IF check_new IS NOT NULL THEN
      create_sql := create_sql || ' WITH CHECK (' || check_new || ')';
    END IF;

    EXECUTE create_sql;
  END LOOP;
END
$$;

-- -----------------------------------------------------------------------------
-- 3) Social policies (latest definitions live in 20251211230003_part3_rls)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  -- Notifications
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications'
    AND policyname = 'notifications_select'
  ) THEN
    EXECUTE $sql$DROP POLICY "notifications_select" ON public.notifications$sql$;
    EXECUTE $sql$
      CREATE POLICY "notifications_select" ON public.notifications
        FOR SELECT USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications'
    AND policyname = 'notifications_update'
  ) THEN
    EXECUTE $sql$DROP POLICY "notifications_update" ON public.notifications$sql$;
    EXECUTE $sql$
      CREATE POLICY "notifications_update" ON public.notifications
        FOR UPDATE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications'
    AND policyname = 'notifications_delete'
  ) THEN
    EXECUTE $sql$DROP POLICY "notifications_delete" ON public.notifications$sql$;
    EXECUTE $sql$
      CREATE POLICY "notifications_delete" ON public.notifications
        FOR DELETE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Mentions
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mentions'
    AND policyname = 'mentions_select'
  ) THEN
    EXECUTE $sql$DROP POLICY "mentions_select" ON public.mentions$sql$;
    EXECUTE $sql$
      CREATE POLICY "mentions_select" ON public.mentions
        FOR SELECT USING (
          mentioned_user_id = (SELECT auth.uid()) OR created_by_user_id = (SELECT auth.uid())
        )
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mentions'
    AND policyname = 'mentions_insert'
  ) THEN
    EXECUTE $sql$DROP POLICY "mentions_insert" ON public.mentions$sql$;
    EXECUTE $sql$
      CREATE POLICY "mentions_insert" ON public.mentions
        FOR INSERT WITH CHECK (created_by_user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Team announcements (newer policy names)
  -- NOTE: announcements_* policies are rewritten by the generic pg_policies-based
  -- wrapper block above to avoid assuming column names (created_by vs author_id).

  -- Announcement reactions
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_reactions'
    AND policyname = 'ann_reactions_insert'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_reactions_insert" ON public.announcement_reactions$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_reactions_insert" ON public.announcement_reactions
        FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_reactions'
    AND policyname = 'ann_reactions_delete'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_reactions_delete" ON public.announcement_reactions$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_reactions_delete" ON public.announcement_reactions
        FOR DELETE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Announcement comments
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_comments'
    AND policyname = 'ann_comments_insert'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_comments_insert" ON public.announcement_comments$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_comments_insert" ON public.announcement_comments
        FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_comments'
    AND policyname = 'ann_comments_update'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_comments_update" ON public.announcement_comments$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_comments_update" ON public.announcement_comments
        FOR UPDATE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_comments'
    AND policyname = 'ann_comments_delete'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_comments_delete" ON public.announcement_comments$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_comments_delete" ON public.announcement_comments
        FOR DELETE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Announcement views
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_views'
    AND policyname = 'ann_views_select'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_views_select" ON public.announcement_views$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_views_select" ON public.announcement_views
        FOR SELECT USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'announcement_views'
    AND policyname = 'ann_views_insert'
  ) THEN
    EXECUTE $sql$DROP POLICY "ann_views_insert" ON public.announcement_views$sql$;
    EXECUTE $sql$
      CREATE POLICY "ann_views_insert" ON public.announcement_views
        FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  -- Comment reactions
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'comment_reactions'
    AND policyname = 'comment_reactions_insert'
  ) THEN
    EXECUTE $sql$DROP POLICY "comment_reactions_insert" ON public.comment_reactions$sql$;
    EXECUTE $sql$
      CREATE POLICY "comment_reactions_insert" ON public.comment_reactions
        FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'comment_reactions'
    AND policyname = 'comment_reactions_delete'
  ) THEN
    EXECUTE $sql$DROP POLICY "comment_reactions_delete" ON public.comment_reactions$sql$;
    EXECUTE $sql$
      CREATE POLICY "comment_reactions_delete" ON public.comment_reactions
        FOR DELETE USING (user_id = (SELECT auth.uid()))
    $sql$;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 4) Confirmed duplicate index cleanup
-- -----------------------------------------------------------------------------
-- These pairs were found to be duplicates by definition (same table + columns):
-- - notifications(user_id): idx_notifications_user_id vs idx_notifications_user
-- - mentions(mentioned_user_id): idx_mentions_mentioned_user_id vs idx_mentions_mentioned_user
-- - mentions(created_by_user_id): idx_mentions_created_by_user_id vs idx_mentions_created_by_user
-- - personnel_configurations(playbook_id): idx_personnel_configurations_playbook_id vs idx_personnel_configs_playbook
-- - personnel_players(config_id): idx_personnel_players_config_id vs idx_personnel_players_config
-- - formations(playbook_id): idx_formations_playbook_id vs idx_formations_playbook
-- - team_announcements(team_id): idx_team_announcements_team_id vs idx_announcements_team
-- - practice_sessions(team_id): idx_practice_sessions_team_id vs idx_practice_sessions_team

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_notifications_user_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_notifications_user') THEN
    EXECUTE 'DROP INDEX public.idx_notifications_user';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_mentions_mentioned_user_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_mentions_mentioned_user') THEN
    EXECUTE 'DROP INDEX public.idx_mentions_mentioned_user';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_mentions_created_by_user_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_mentions_created_by_user') THEN
    EXECUTE 'DROP INDEX public.idx_mentions_created_by_user';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_personnel_configurations_playbook_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_personnel_configs_playbook') THEN
    EXECUTE 'DROP INDEX public.idx_personnel_configs_playbook';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_personnel_players_config_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_personnel_players_config') THEN
    EXECUTE 'DROP INDEX public.idx_personnel_players_config';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_formations_playbook_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_formations_playbook') THEN
    EXECUTE 'DROP INDEX public.idx_formations_playbook';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_team_announcements_team_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_announcements_team') THEN
    EXECUTE 'DROP INDEX public.idx_announcements_team';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_practice_sessions_team_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_practice_sessions_team') THEN
    EXECUTE 'DROP INDEX public.idx_practice_sessions_team';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_announcement_comments_announcement_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_ann_comments_announcement') THEN
    EXECUTE 'DROP INDEX public.idx_ann_comments_announcement';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_announcement_reactions_announcement_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_ann_reactions_announcement') THEN
    EXECUTE 'DROP INDEX public.idx_ann_reactions_announcement';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_game_sessions_team_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_game_sessions_team') THEN
    EXECUTE 'DROP INDEX public.idx_game_sessions_team';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_games_team_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_games_team') THEN
    EXECUTE 'DROP INDEX public.idx_games_team';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_plays_type')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_plays_p_type') THEN
    EXECUTE 'DROP INDEX public.idx_plays_p_type';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_plays_playbook_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_plays_playbook') THEN
    EXECUTE 'DROP INDEX public.idx_plays_playbook';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_practice_script_plays_script_id')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'idx_practice_script_plays_script') THEN
    EXECUTE 'DROP INDEX public.idx_practice_script_plays_script';
  END IF;
END
$$;
