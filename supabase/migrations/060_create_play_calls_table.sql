-- Create the missing play_calls table
CREATE TABLE IF NOT EXISTS play_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID, -- Will reference game_results when created
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  quarter INTEGER,
  time_remaining TEXT,
  yard_line INTEGER,
  down INTEGER,
  distance INTEGER,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);