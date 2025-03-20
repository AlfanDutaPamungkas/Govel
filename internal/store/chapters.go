package store

import "github.com/jackc/pgx/v5/pgxpool"

type ChaptersStore struct {
	db *pgxpool.Pool
}