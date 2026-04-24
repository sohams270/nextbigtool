-- NextBigTool: posts table migration
-- Run in Supabase Dashboard > SQL Editor after schema.sql

create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  tool_id      uuid references public.tools(id) on delete set null,
  type         text check (type in ('milestone','update','funding','launch')) not null default 'update',
  content      text not null,
  metric_label text,
  metric_value text,
  likes_count  integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select" on public.posts for select using (true);

-- Only users who have at least one approved tool can post
create policy "posts_insert" on public.posts for insert with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.tools
    where submitter_id = auth.uid() and status = 'approved'
  )
);

create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);
