-- Add diagram data column to plays table
-- This stores the Pixi.js diagram editor data as JSONB

-- Add diagram_data column to store the diagram
ALTER TABLE plays
ADD COLUMN diagram_data JSONB DEFAULT NULL;
-- Add comment to document the column
COMMENT ON COLUMN plays.diagram_data IS 'Pixi.js diagram editor data - stores players, formations, routes, etc. Format: { version: 2, players: [...], meta: {...} }';
-- Create an index for faster queries on diagram_data
CREATE INDEX idx_plays_diagram_data ON plays USING GIN (diagram_data);
-- Example diagram_data structure:
-- {
--   "version": 2,
--   "players": [
--     {
--       "id": "player-123",
--       "x": 26.666,
--       "y": 25.5,
--       "jerseyNumber": "QB",
--       "team": "offense",
--       "position": "center"
--     }
--   ],
--   "meta": {
--     "createdAt": 1728480000000,
--     "updatedAt": 1728480000000,
--     "fieldPosition": "midfield",
--     "colorMode": "jade"
--   }
-- };
