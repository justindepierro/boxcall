-- Part 3: Drop old policies (run this after Part 2 succeeds)
-- Copy and paste this block, then click RUN

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
DROP POLICY IF EXISTS "activities_select_team" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;
