-- =============================================================================
-- NextBigTool: Migration v2
-- Run in Supabase Dashboard > SQL Editor AFTER schema.sql, posts.sql,
-- and post_interactions.sql have already been applied.
-- =============================================================================

-- ─── 1. PROFILES: capture richer user data ───────────────────────────────────

-- signup_source: 'email' | 'google' | 'github' etc.
alter table public.profiles
  add column if not exists signup_source  text,
  add column if not exists headline       text,          -- "Founder @ Acme"
  add column if not exists twitter_url    text,
  add column if not exists linkedin_url   text,
  add column if not exists location       text,
  add column if not exists is_admin       boolean not null default false,
  add column if not exists email          text,          -- copy of auth email for easy admin queries
  add column if not exists tools_count    integer not null default 0,
  add column if not exists upvotes_given  integer not null default 0;

-- Updated trigger: captures provider, auto-generates username, copies email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix        integer := 0;
begin
  -- derive username from full_name or email prefix
  base_username := coalesce(
    lower(regexp_replace(new.raw_user_meta_data->>'full_name', '[^a-zA-Z0-9]', '_', 'g')),
    split_part(new.email, '@', 1)
  );
  base_username := regexp_replace(base_username, '_+', '_', 'g');
  base_username := regexp_replace(base_username, '^_|_$', '', 'g');
  base_username := left(base_username, 20);

  -- ensure uniqueness
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    username,
    email,
    signup_source
  ) values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    final_username,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- re-create trigger (drop + recreate in case it already exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep tools_count in sync
create or replace function public.handle_tool_insert_profile()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set tools_count = tools_count + 1
  where id = new.submitter_id;
  return new;
end;
$$;

drop trigger if exists on_tool_submitted on public.tools;
create trigger on_tool_submitted
  after insert on public.tools
  for each row execute function public.handle_tool_insert_profile();

-- keep upvotes_given in sync
create or replace function public.handle_upvote_given()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set upvotes_given = upvotes_given + 1
  where id = new.user_id;
  return new;
end;
$$;

create or replace function public.handle_upvote_taken_back()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
  set upvotes_given = greatest(0, upvotes_given - 1)
  where id = old.user_id;
  return old;
end;
$$;

drop trigger if exists on_upvote_given on public.upvotes;
create trigger on_upvote_given
  after insert on public.upvotes
  for each row execute function public.handle_upvote_given();

drop trigger if exists on_upvote_taken_back on public.upvotes;
create trigger on_upvote_taken_back
  after delete on public.upvotes
  for each row execute function public.handle_upvote_taken_back();


-- ─── 2. TOOLS: capture every submission field ─────────────────────────────────

alter table public.tools
  add column if not exists contact_email     text,       -- founder's email for follow-ups
  add column if not exists maker_comment     text,       -- founder's own pitch/intro shown on detail page
  add column if not exists demo_url          text,       -- YouTube / Loom demo video
  add column if not exists twitter_url       text,       -- product Twitter/X handle
  add column if not exists github_url        text,       -- open-source repo (optional)
  add column if not exists linkedin_url      text,
  add column if not exists plan              text check (plan in ('free','featured','hall_of_fame'))
                                               not null default 'free',
  add column if not exists submitted_at      timestamptz not null default now(),
  add column if not exists approved_at       timestamptz,
  add column if not exists rejection_reason  text,
  add column if not exists comments_count    integer not null default 0;

-- keep comments_count on tools in sync via post_comments table
create or replace function public.handle_tool_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if new.tool_id is not null then
    update public.tools
    set comments_count = (
      select count(*) from public.post_comments pc
      join public.posts p on p.id = pc.post_id
      where p.tool_id = new.tool_id
    )
    where id = new.tool_id;
  end if;
  return new;
end;
$$;


-- ─── 3. ADMIN HELPERS ─────────────────────────────────────────────────────────

-- Helper: check if the calling user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Admins can see ALL tools (including pending/rejected)
drop policy if exists "tools_select_admin" on public.tools;
create policy "tools_select_admin" on public.tools
  for select using (public.is_admin());

-- Admins can approve / reject / edit any tool
drop policy if exists "tools_update_admin" on public.tools;
create policy "tools_update_admin" on public.tools
  for update using (public.is_admin());

-- Submitters can see their own pending tools in dashboard
drop policy if exists "tools_select_own" on public.tools;
create policy "tools_select_own" on public.tools
  for select using (auth.uid() = submitter_id);

-- Admins can see ALL profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- Admins can update any profile
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());


-- ─── 4. TOOL SUBMISSION AUDIT LOG ────────────────────────────────────────────
-- Every status change (pending → approved / rejected) is recorded here.

create table if not exists public.tool_status_log (
  id          uuid primary key default gen_random_uuid(),
  tool_id     uuid not null references public.tools(id) on delete cascade,
  changed_by  uuid references public.profiles(id) on delete set null,
  old_status  text,
  new_status  text,
  note        text,
  changed_at  timestamptz not null default now()
);

alter table public.tool_status_log enable row level security;
create policy "tool_status_log_select_admin" on public.tool_status_log
  for select using (public.is_admin());
create policy "tool_status_log_select_own" on public.tool_status_log
  for select using (
    exists (
      select 1 from public.tools
      where id = tool_id and submitter_id = auth.uid()
    )
  );

create or replace function public.log_tool_status_change()
returns trigger language plpgsql security definer as $$
begin
  if old.status is distinct from new.status then
    insert into public.tool_status_log (tool_id, changed_by, old_status, new_status)
    values (new.id, auth.uid(), old.status, new.status);

    -- stamp approved_at when going live
    if new.status = 'approved' and old.status != 'approved' then
      new.approved_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_tool_status_change on public.tools;
create trigger on_tool_status_change
  before update on public.tools
  for each row execute function public.log_tool_status_change();


-- ─── 5. NEWSLETTER SUBSCRIBERS ───────────────────────────────────────────────
-- Capture emails from the homepage newsletter widget

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  user_id      uuid references public.profiles(id) on delete set null,
  source       text not null default 'homepage',   -- 'homepage' | 'sidebar' | 'footer'
  subscribed   boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;
create policy "newsletter_insert" on public.newsletter_subscribers
  for insert with check (true);   -- anyone can subscribe
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select using (public.is_admin());
create policy "newsletter_update_own" on public.newsletter_subscribers
  for update using (email = (select email from public.profiles where id = auth.uid()));
