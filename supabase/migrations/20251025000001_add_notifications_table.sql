-- Create notifications table
-- This table stores in-app notifications for users
-- Supports: mentions, comment replies, reactions, announcements

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User who receives this notification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification type
  type TEXT NOT NULL CHECK (type IN ('mention', 'comment_reply', 'reaction', 'announcement')),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- References to related entities
  announcement_id UUID REFERENCES team_announcements(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE,
  
  -- User who triggered this notification (e.g., who mentioned, reacted, or replied)
  triggered_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Additional data (flexible JSONB for type-specific metadata)
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Read status
  read BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_announcement_id ON notifications(announcement_id) WHERE announcement_id IS NOT NULL;
CREATE INDEX idx_notifications_comment_id ON notifications(comment_id) WHERE comment_id IS NOT NULL;

-- Add table comment
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users. Supports mentions, replies, reactions, and announcements.';

COMMENT ON COLUMN notifications.type IS 'Type of notification: mention, comment_reply, reaction, or announcement';

COMMENT ON COLUMN notifications.data IS 'Additional metadata specific to the notification type (e.g., {"mentioned_in": "comment", "reaction_type": "like"})';

-- Row Level Security (RLS) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can create notifications (no direct INSERT by users)
-- NOTE: Notifications are created by the backend services
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true); -- Will be validated by application logic

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = target_user_id AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = target_user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments on functions
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all unread notifications as read for the specified user. Returns the count of updated notifications.';

COMMENT ON FUNCTION get_unread_notification_count IS 'Returns the count of unread notifications for the specified user.';
