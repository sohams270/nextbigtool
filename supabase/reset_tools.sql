-- Reset all tool data — run in Supabase Dashboard > SQL Editor
-- Keeps: users, profiles, categories, tags (reference data)
-- Deletes: everything tool-related (cascade handles child tables)

-- Child tables first (some may not have cascade, be safe)
delete from public.tool_comments;
delete from public.hall_of_fame;
delete from public.upvotes;
delete from public.screenshots;
delete from public.tool_tags;

-- Parent
delete from public.tools;

-- Confirm
select
  (select count(*) from public.tools)         as tools,
  (select count(*) from public.hall_of_fame)  as hof_entries,
  (select count(*) from public.upvotes)        as upvotes,
  (select count(*) from public.screenshots)    as screenshots,
  (select count(*) from public.tool_tags)      as tool_tags,
  (select count(*) from public.tool_comments)  as comments;
-- All counts should be 0
