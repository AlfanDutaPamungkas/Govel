package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrInvalidOption = errors.New("invalid option")

type Novel struct {
	ID         int64      `json:"id"`
	Title      string     `json:"title"`
	Author     string     `json:"author"`
	Synopsis   string     `json:"synopsis"`
	Genre      []*Genre   `json:"genre"`
	ImageURL   string     `json:"image_url"`
	Chapters   []*Chapter `json:"chapters"`
	IsBookmark bool       `json:"is_bookmark"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

var ErrDuplicateNovelTitle = errors.New("a novel with that title already exist")

type NovelsStore struct {
	db *pgxpool.Pool
}

func (n *NovelsStore) Create(ctx context.Context, tx pgx.Tx, novel *Novel) error {
	query := `
		INSERT INTO novels (title, author, synopsis, image_url)
		VALUES ($1, $2, $3, $4) RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := tx.QueryRow(
		ctx,
		query,
		novel.Title,
		novel.Author,
		novel.Synopsis,
		novel.ImageURL,
	).Scan(&novel.ID, &novel.CreatedAt)

	if err != nil {
		switch {
		case err.Error() == `ERROR: duplicate key value violates unique constraint "unique_title" (SQLSTATE 23505)`:
			return ErrDuplicateNovelTitle
		default:
			return err
		}
	}

	return nil
}

func (n *NovelsStore) CreateNovelAndInsertGenres(ctx context.Context, novel *Novel, genres []int32) error {
	return withTx(n.db, ctx, func(tx pgx.Tx) error {
		if err := n.Create(ctx, tx, novel); err != nil {
			return err
		}

		if err := n.insertGenresToNovel(ctx, tx, novel.ID, genres); err != nil {
			return err
		}

		return nil
	})
}

func (n *NovelsStore) GetByID(ctx context.Context, novelID int64, userID int64) (*Novel, error) {
	query := `
		SELECT 
			n.id, 
			n.title, 
			n.author, 
			n.synopsis, 
			n.image_url, 
			n.created_at, 
			n.updated_at,
		EXISTS (
			SELECT 1 
			FROM bookmarks b 
			WHERE b.novel_id = n.id AND b.user_id = $2
		) AS is_bookmark
		FROM novels n
		WHERE n.id = $1;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var novel Novel

	err := n.db.QueryRow(
		ctx,
		query,
		novelID,
		userID,
	).Scan(
		&novel.ID,
		&novel.Title,
		&novel.Author,
		&novel.Synopsis,
		&novel.ImageURL,
		&novel.CreatedAt,
		&novel.UpdatedAt,
		&novel.IsBookmark,
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

func (n *NovelsStore) GetAllNovel(ctx context.Context, order string, search string) ([]*Novel, error) {
	var query string
	var args []interface{}

	query = `
		SELECT id, title, author, synopsis, image_url, created_at, updated_at
		FROM novels
	`

	if search != "" {
		query += ` WHERE title_fts @@ plainto_tsquery('english', $1)`
		args = append(args, search)
	}

	if order == "updated_at" {
		query += fmt.Sprintf(" ORDER BY %s DESC", order)
		query += " LIMIT 10"
	} else if order == "created_at" {
		query += fmt.Sprintf(" ORDER BY %s DESC", order)
		query += " LIMIT 4"
	} else if order != "" {
		return nil, ErrInvalidOption
	}

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := n.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var novels []*Novel
	for rows.Next() {
		var novel Novel
		err := rows.Scan(
			&novel.ID,
			&novel.Title,
			&novel.Author,
			&novel.Synopsis,
			&novel.ImageURL,
			&novel.CreatedAt,
			&novel.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		novels = append(novels, &novel)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return novels, nil
}

func (n *NovelsStore) GetNovelsFromGenreID(ctx context.Context, genreID int32) ([]*Novel, error) {
	query := `
		SELECT n.id, n.title, n.author, n.synopsis, n.image_url, n.created_at, n.updated_at
		FROM novel_genres ng
		LEFT JOIN novels n on n.id = ng.novel_id
		WHERE ng.genre_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := n.db.Query(ctx, query, genreID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var novels []*Novel
	for rows.Next() {
		var novel Novel
		err := rows.Scan(
			&novel.ID,
			&novel.Title,
			&novel.Author,
			&novel.Synopsis,
			&novel.ImageURL,
			&novel.CreatedAt,
			&novel.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		novels = append(novels, &novel)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return novels, nil
}

func (n *NovelsStore) Update(ctx context.Context, novel *Novel) error {
	query := `
		update novels
		SET title = $1, author = $2, synopsis = $3, image_url = $4, updated_at = $5
		WHERE id = $6
		RETURNING id, title, author, synopsis, image_url, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := n.db.QueryRow(
		ctx,
		query,
		novel.Title,
		novel.Author,
		novel.Synopsis,
		novel.ImageURL,
		novel.UpdatedAt,
		novel.ID,
	).Scan(
		&novel.ID,
		&novel.Title,
		&novel.Author,
		&novel.Synopsis,
		&novel.ImageURL,
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

func (n *NovelsStore) Delete(ctx context.Context, novelID int64) error {
	query := `DELETE FROM novels WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	cmdTag, err := n.db.Exec(ctx, query, novelID)
	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (n *NovelsStore) UpdateNovelGenres(ctx context.Context, novelID int64, genres []int32) error {
	return withTx(n.db, ctx, func(tx pgx.Tx) error {
		if err := n.deleteGenresToNovel(ctx, tx, novelID); err != nil {
			return err
		}

		if err := n.insertGenresToNovel(ctx, tx, novelID, genres); err != nil {
			return err
		}

		return nil
	})
}

func (n *NovelsStore) insertGenresToNovel(ctx context.Context, tx pgx.Tx, novelID int64, genres []int32) error {
	query := `
		INSERT INTO novel_genres (novel_id, genre_id)
		SELECT $1, UNNEST($2::int[])
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(ctx, query, novelID, genres)
	if err != nil {
		return err
	}

	return nil
}

func (n *NovelsStore) deleteGenresToNovel(ctx context.Context, tx pgx.Tx, novelID int64) error {
	query := `
		DELETE FROM novel_genres
		WHERE novel_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	cmdTag, err := tx.Exec(ctx, query, novelID)
	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}
