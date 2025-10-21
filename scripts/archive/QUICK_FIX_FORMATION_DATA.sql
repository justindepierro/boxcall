-- Quick Fix: Run this in Supabase SQL Editor to fix formation data NOW

-- Step 1A: See ALL plays with their formation values
SELECT 
  id,
  play_name,
  formation,
  personnel,
  p_type,
  one_word_play
FROM plays
ORDER BY play_name
LIMIT 20;

-- Step 1B: See what will be affected by the fix
SELECT 
  id,
  play_name,
  formation,
  personnel,
  p_type
FROM plays
WHERE 
  formation ~ '^\d+\s+Players?$'
  OR formation IN ('Blue', 'Black', 'Green', 'Red', 'Gold')
  OR formation ~ '^\d{2}\s+Personnel$'
  OR formation ~ '^\d{2}$'
ORDER BY play_name
LIMIT 20;

-- Step 2: Fix the data (sets formation to NULL where it has personnel names)
UPDATE plays
SET 
  formation = NULL,
  updated_at = NOW()
WHERE 
  formation ~ '^\d+\s+Players?$'
  OR formation IN ('Blue', 'Black', 'Green', 'Red', 'Gold', 'White', 'Orange')
  OR formation ~ '^\d{2}\s+Personnel$'
  OR formation ~ '^\d{2}$';

-- Step 3: Verify
SELECT COUNT(*) as "Plays with NULL formation"
FROM plays 
WHERE formation IS NULL;

-- Step 4: For "River" specifically, set it manually
-- (Replace 'your-play-id' with actual play IDs from Step 1)
/*
UPDATE plays
SET formation = 'River'
WHERE id IN (
  'play-id-1',
  'play-id-2'
);
*/
