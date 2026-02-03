-- Drop existing table if it exists (安全のため)
DROP TABLE IF EXISTS likes CASCADE;

-- Create likes table for entry likes
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_entry_id ON likes(entry_id);

-- Enable Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT TO authenticated
  USING (true);

-- Users can like entries
CREATE POLICY "Users can like entries"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike entries
CREATE POLICY "Users can unlike entries"
  ON likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add comment to describe the table
COMMENT ON TABLE likes IS 'Entry likes for social features';
