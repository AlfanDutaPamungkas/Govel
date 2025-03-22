package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrDuplicateSlug = errors.New("a chapter with this slug already exists")
)

type Chapter struct {
	ID            int64     `json:"id"`
	NovelID       int64     `json:"novel_id"`
	Slug          string    `json:"slug"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	ChapterNumber float64   `json:"chapter_number"`
	IsLocked      bool      `json:"is_locked"`
	Price         int       `json:"price"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ChaptersStore struct {
	db *pgxpool.Pool
}

func (c *ChaptersStore) Create(ctx context.Context, chapter *Chapter) error {
	query := `
		INSERT INTO chapters (novel_id, slug, title, content, chapter_number, is_locked, price)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := c.db.QueryRow(
		ctx,
		query,
		chapter.NovelID,
		chapter.Slug,
		chapter.Title,
		chapter.Content,
		chapter.ChapterNumber,
		chapter.IsLocked,
		chapter.Price,
	).Scan(&chapter.ID, &chapter.CreatedAt)

	if err != nil {
		switch {
		case err.Error() == `ERROR: duplicate key value violates unique constraint "chapters_slug_key" (SQLSTATE 23505)`:
			return ErrDuplicateSlug
		default:
			return err
		}
	}

	return nil
}
