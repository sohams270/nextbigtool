-- NextBigTool: profiles table patch (v2)
-- Run in Supabase Dashboard > SQL Editor
-- Adds company, role, and plan columns that the dashboard and BIP wall use

alter table public.profiles
  add column if not exists company  text,
  add column if not exists role     text,
  add column if not exists plan     text check (plan in ('free', 'basic', 'core')) not null default 'free';
