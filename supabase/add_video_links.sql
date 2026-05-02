-- Add video_links column to tools table for storing YouTube video URLs
ALTER TABLE tools ADD COLUMN IF NOT EXISTS video_links text[] DEFAULT NULL;
