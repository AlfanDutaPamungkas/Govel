CREATE TABLE IF NOT EXISTS chapters(
    id bigserial PRIMARY KEY,
    novel_id bigint NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    chapter_number int NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    FOREIGN KEY (novel_id) REFERENCES novels(id)
);