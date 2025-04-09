package store

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type History struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	ChapterSlug string    `json:"chapter_slug"`
	IsRead      bool      `json:"is_read"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type HistoriesStore struct {
	db *pgxpool.Pool
}

func (h *HistoriesStore) Create(ctx context.Context, history *History) error {
	query := `
		INSERT INTO history (user_id, chapter_slug, is_read)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, chapter_slug)
		DO UPDATE SET is_read = EXCLUDED.is_read, updated_at = NOW()
		RETURNING id, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := h.db.QueryRow(
		ctx,
		query,
		history.UserID,
		history.ChapterSlug,
		history.IsRead,
	).Scan(&history.ID, &history.CreatedAt, &history.UpdatedAt)

	if err != nil {
		return err
	}

	return nil
}
