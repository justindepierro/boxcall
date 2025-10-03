-- =====================================================
-- Delete Orphaned Playbook and Test Play Creation
-- =====================================================

-- Step 1: Delete the orphaned playbook
DELETE FROM playbooks 
WHERE id = '9ab4afc1-1354-4db5-a7fd-45a4c65cd9a6';

-- Step 2: Verify it's gone
SELECT 
  'Remaining playbooks for you:' as info,
  COUNT(*) as count
FROM playbooks
WHERE created_by = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';

-- Should show: count = 0

-- =====================================================
-- Now your app will create a fresh playbook linked to
-- Burke Catholic (e2b03ad6-1660-487a-aa35-5de132f641b8)
-- with proper RLS access!
-- =====================================================
