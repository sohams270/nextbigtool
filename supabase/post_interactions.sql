-- NextBigTool: post_likes and post_comments
-- Run in Supabase Dashboard > SQL Editor after posts.sql

alter table public.posts add column if not exists comments_count integer not null default 0;

-- post_likes
create table public.post_likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.post_likes enable row level security;
create policy "post_likes_select" on public.post_likes for select using (true);
create policy "post_likes_insert" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete" on public.post_likes for delete using (auth.uid() = user_id);

create or replace function public.handle_post_like_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_post_like_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  return old;
end;
$$;

create trigger on_post_like_added
  after insert on public.post_likes
  for each row execute function public.handle_post_like_insert();

create trigger on_post_like_removed
  after delete on public.post_likes
  for each row execute function public.handle_post_like_delete();

-- post_comments
create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;
create policy "post_comments_select" on public.post_comments for select using (true);
create policy "post_comments_insert" on public.post_comments for insert with check (auth.uid() = author_id);
create policy "post_comments_delete" on public.post_comments for delete using (auth.uid() = author_id);

create or replace function public.handle_comment_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_comment_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  return old;
end;
$$;

create trigger on_comment_added
  after insert on public.post_comments
  for each row execute function public.handle_comment_insert();

create trigger on_comment_removed
  after delete on public.post_comments
  for each row execute function public.handle_comment_delete();
