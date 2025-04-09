ALTER TABLE history ADD COLUMN chapter_id BIGINT;
ALTER TABLE history ADD CONSTRAINT history_chapter_id_fkey
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE;
ALTER TABLE history ADD CONSTRAINT history_user_chapter_id_unique
    UNIQUE (user_id, chapter_id);