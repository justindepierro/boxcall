-- Part 4: Create RLS Policies (run this after Part 3 succeeds)
-- Copy and paste this block, then click RUN

CREATE POLICY "activities_insert_policy" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_select_own" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "activities_select_team" ON public.activities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_memberships WHERE team_memberships.team_id = activities.team_id AND team_memberships.user_id = auth.uid()));

CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = user_id);
