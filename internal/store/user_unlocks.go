package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrAlreadyUnlocked = errors.New("you already unlock this chapter")

type UserUnlock struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	ChapterSlug string    `json:"chapter_slug"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserUnlockStore struct {
	db *pgxpool.Pool
}

func (un *UserUnlockStore) CheckUser(ctx context.Context, userID int64, slug string) error {
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

func (un *UserUnlockStore) unlockChapter(ctx context.Context, tx pgx.Tx, userUnlock *UserUnlock) error {
	query := `
		INSERT INTO user_unlocks (user_id, chapter_slug)
		VALUES ($1, $2)
		RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := tx.QueryRow(
		ctx,
		query,
		userUnlock.UserID,
		userUnlock.ChapterSlug,
	).Scan(&userUnlock.ID, &userUnlock.CreatedAt)

	if err != nil {
		switch {
			case err.Error() == `ERROR: duplicate key value violates unique constraint "user_unlocks_user_id_chapter_slug_key" (SQLSTATE 23505)`:
				return ErrAlreadyUnlocked
			default:
				return err
		}
	}

	return nil
}
