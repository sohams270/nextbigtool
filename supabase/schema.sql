-- NextBigTool: Schema only (tables, policies, triggers)
-- Run FIRST in Supabase Dashboard > SQL Editor

-- profiles
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  full_name  text,
  avatar_url text,
  bio        text,
  website    text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- categories
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  icon       text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "categories_select" on public.categories for select using (true);

-- tools
create table public.tools (
  id           uuid primary key default gen_random_uuid(),
  submitter_id uuid references public.profiles(id) on delete set null,
  category_id  uuid references public.categories(id) on delete set null,
  slug         text unique not null,
  name         text not null,
  tagline      text not null,
  description  text,
  logo_url     text,
  website_url  text,
  pricing      text check (pricing in ('free','freemium','paid','contact')) not null default 'free',
  upvote_count integer not null default 0,
  view_count   integer not null default 0,
  featured     boolean not null default false,
  status       text check (status in ('pending','approved','rejected')) not null default 'approved',
  launched_at  date not null default current_date,
  created_at   timestamptz not null default now()
);

alter table public.tools enable row level security;
create policy "tools_select"  on public.tools for select using (status = 'approved');
create policy "tools_insert"  on public.tools for insert with check (auth.uid() = submitter_id);
create policy "tools_update"  on public.tools for update using (auth.uid() = submitter_id);

-- tags
create table public.tags (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

alter table public.tags enable row level security;
create policy "tags_select" on public.tags for select using (true);

-- tool_tags
create table public.tool_tags (
  tool_id uuid references public.tools(id) on delete cascade,
  tag_id  uuid references public.tags(id) on delete cascade,
  primary key (tool_id, tag_id)
);

alter table public.tool_tags enable row level security;
create policy "tool_tags_select" on public.tool_tags for select using (true);

-- screenshots
create table public.screenshots (
  id         uuid primary key default gen_random_uuid(),
  tool_id    uuid not null references public.tools(id) on delete cascade,
  url        text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.screenshots enable row level security;
create policy "screenshots_select" on public.screenshots for select using (true);

-- upvotes
create table public.upvotes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tool_id    uuid not null references public.tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

alter table public.upvotes enable row level security;
create policy "upvotes_select" on public.upvotes for select using (true);
create policy "upvotes_insert" on public.upvotes for insert with check (auth.uid() = user_id);
create policy "upvotes_delete" on public.upvotes for delete using (auth.uid() = user_id);

create or replace function public.handle_upvote_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.tools set upvote_count = upvote_count + 1 where id = new.tool_id;
  return new;
end;
$$;

create or replace function public.handle_upvote_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.tools set upvote_count = greatest(0, upvote_count - 1) where id = old.tool_id;
  return old;
end;
$$;

create trigger on_upvote_added
  after insert on public.upvotes
  for each row execute function public.handle_upvote_insert();

create trigger on_upvote_removed
  after delete on public.upvotes
  for each row execute function public.handle_upvote_delete();
