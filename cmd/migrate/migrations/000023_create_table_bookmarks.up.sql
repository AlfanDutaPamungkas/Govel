CREATE TABLE IF NOT EXISTS bookmarks (
    id bigserial PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    novel_id BIGINT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, novel_id)
);