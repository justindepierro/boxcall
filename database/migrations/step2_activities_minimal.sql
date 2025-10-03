CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON public.activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_play_id ON public.activities(play_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_team ON public.activities(user_id, team_id);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
DROP POLICY IF EXISTS "activities_select_team" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;

CREATE POLICY "activities_insert_policy" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_select_own" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "activities_select_team" ON public.activities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_members WHERE team_members.team_id = activities.team_id AND team_members.user_id = auth.uid()));

CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;
