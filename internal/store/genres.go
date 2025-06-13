package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Genre struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

type GenresStore struct {
	db *pgxpool.Pool
}

func (g *GenresStore) Create(ctx context.Context, genre *Genre) error {
	query := `
		INSERT INTO genres (name)
		VALUES ($1) RETURNING id
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := g.db.QueryRow(
		ctx,
		query,
		genre.Name,
	).Scan(&genre.ID)

	if err != nil {
		return err
	}

	return nil
}

func (g *GenresStore) GetAllGenre(ctx context.Context) ([]*Genre, error) {
	query := `
		SELECT id, name FROM genres
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := g.db.Query(
		ctx,
		query,
	)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*Genre
	for rows.Next() {
		var genre Genre
		err := rows.Scan(
			&genre.ID,
			&genre.Name,
		)

		if err != nil {
			return nil, err
		}
		genres = append(genres, &genre)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return genres, nil
}

func (g *GenresStore) GetByID(ctx context.Context, genreID int32) (*Genre, error) {
	query := `
		SELECT id, name FROM genres
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var genre Genre

	err := g.db.QueryRow(
		ctx,
		query,
		genreID,
	).Scan(
		&genre.ID,
		&genre.Name,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &genre, err
}

func (g *GenresStore) Update(ctx context.Context, genre *Genre) error {
	query := `
		update genres
		SET name = $1
		WHERE id = $2
		RETURNING id, name
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := g.db.QueryRow(
		ctx,
		query,
		genre.Name,
		genre.ID,
	).Scan(
		&genre.ID,
		&genre.Name,
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

func (g *GenresStore) Delete(ctx context.Context, genreID int32) error {
	query := `DELETE FROM genres WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	cmdTag, err := g.db.Exec(ctx, query, genreID)
	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (g *GenresStore) GetGenresFromNovelID(ctx context.Context, novelID int64) ([]*Genre, error) {
	query := `
		SELECT g.id, g.name
		FROM novel_genres ng
		LEFT JOIN genres g ON ng.genre_id = g.id
		WHERE ng.novel_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := g.db.Query(
		ctx,
		query,
		novelID,
	)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*Genre
	for rows.Next() {
		var genre Genre
		err := rows.Scan(
			&genre.ID,
			&genre.Name,
		)

		if err != nil {
			return nil, err
		}
		genres = append(genres, &genre)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return genres, nil
}
