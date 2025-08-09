-- Migration: Optionally add sport column to teams
-- This is separate so it can be applied only when UI field should persist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'sport'
  ) THEN
    ALTER TABLE teams ADD COLUMN sport TEXT;
  END IF;
END $$;

-- (Optional) Add a simple check constraint with a controlled allowed set
-- Uncomment to enforce (ensure list matches UI options)
-- ALTER TABLE teams
--   ADD CONSTRAINT teams_sport_check CHECK (
--     sport IS NULL OR sport IN (
--       'Football','Basketball','Baseball','Soccer','Track & Field','Wrestling','Volleyball','Cross Country','Swimming','Tennis','Golf','Lacrosse','Field Hockey','Softball','Other'
--     )
--   );

-- Index if querying by sport frequently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relname='idx_teams_sport' AND n.nspname='public'
  ) THEN
    CREATE INDEX idx_teams_sport ON teams(sport);
  END IF;
END $$;
