create table if not exists cms_press_releases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text default '',
  excerpt text default '',
  company_name text default '',
  company_url text default '',
  contact_name text default '',
  contact_email text default '',
  featured_image_url text,
  author text default 'The NBT Team',
  status text default 'draft' check (status in ('draft','pending_review','published')),
  featured boolean default false,
  tags text[] default '{}',
  publish_date timestamptz,
  seo_title text default '',
  seo_description text default '',
  seo_index boolean default true,
  read_time text default '3 min',
  structured_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cms_press_releases enable row level security;
create policy "Service role full access" on cms_press_releases using (true) with check (true);
