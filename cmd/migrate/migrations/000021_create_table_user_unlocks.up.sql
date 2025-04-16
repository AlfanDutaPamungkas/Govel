CREATE TABLE IF NOT EXISTS user_unlocks (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_slug VARCHAR(100) NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, chapter_slug)
);
