-- Migration: 028 - Create Season Stats View
-- Purpose: Provide aggregated season statistics from game results
-- Date: September 23, 2025

-- Create season_stats view that aggregates game results by team and season
CREATE OR REPLACE VIEW public.season_stats AS
SELECT
  gr.team_id,
  EXTRACT(YEAR FROM gr.game_date)::integer as season_year,
  COUNT(*)::integer as games_played,
  COUNT(CASE WHEN gr.points_for > gr.points_against THEN 1 END)::integer as wins,
  COUNT(CASE WHEN gr.points_for < gr.points_against THEN 1 END)::integer as losses,
  SUM(gr.points_for)::integer as pf_total,
  SUM(gr.points_against)::integer as pa_total,
  CASE
    WHEN COUNT(*) > 0 THEN
      ROUND(
        (COUNT(CASE WHEN gr.points_for > gr.points_against THEN 1 END)::numeric /
         COUNT(*)::numeric) * 100,
        1
      )
    ELSE NULL
  END as win_pct
FROM public.game_results gr
GROUP BY gr.team_id, EXTRACT(YEAR FROM gr.game_date);

-- Grant access to authenticated users
GRANT SELECT ON public.season_stats TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.season_stats IS 'Aggregated season statistics calculated from game_results table';