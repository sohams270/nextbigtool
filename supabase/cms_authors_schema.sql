create table if not exists cms_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text default '',
  linkedin_url text default '',
  avatar_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cms_authors enable row level security;
create policy "Service role full access on authors" on cms_authors using (true) with check (true);

-- Add author_id FK to blog posts
alter table cms_blog_posts
  add column if not exists author_id uuid references cms_authors(id) on delete set null;
