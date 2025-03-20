package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
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

func (n *NovelsStore) GetByID(ctx context.Context, novelID int64) (*Novel, error) {
	query := `
		SELECT id, title, author, synopsis, genre, image_url, created_at, updated_at
		FROM novels
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var novel Novel

	err := n.db.QueryRow(
		ctx,
		query,
		novelID,
	).Scan(
		&novel.ID,
		&novel.Title,
		&novel.Author,
		&novel.Synopsis,
		&novel.Genre,
		&novel.ImageURL,
		&novel.CreatedAt,
		&novel.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &novel, err
}

func (n *NovelsStore) Update(ctx context.Context, novel *Novel) (error) {
	query := `
		update novels
		SET title = $1, author = $2, synopsis = $3, genre = $4, updated_at = $5
		WHERE id = $6
		RETURNING id, title, author, synopsis, genre, created_at, updated_at
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
		novel.UpdatedAt,
		novel.ID,
	).Scan(
		&novel.ID,
		&novel.Title,
		&novel.Author,
		&novel.Synopsis,
		&novel.Genre,
		&novel.CreatedAt,
		&novel.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return ErrNotFound
		default:
			return err
		}
	}

	return nil
}
