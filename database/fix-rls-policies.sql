-- Simplified RLS Policies to Fix Recursion Issues
-- This is a temporary fix to resolve 500 errors

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Team coaches can update their teams" ON teams;
DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Simplified policies to avoid recursion

-- Teams: Allow authenticated users to view all teams for now (temporary)
CREATE POLICY "Allow authenticated users to view teams" ON teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage teams" ON teams
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Team members: Allow authenticated users to view team members (temporary)
CREATE POLICY "Allow authenticated users to view team members" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage team members" ON team_members
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Profiles: Allow users to view and update their own profiles
CREATE POLICY "Users can view their own profiles" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow viewing all profiles for now (temporary - for debugging)
CREATE POLICY "Allow viewing all profiles temporarily" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Playbooks: Allow authenticated users to access playbooks (temporary)
CREATE POLICY "Allow authenticated users to view playbooks" ON playbooks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage playbooks" ON playbooks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Plays: Allow authenticated users to access plays (temporary)
CREATE POLICY "Allow authenticated users to view plays" ON plays
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage plays" ON plays
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Team posts: Allow authenticated users to access posts (temporary)
CREATE POLICY "Allow authenticated users to view team posts" ON team_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage team posts" ON team_posts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Practice schedules: Allow authenticated users to access (temporary)
CREATE POLICY "Allow authenticated users to view practice schedules" ON practice_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage practice schedules" ON practice_schedules
  FOR ALL USING (auth.uid() IS NOT NULL);