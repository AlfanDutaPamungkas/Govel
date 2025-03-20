CREATE TABLE IF NOT EXISTS novels(
    id bigserial PRIMARY KEY,
    title text NOT NULL,
    author varchar(255) NOT NULL,
    synopsis text NOT NULL,
    genre text [] NOT NULL,
    image_url text NOT NULL DEFAULT 'https://res.cloudinary.com/dmxnd3pn7/image/upload/v1742304305/novel/novel-template_iweyqs.jpg',
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);