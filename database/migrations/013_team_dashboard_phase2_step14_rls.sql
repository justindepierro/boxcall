-- Migration: Team Dashboard Phase 2 Step 14 (RLS & Policies)
-- Depends on: 012_team_dashboard_phase2_step13.sql
-- Purpose: Secure newly added tables (team_events, game_results) and expose season_stats via membership.
-- NOTE: Adjust capability role checks if your role/capability mapping differs.

-- 1. ENABLE RLS -----------------------------------------------------------------------
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
-- season_stats is a VIEW; access governed by underlying table policies.

-- 2. HELPER: membership predicate ------------------------------------------------------
-- We assume team_members table with columns: id, team_id, user_id, role
-- Roles: head_coach, coach, player, family, etc.
-- If naming differs, adjust below.

-- 3. SELECT Policies (team membership) -------------------------------------------------
CREATE POLICY team_events_select ON public.team_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_events.team_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY game_results_select ON public.game_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = game_results.team_id AND m.user_id = auth.uid()
    )
  );

-- 4. WRITE Policies (coach capability) -------------------------------------------------
-- Coach-capable roles set; extend if assistants exist later.
CREATE POLICY team_events_insert_coach ON public.team_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_events.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

CREATE POLICY team_events_update_coach ON public.team_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_events.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_events.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

CREATE POLICY team_events_delete_coach ON public.team_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_events.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

CREATE POLICY game_results_insert_coach ON public.game_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = game_results.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

CREATE POLICY game_results_update_coach ON public.game_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = game_results.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = game_results.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

CREATE POLICY game_results_delete_coach ON public.game_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = game_results.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach','coach')
    )
  );

-- 5. Optional future: granular capability table join instead of role IN list.
-- Example pattern (not executed):
--   EXISTS (SELECT 1 FROM user_capabilities c WHERE c.user_id=auth.uid() AND c.team_id=team_events.team_id AND c.capability='CAN_CREATE_EVENT')

-- 6. COMMENT: season_stats view SELECT inherits game_results SELECT; no separate policy needed.

-- 7. SECURITY TEST QUERIES (commented) -------------------------------------------------
-- EXPLAIN SELECT * FROM public.team_events WHERE team_id = '00000000-0000-0000-0000-000000000000';
-- Attempt unauthorized insert (should fail for player):
-- INSERT INTO public.team_events (team_id, created_by, title, event_type, starts_at) VALUES (...);

-- END OF STEP 14
