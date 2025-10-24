-- Create notifications table for in-app notifications
-- Supports mention notifications, comment replies, reactions, etc.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'comment_reply', 'reaction', 'announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  announcement_id UUID REFERENCES team_announcements(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE,
  triggered_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_announcement_id ON notifications(announcement_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_user ON notifications(user_id, read) WHERE read = FALSE;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications (handled by service)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_notifications_timestamp ON notifications;
CREATE TRIGGER update_notifications_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Comment
COMMENT ON TABLE notifications IS 'In-app notifications for users (mentions, replies, reactions, etc.)';
COMMENT ON COLUMN notifications.type IS 'Type of notification: mention, comment_reply, reaction, announcement';
COMMENT ON COLUMN notifications.data IS 'Additional metadata as JSON (e.g., mentioned_in_text, hashtags, etc.)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
