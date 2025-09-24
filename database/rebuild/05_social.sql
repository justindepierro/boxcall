-- ===========================================
-- SOCIAL FEATURES
-- ===========================================

CREATE TABLE team_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES team_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view posts" ON team_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can create posts" ON team_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Users can update their own posts" ON team_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Team coaches can manage all posts" ON team_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_posts.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can interact with posts" ON post_likes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_posts tp
      JOIN team_members tm ON tm.team_id = tp.team_id
      WHERE tp.id = post_likes.post_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can comment on posts" ON post_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_posts tp
      JOIN team_members tm ON tm.team_id = tp.team_id
      WHERE tp.id = post_comments.post_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can share posts" ON post_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_posts tp
      JOIN team_members tm ON tm.team_id = tp.team_id
      WHERE tp.id = post_shares.post_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );
