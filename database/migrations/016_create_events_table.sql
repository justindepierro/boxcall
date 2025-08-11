-- 016_create_events_table.sql
-- Purpose: Introduce events table for application + vitals telemetry persistence.
-- Idempotent via IF NOT EXISTS guards.

BEGIN;

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  payload JSONB,
  session_id TEXT,
  trace_id TEXT,
  user_id UUID,
  -- Basic indexing fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events(type, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_ts ON events(user_id, ts DESC);

COMMENT ON TABLE events IS 'Application + performance telemetry events.';
COMMENT ON COLUMN events.type IS 'Event type identifier (namespaced).';
COMMENT ON COLUMN events.payload IS 'Arbitrary JSON payload (redacted client-side).';

COMMIT;
