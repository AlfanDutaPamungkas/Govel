package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
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
	IsRead        bool      `json:"is_read"`
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

func (c *ChaptersStore) GetBySlug(ctx context.Context, slug string) (*Chapter, error) {
	query := `
		SELECT id, novel_id, slug, title, content, chapter_number, is_locked, price, created_at, updated_at
		FROM chapters
		WHERE slug = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var chapter Chapter

	err := c.db.QueryRow(
		ctx,
		query,
		slug,
	).Scan(
		&chapter.ID,
		&chapter.NovelID,
		&chapter.Slug,
		&chapter.Title,
		&chapter.Content,
		&chapter.ChapterNumber,
		&chapter.IsLocked,
		&chapter.Price,
		&chapter.CreatedAt,
		&chapter.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &chapter, nil
}

func (c *ChaptersStore) Update(ctx context.Context, chapter *Chapter) error {
	query := `
		update chapters
		SET title = $1, content = $2, chapter_number = $3, is_locked = $4, price = $5, updated_at = $6
		WHERE slug = $7
		RETURNING id, slug, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := c.db.QueryRow(
		ctx,
		query,
		chapter.Title,
		chapter.Content,
		chapter.ChapterNumber,
		chapter.IsLocked,
		chapter.Price,
		chapter.UpdatedAt,
		chapter.Slug,
	).Scan(
		&chapter.ID,
		&chapter.Slug,
		&chapter.CreatedAt,
		&chapter.UpdatedAt,
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

func (c *ChaptersStore) Delete(ctx context.Context, slug string) error {
	query := `DELETE FROM chapters WHERE slug = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	cmdTag, err := c.db.Exec(ctx, query, slug)
	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (c *ChaptersStore) GetChaptersFromNovelID(ctx context.Context, novelID int64, userID int64) ([]*Chapter, error) {
	query := `
		SELECT 
			c.id, c.novel_id, c.slug, c.title, c.chapter_number,
			c.is_locked, c.price, c.created_at, c.updated_at,
			COALESCE(h.is_read, false) AS is_read
		FROM chapters c
		LEFT JOIN history h ON h.chapter_slug = c.slug AND h.user_id = $2
		WHERE c.novel_id = $1
		ORDER BY c.chapter_number ASC;
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()
	
	rows, err := c.db.Query(
		ctx,
		query,
		novelID,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var chapters []*Chapter
	for rows.Next(){
		var chapter Chapter
		err := rows.Scan(
			&chapter.ID,
			&chapter.NovelID,
			&chapter.Slug,
			&chapter.Title,
			&chapter.ChapterNumber,
			&chapter.IsLocked,
			&chapter.Price,
			&chapter.CreatedAt,
			&chapter.UpdatedAt,
			&chapter.IsRead,
		)

		if err != nil {
			return nil, err
		}

		chapters = append(chapters, &chapter)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return chapters, nil
}
