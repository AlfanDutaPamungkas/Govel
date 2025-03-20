package store

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Novel struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	Synopsis  string    `json:"synopsis"`
	Genre     []string  `json:"genre"`
	ImageURL  string    `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type NovelsStore struct {
	db *pgxpool.Pool
}

func (n *NovelsStore) Create(ctx context.Context, novel *Novel) error {
	query := `
		INSERT INTO novels (title, author, synopsis, genre, image_url)
		VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at
	`
	
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := n.db.QueryRow(
		ctx,
		query,
		novel.Title,
		novel.Author,
		novel.Synopsis,
		novel.Genre,
		novel.ImageURL,
	).Scan(&novel.ID, &novel.CreatedAt)

	if err != nil {
		return err
	}

	return nil
}
