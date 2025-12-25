-- Play analytics: single source of truth
-- Canonical stats live in play_executions (event log)
-- plays.times_called / plays.times_successful are treated as derived cache-only fields.

-- ============================================================================
-- VIEW: play_execution_stats
-- ============================================================================

CREATE OR REPLACE VIEW public.play_execution_stats
WITH (security_invoker = true)
AS
SELECT
  pe.play_id,
  COUNT(*) FILTER (WHERE pe.result <> 'skipped')::INTEGER AS times_called,
  COUNT(*) FILTER (WHERE pe.result = 'success')::INTEGER AS times_successful,
  MAX(pe.executed_at) AS last_executed_at
FROM public.play_executions pe
WHERE pe.play_id IS NOT NULL
GROUP BY pe.play_id;

-- ============================================================================
-- FUNCTIONS: recompute derived play counters
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recompute_play_execution_counts(p_play_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_play_id IS NULL THEN
    RETURN;
  END IF;

  -- If there are executions, compute counts; otherwise force to zero.
  UPDATE public.plays p
  SET
    times_called = COALESCE(s.times_called, 0),
    times_successful = COALESCE(s.times_successful, 0)
  FROM (
    SELECT
      pe.play_id,
      COUNT(*) FILTER (WHERE pe.result <> 'skipped')::INTEGER AS times_called,
      COUNT(*) FILTER (WHERE pe.result = 'success')::INTEGER AS times_successful
    FROM public.play_executions pe
    WHERE pe.play_id = p_play_id
    GROUP BY pe.play_id
  ) s
  WHERE p.id = p_play_id;

  UPDATE public.plays p
  SET
    times_called = 0,
    times_successful = 0
  WHERE
    p.id = p_play_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.play_executions pe
      WHERE pe.play_id = p_play_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.on_play_executions_change_update_play_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_play_id UUID;
  new_play_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_play_id := NEW.play_id;
    PERFORM public.recompute_play_execution_counts(new_play_id);
    RETURN NULL;
  END IF;

  IF TG_OP = 'DELETE' THEN
    old_play_id := OLD.play_id;
    PERFORM public.recompute_play_execution_counts(old_play_id);
    RETURN NULL;
  END IF;

  -- UPDATE
  old_play_id := OLD.play_id;
  new_play_id := NEW.play_id;

  -- Recompute for old play if play_id or result changed.
  IF (old_play_id IS DISTINCT FROM new_play_id) OR (OLD.result IS DISTINCT FROM NEW.result) THEN
    PERFORM public.recompute_play_execution_counts(old_play_id);
    PERFORM public.recompute_play_execution_counts(new_play_id);
  END IF;

  RETURN NULL;
END;
$$;

-- ============================================================================
-- TRIGGERS: keep plays counters in sync with play_executions
-- ============================================================================

DROP TRIGGER IF EXISTS trg_play_executions_after_insert_recompute_play_counts ON public.play_executions;
CREATE TRIGGER trg_play_executions_after_insert_recompute_play_counts
AFTER INSERT ON public.play_executions
FOR EACH ROW
EXECUTE FUNCTION public.on_play_executions_change_update_play_counts();

DROP TRIGGER IF EXISTS trg_play_executions_after_delete_recompute_play_counts ON public.play_executions;
CREATE TRIGGER trg_play_executions_after_delete_recompute_play_counts
AFTER DELETE ON public.play_executions
FOR EACH ROW
EXECUTE FUNCTION public.on_play_executions_change_update_play_counts();

DROP TRIGGER IF EXISTS trg_play_executions_after_update_recompute_play_counts ON public.play_executions;
CREATE TRIGGER trg_play_executions_after_update_recompute_play_counts
AFTER UPDATE OF play_id, result ON public.play_executions
FOR EACH ROW
EXECUTE FUNCTION public.on_play_executions_change_update_play_counts();

-- ============================================================================
-- GUARDRAIL: ignore manual attempts to edit derived counters
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_manual_play_counter_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow internal trigger-driven updates (from play_executions trigger)
  IF pg_trigger_depth() = 0 THEN
    NEW.times_called := OLD.times_called;
    NEW.times_successful := OLD.times_successful;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plays_before_update_prevent_manual_counters ON public.plays;
CREATE TRIGGER trg_plays_before_update_prevent_manual_counters
BEFORE UPDATE OF times_called, times_successful ON public.plays
FOR EACH ROW
EXECUTE FUNCTION public.prevent_manual_play_counter_updates();

-- ============================================================================
-- BACKFILL: sync all existing plays from play_executions
-- ============================================================================

UPDATE public.plays p
SET
  times_called = COALESCE(s.times_called, 0),
  times_successful = COALESCE(s.times_successful, 0)
FROM (
  SELECT
    pe.play_id,
    COUNT(*) FILTER (WHERE pe.result <> 'skipped')::INTEGER AS times_called,
    COUNT(*) FILTER (WHERE pe.result = 'success')::INTEGER AS times_successful
  FROM public.play_executions pe
  WHERE pe.play_id IS NOT NULL
  GROUP BY pe.play_id
) s
WHERE p.id = s.play_id;

UPDATE public.plays p
SET
  times_called = 0,
  times_successful = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM public.play_executions pe
  WHERE pe.play_id = p.id
);
