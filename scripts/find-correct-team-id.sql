-- First, let's see what columns actually exist in the teams table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'teams' 
ORDER BY ordinal_position;

-- Find the correct team ID for Burke Catholic High School Eagles
-- This will show you the actual team IDs in your database

SELECT 
    id,
    name,
    school_name,
    created_at
FROM teams 
WHERE school_name ILIKE '%burke%' 
   OR school_name ILIKE '%catholic%'
   OR name ILIKE '%eagles%'
ORDER BY created_at DESC;

-- Also check what teams you currently have
SELECT 
    id,
    name,
    school_name,
    created_at
FROM teams 
ORDER BY created_at DESC
LIMIT 10;