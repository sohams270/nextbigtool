-- NextBigTool: hall_of_fame table
-- Run in Supabase Dashboard > SQL Editor

create table if not exists public.hall_of_fame (
  id          uuid primary key default gen_random_uuid(),
  tool_id     uuid not null references public.tools(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  pitch       text check (char_length(pitch) <= 280),
  status      text check (status in ('pending','approved','rejected')) not null default 'pending',
  inducted_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (tool_id)
);

alter table public.hall_of_fame enable row level security;

create policy "hof_select_all"    on public.hall_of_fame for select using (true);
create policy "hof_insert"        on public.hall_of_fame for insert with check (auth.uid() = user_id);
create policy "hof_select_admin"  on public.hall_of_fame for select using (public.is_admin());
create policy "hof_update_admin"  on public.hall_of_fame for update using (public.is_admin());
