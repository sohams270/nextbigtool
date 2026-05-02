-- Run this in the Supabase SQL editor

-- 1. Make sure view_count column exists (no-op if already there)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- 2. Create the RPC function used by the view-tracking API route
CREATE OR REPLACE FUNCTION increment_view_count(tool_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE tools
  SET view_count = view_count + 1
  WHERE id = tool_id;
$$;
