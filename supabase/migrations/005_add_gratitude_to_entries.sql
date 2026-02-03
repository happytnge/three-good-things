-- Add gratitude field to entries table
ALTER TABLE entries
ADD COLUMN gratitude TEXT;

-- Add comment to describe the new field
COMMENT ON COLUMN entries.gratitude IS 'Today''s gratitude - the +1 in Three Good Things +1';
