package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound          = errors.New("record not found")
	ErrConflict          = errors.New("resource already exists")
	QueryTimeoutDuration = time.Second * 5
)

type Storage struct {
	Users interface {
		Create(context.Context, pgx.Tx, *User) error
		CreateAndInvite(context.Context, *User, string, time.Duration) error
		Activate(context.Context, string) error
		GetByEmail(context.Context, string) (*User, error)
		GetByID(context.Context, int64) (*User, error)
		Delete(context.Context, int64) error
		Update(context.Context, *User) (error)
		CreateForgotPassReq(context.Context, string, int64, time.Duration) error
		DeleteForgotPassReq(context.Context, string) error
		ResetPassword(context.Context, string, string) error
	}

	Novels interface {
		Create(context.Context, *Novel) error
		GetByID(context.Context, int64) (*Novel, error)
		Update(context.Context, *Novel) (error)
		Delete(context.Context, int64) error
	}

	Chapters interface {
		Create(context.Context, *Chapter) error
	}
}

func NewStorage(db *pgxpool.Pool) Storage {
	return Storage{
		Users: &UsersStore{db},
		Novels: &NovelsStore{db},
		Chapters: &ChaptersStore{db},
	}
}

func withTx(db *pgxpool.Pool, ctx context.Context, fn func(tx pgx.Tx) error) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}

	defer tx.Rollback(ctx)

	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
