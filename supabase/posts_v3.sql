-- NextBigTool: posts table patch (v3)
-- Run in Supabase Dashboard > SQL Editor
-- Ensures the posts SELECT policy exists (public read access)
-- Safe to run even if it already exists

drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select using (true);
