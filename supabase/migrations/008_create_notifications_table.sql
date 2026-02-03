-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('like', 'follow');

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id, actor_id, type, entry_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(recipient_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id);

-- System can create notifications (via triggers)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add comment to describe the table
COMMENT ON TABLE notifications IS 'User notifications for likes and follows';
