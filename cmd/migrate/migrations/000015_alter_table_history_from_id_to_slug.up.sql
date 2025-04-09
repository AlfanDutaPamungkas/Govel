ALTER TABLE history ADD COLUMN chapter_slug VARCHAR(100) NOT NULL;
ALTER TABLE history ADD CONSTRAINT history_chapter_slug_fkey
    FOREIGN KEY (chapter_slug) REFERENCES chapters(slug) ON DELETE CASCADE;
ALTER TABLE history ADD CONSTRAINT history_user_chapter_slug_unique
    UNIQUE (user_id, chapter_slug);