-- Emergency RLS Fix for BoxCall
-- This temporarily disables RLS to restore access, then applies proper policies

-- Step 1: Temporarily disable RLS on all tables
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE plays DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to manage teams" ON teams;
DROP POLICY IF EXISTS "Allow authenticated users to view team members" ON team_members;
DROP POLICY IF EXISTS "Allow authenticated users to manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow viewing all profiles temporarily" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow authenticated users to manage playbooks" ON playbooks;
DROP POLICY IF EXISTS "Allow authenticated users to view plays" ON plays;
DROP POLICY IF EXISTS "Allow authenticated users to manage plays" ON plays;
DROP POLICY IF EXISTS "Allow authenticated users to view team posts" ON team_posts;
DROP POLICY IF EXISTS "Allow authenticated users to manage team posts" ON team_posts;
DROP POLICY IF EXISTS "Allow authenticated users to view practice schedules" ON practice_schedules;
DROP POLICY IF EXISTS "Allow authenticated users to manage practice schedules" ON practice_schedules;

-- Step 3: Re-enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;

-- Step 4: Apply working policies
-- Service role gets full access
CREATE POLICY "Service role full access" ON teams FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON team_members FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON playbooks FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON plays FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON team_posts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role full access" ON practice_schedules FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can access their team's data
CREATE POLICY "Users can view their teams" ON teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = teams.id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view team members for their teams" ON team_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view profiles of team members" ON profiles FOR SELECT USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.user_id = profiles.id
    AND EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = tm.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.status = 'active'
    )
  )
);

CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can view team playbooks" ON playbooks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = playbooks.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can view team posts" ON team_posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_posts.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

CREATE POLICY "Users can create team posts" ON team_posts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_posts.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  ) AND author_id = auth.uid()
);

CREATE POLICY "Users can view practice schedules" ON practice_schedules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = practice_schedules.team_id
    AND tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);