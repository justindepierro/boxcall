-- Simple debug - run each query separately

-- Query 1: Check teams
SELECT 
  id,
  name,
  school_name,
  created_at
FROM teams 
WHERE name ILIKE '%burke%' OR name ILIKE '%catholic%'
ORDER BY created_at DESC;

-- If no results above, check ALL teams:
-- SELECT id, name, school_name, created_at FROM teams ORDER BY created_at DESC LIMIT 5;