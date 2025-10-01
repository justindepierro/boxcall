-- =====================================================
-- Check and Add Missing Columns to plays Table
-- =====================================================

-- First, see what columns currently exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plays'
ORDER BY ordinal_position;

-- Add missing columns that the app is trying to use
-- Based on the error, we need: complexity_score, is_archived, created_by, duplicate_key, diagram_url

-- 1. complexity_score
ALTER TABLE plays ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 0;

-- 2. is_archived
ALTER TABLE plays ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 3. created_by
ALTER TABLE plays ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 4. duplicate_key
ALTER TABLE plays ADD COLUMN IF NOT EXISTS duplicate_key TEXT;

-- 5. diagram_url
ALTER TABLE plays ADD COLUMN IF NOT EXISTS diagram_url TEXT;

-- 6. times_called
ALTER TABLE plays ADD COLUMN IF NOT EXISTS times_called INTEGER DEFAULT 0;

-- 7. times_successful
ALTER TABLE plays ADD COLUMN IF NOT EXISTS times_successful INTEGER DEFAULT 0;

-- 8. confidence_base
ALTER TABLE plays ADD COLUMN IF NOT EXISTS confidence_base DECIMAL(3,2) DEFAULT 0.5;

-- Verify all columns now exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plays'
  AND column_name IN (
    'complexity_score', 'is_archived', 'created_by', 
    'duplicate_key', 'diagram_url', 'times_called',
    'times_successful', 'confidence_base'
  )
ORDER BY column_name;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
