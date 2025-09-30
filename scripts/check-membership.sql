-- Check team membership for your Burke Catholic team
SELECT 
  tm.*,
  t.name as team_name
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0'
   OR t.id = 'e2b03ad6-1660-487a-aa35-5de132f641b8';

-- If no results above, add the membership:
-- INSERT INTO team_members (team_id, user_id, team_role, status)
-- VALUES (
--     'e2b03ad6-1660-487a-aa35-5de132f641b8',
--     'fafcaafd-0154-4f87-9752-95fbfa2372a0',
--     'head_coach',
--     'active'
-- );