-- Categories
create table if not exists cms_blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Insert default categories
insert into cms_blog_categories (name, slug) values
  ('AI', 'ai'),
  ('Founders Guide', 'founders-guide'),
  ('Funding', 'funding'),
  ('Insights', 'insights'),
  ('Product Update', 'product-update'),
  ('Tools', 'tools'),
  ('What''s New', 'whats-new'),
  ('Growth', 'growth'),
  ('Strategy', 'strategy')
on conflict (slug) do nothing;

-- Blog posts
create table if not exists cms_blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null default '',
  slug text unique,
  content text default '',
  excerpt text default '',
  featured_image_url text,
  author text default 'The NBT Team',
  category_id uuid references cms_blog_categories(id) on delete set null,
  tags text[] default '{}',
  status text default 'draft',
  featured boolean default false,
  allow_comments boolean default true,
  publish_date timestamptz,
  seo_title text default '',
  seo_description text default '',
  seo_index boolean default true,
  structured_data jsonb,
  read_time text default '5 min',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table cms_blog_posts enable row level security;
alter table cms_blog_categories enable row level security;

create policy "Public read published" on cms_blog_posts for select using (status = 'published');
create policy "Public read categories" on cms_blog_categories for select using (true);
