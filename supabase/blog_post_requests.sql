-- NextBigTool: blog_post_requests table
-- Run in Supabase Dashboard > SQL Editor

create table if not exists public.blog_post_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  tool_id      uuid references public.tools(id) on delete set null,
  company_name text not null check (char_length(company_name) <= 100),
  headline     text not null check (char_length(headline) <= 120),
  story        text not null check (char_length(story) <= 600),
  link         text,
  status       text check (status in ('pending','approved','rejected','published')) not null default 'pending',
  blog_url     text,
  created_at   timestamptz not null default now()
);

alter table public.blog_post_requests enable row level security;

create policy "blog_requests_select_own"   on public.blog_post_requests for select using (auth.uid() = user_id);
create policy "blog_requests_insert"       on public.blog_post_requests for insert with check (auth.uid() = user_id);
create policy "blog_requests_select_admin" on public.blog_post_requests for select using (public.is_admin());
create policy "blog_requests_update_admin" on public.blog_post_requests for update using (public.is_admin());
