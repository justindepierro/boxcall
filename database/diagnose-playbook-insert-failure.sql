-- =====================================================
-- Diagnose Playbook INSERT Policy Failure
-- =====================================================

-- Check your user's team memberships
SELECT 
  '👤 YOUR TEAM MEMBERSHIPS' as info,
  tm.user_id,
  tm.team_id,
  tm.team_role,
  tm.status,
  t.name as team_name
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';

-- Check what the INSERT policy is looking for
SELECT 
  '🔍 WHAT INSERT POLICY CHECKS' as info,
  tm.team_id,
  tm.team_role,
  tm.status
FROM team_members tm
WHERE tm.user_id = auth.uid()
  AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  AND tm.status = 'active';

-- Check existing playbooks
SELECT 
  '📘 EXISTING PLAYBOOKS' as info,
  id,
  name,
  team_id,
  created_by,
  created_at
FROM playbooks
WHERE created_by = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';

-- Test the INSERT policy manually
-- Replace YOUR_TEAM_ID with one of your team IDs from the first query
DO $$
DECLARE
  test_team_id uuid;
  can_insert boolean;
BEGIN
  -- Get your first team_id
  SELECT team_id INTO test_team_id
  FROM team_members
  WHERE user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0'
    AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND status = 'active'
  LIMIT 1;

  -- Check if the policy would allow INSERT
  SELECT EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm.user_id = 'fafcaafd-0154-4f87-9752-95fbfa2372a0'
      AND tm.team_id = test_team_id
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
  ) INTO can_insert;

  RAISE NOTICE 'Testing with team_id: %', test_team_id;
  RAISE NOTICE 'Policy check result: %', can_insert;
  RAISE NOTICE 'created_by check: %', ('fafcaafd-0154-4f87-9752-95fbfa2372a0' = 'fafcaafd-0154-4f87-9752-95fbfa2372a0');
END $$;
