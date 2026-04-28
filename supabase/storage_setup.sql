-- Complete storage setup for tool-logos bucket
-- Run in Supabase Dashboard > SQL Editor

-- 1. Create the bucket (or make it public if it already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tool-logos',
  'tool-logos',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tool-logos');

-- 3. Allow authenticated users to update/replace their own files
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tool-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Allow public read access (no auth required to view logos)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tool-logos');

-- Confirm
SELECT id, name, public FROM storage.buckets WHERE id = 'tool-logos';
