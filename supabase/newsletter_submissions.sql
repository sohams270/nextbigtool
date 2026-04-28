-- NextBigTool: newsletter_submissions table
-- Run in Supabase Dashboard > SQL Editor

create table if not exists public.newsletter_submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  tool_id     uuid references public.tools(id) on delete set null,
  issue_id    uuid references public.newsletter_issues(id) on delete set null,
  headline    text not null check (char_length(headline) <= 80),
  story       text not null check (char_length(story) <= 280),
  link        text,
  status      text check (status in ('pending','approved','rejected')) not null default 'pending',
  created_at  timestamptz not null default now()
);

alter table public.newsletter_submissions enable row level security;

create policy "submissions_select_own"   on public.newsletter_submissions for select using (auth.uid() = user_id);
create policy "submissions_insert"       on public.newsletter_submissions for insert with check (auth.uid() = user_id);
create policy "submissions_select_admin" on public.newsletter_submissions for select using (public.is_admin());
create policy "submissions_update_admin" on public.newsletter_submissions for update using (public.is_admin());
