-- =====================================================
-- Test Manual INSERT to See Exact Error
-- =====================================================

-- Try to insert a test playbook
-- Using your Burke Catholic team ID
INSERT INTO playbooks (team_id, name, created_by)
VALUES (
  'e2b03ad6-1660-487a-aa35-5de132f641b8'::uuid,
  'Test Playbook Manual',
  'fafcaafd-0154-4f87-9752-95fbfa2372a0'::uuid
);

-- Check if it was created
SELECT 
  id,
  name,
  team_id,
  created_by,
  is_active
FROM playbooks
WHERE name = 'Test Playbook Manual';
