package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserUnlock struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	ChapterSlug string    `json:"chapter_slug"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserUnlockStore struct {
	db *pgxpool.Pool
}

func (un *UserUnlockStore) CheckkUser(ctx context.Context, userID int64, slug string) error {
	query := `
		SELECT id FROM user_unlocks
		WHERE user_id = $1 AND chapter_slug = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var userUnlock UserUnlock
	err := un.db.QueryRow(
		ctx,
		query,
		userID,
		slug,
	).Scan(&userUnlock.ID)

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
