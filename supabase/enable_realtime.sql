-- Run this in the Supabase SQL editor to enable realtime on activity tables

ALTER PUBLICATION supabase_realtime ADD TABLE tools;
ALTER PUBLICATION supabase_realtime ADD TABLE hall_of_fame;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
