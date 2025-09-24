
    -- Emergency RLS Fix: Temporarily disable RLS to resolve 500 errors
-- This will allow the app to work while we fix the policies properly

ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE plays DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Team coaches can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Team members can view playbooks" ON playbooks;
DROP POLICY IF EXISTS "Team coaches can manage playbooks" ON playbooks;
DROP POLICY IF EXISTS "Team members can view plays" ON plays;
DROP POLICY IF EXISTS "Team coaches can manage plays" ON plays;
DROP POLICY IF EXISTS "Team members can view team posts" ON team_posts;
DROP POLICY IF EXISTS "Team members can create team posts" ON team_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON team_posts;
DROP POLICY IF EXISTS "Team coaches can manage all posts" ON team_posts;
DROP POLICY IF EXISTS "Team members can view practice schedules" ON practice_schedules;
DROP POLICY IF EXISTS "Team coaches can manage practice schedules" ON practice_schedules;

-- Create simple permissive policies for now
CREATE POLICY "Allow authenticated users to view teams" ON teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage teams" ON teams
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view team members" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage team members" ON team_members
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profiles" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Allow viewing all profiles temporarily" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view playbooks" ON playbooks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage playbooks" ON playbooks
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view plays" ON plays
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage plays" ON plays
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view team posts" ON team_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage team posts" ON team_posts
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view practice schedules" ON practice_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage practice schedules" ON practice_schedules
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Re-enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_schedules ENABLE ROW LEVEL SECURITY;
  