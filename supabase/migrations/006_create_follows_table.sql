-- Create follows table for user follow relationships
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT TO authenticated
  USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- Add comment to describe the table
COMMENT ON TABLE follows IS 'User follow relationships for social features';
