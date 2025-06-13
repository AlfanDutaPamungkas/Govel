CREATE TABLE novel_genres (
    novel_id BIGINT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (novel_id, genre_id),
    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);
