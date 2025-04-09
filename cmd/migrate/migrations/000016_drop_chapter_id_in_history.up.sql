ALTER TABLE history DROP CONSTRAINT IF EXISTS history_chapter_id_fkey;
ALTER TABLE history DROP COLUMN IF EXISTS chapter_id;
ALTER TABLE history DROP CONSTRAINT IF EXISTS history_user_chapter_id_unique;