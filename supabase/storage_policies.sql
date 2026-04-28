-- Make tool-logos bucket publicly readable
-- Run in Supabase Dashboard > SQL Editor

-- Option 1: Make the bucket itself public (simplest — no policy needed)
UPDATE storage.buckets
SET public = true
WHERE id = 'tool-logos';

-- Option 2: If you prefer RLS policies instead of a public bucket,
-- comment out the UPDATE above and uncomment this:
-- CREATE POLICY "Public read tool logos"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'tool-logos');

-- Confirm
SELECT id, name, public FROM storage.buckets WHERE id = 'tool-logos';
