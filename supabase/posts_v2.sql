-- NextBigTool: posts table patch (v2)
-- Run in Supabase Dashboard > SQL Editor
-- Fixes two bugs:
--   1. Adds missing `tags` column (text array)
--   2. Relaxes the insert RLS — any authenticated user can post
--      (the old policy blocked founders without an approved tool)

-- 1. Add tags column
alter table public.posts
  add column if not exists tags text[] not null default '{}';

-- 2. Fix insert policy — only require auth.uid() = author_id
drop policy if exists "posts_insert" on public.posts;

create policy "posts_insert" on public.posts
  for insert with check (auth.uid() = author_id);
