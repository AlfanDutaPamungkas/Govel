package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrBookmarkExists = errors.New("you already bookmark this novel")

type Bookmark struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	NovelID   int64     `json:"novel_id"`
	CreatedAt time.Time `json:"created_at"`
}

type BookmarkStore struct {
	db *pgxpool.Pool
}

func (b *BookmarkStore) Create(ctx context.Context, bookmark *Bookmark) error {
	query := `
		INSERT INTO bookmarks (user_id, novel_id)
		VALUES ($1, $2) RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := b.db.QueryRow(
		ctx,
		query,
		bookmark.UserID,
		bookmark.NovelID,
	).Scan(&bookmark.ID, &bookmark.CreatedAt)

	if err != nil {
		switch {
			case err.Error() == `ERROR: duplicate key value violates unique constraint "bookmarks_user_id_novel_id_key" (SQLSTATE 23505)`:
				return ErrBookmarkExists
			default:
				return err
		}
	}

	return nil
}

func (b *BookmarkStore) GetByUserID(ctx context.Context, userID int64) ([]*Bookmark, error) {
	query := `
		SELECT id, user_id, novel_id, created_at
		FROM bookmarks
		WHERE user_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := b.db.Query(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var bookmarks []*Bookmark
	for rows.Next() {
		var bookmark Bookmark
		err := rows.Scan(
			&bookmark.ID,
			&bookmark.UserID,
			&bookmark.NovelID,
			&bookmark.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		bookmarks = append(bookmarks, &bookmark)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return bookmarks, nil
}

func (b *BookmarkStore) GetByID(ctx context.Context, bookmarkID int64) (*Bookmark, error) {
	query := `
		SELECT id, user_id, novel_id, created_at
		FROM bookmarks
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var bookmark Bookmark

	err := b.db.QueryRow(
		ctx,
		query,
		bookmarkID,
	).Scan(
		&bookmark.ID,
		&bookmark.UserID,
		&bookmark.NovelID,
		&bookmark.CreatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &bookmark, err
}

func (b *BookmarkStore) Delete(ctx context.Context, bookmarkID int64) error {
	query := `DELETE FROM bookmarks WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := b.db.Exec(ctx, query, bookmarkID)
	if err != nil {
		return err
	}

	return nil
}
