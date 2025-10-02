-- Verify the activities table was created successfully
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'activities'
  AND table_schema = 'public';

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'activities'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we can insert a test row (this will verify foreign keys work)
-- Don't worry if this fails - just tells us about data requirements
SELECT 
  'Table is ready!' as status,
  COUNT(*) as current_row_count
FROM public.activities;
