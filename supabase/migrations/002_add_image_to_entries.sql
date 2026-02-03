-- Add image columns to entries table
ALTER TABLE entries
ADD COLUMN image_url TEXT,
ADD COLUMN image_path TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN entries.image_url IS 'Public URL of the uploaded image';
COMMENT ON COLUMN entries.image_path IS 'Storage path for the image file';
