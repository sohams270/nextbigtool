-- Tool comments — run in Supabase Dashboard > SQL Editor
create table if not exists public.tool_comments (
  id         uuid primary key default gen_random_uuid(),
  tool_id    uuid not null references public.tools(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists tool_comments_tool_idx
  on public.tool_comments(tool_id, created_at desc);

alter table public.tool_comments enable row level security;

create policy "tc_select_all" on public.tool_comments
  for select using (true);

create policy "tc_insert_own" on public.tool_comments
  for insert with check (auth.uid() = user_id);

create policy "tc_delete_own" on public.tool_comments
  for delete using (auth.uid() = user_id);
