alter table cms_blog_posts
  add column if not exists author_bio text default '',
  add column if not exists author_avatar_url text default '',
  add column if not exists author_linkedin_url text default '';
