CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users(
    id bigserial PRIMARY KEY,
    email citext UNIQUE NOT NULL,
    username varchar(255) UNIQUE NOT NULL,
    password bytea NOT NULL,
    is_active boolean NOT NULL DEFAULT FALSE,
    role varchar(20) NOT NULL DEFAULT 'user',
    created_at timestamp(9) with time zone NOT NULL DEFAULT NOW()
);