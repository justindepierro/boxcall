-- Better RLS Policies for BoxCall
-- These policies allow team members to access their team's data

-- Drop existing policies
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

-- Teams: Users can view teams they belong to
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Team members: Users can view team members for teams they belong to
CREATE POLICY "Users can view team members for their teams" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Profiles: Users can view profiles of team members, and their own profile
CREATE POLICY "Users can view profiles of team members" ON profiles
  FOR SELECT USING (
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

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Playbooks: Team members can access their team's playbooks
CREATE POLICY "Team members can view playbooks" ON playbooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage playbooks" ON playbooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = playbooks.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Plays: Team members can access their team's plays
CREATE POLICY "Team members can view plays" ON plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Team posts: Team members can view and create posts
CREATE POLICY "Team members can view team posts" ON team_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team members can create team posts" ON team_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own posts" ON team_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Team coaches can manage all posts" ON team_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Practice schedules: Team members can access their team's schedules
CREATE POLICY "Team members can view practice schedules" ON practice_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_schedules.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "Team coaches can manage practice schedules" ON practice_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_schedules.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );