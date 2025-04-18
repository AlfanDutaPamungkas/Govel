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
		Update(context.Context, *User) error
		CreateForgotPassReq(context.Context, string, int64, time.Duration) error
		DeleteForgotPassReq(context.Context, string) error
		ResetPassword(context.Context, string, string) error
		Webhook(context.Context, *User, *Invoice) error
		PurchaseChapter(context.Context, int64, int64, *UserUnlock) error
	}

	Novels interface {
		Create(context.Context, *Novel) error
		GetByID(context.Context, int64) (*Novel, error)
		Update(context.Context, *Novel) error
		Delete(context.Context, int64) error
	}

	Chapters interface {
		Create(context.Context, *Chapter) error
		GetBySlug(context.Context, string) (*Chapter, error)
		GetChaptersFromNovelID(context.Context, int64, int64) ([]*Chapter, error)
		Update(context.Context, *Chapter) error
		Delete(context.Context, string) error
	}

	Histories interface {
		Create(context.Context, *History) error
	}

	Invoices interface {
		Create(context.Context, *Invoice) error
		GetByInvoiceID(context.Context, string) (*Invoice, error)
		GetByUserID(context.Context, int64) (*Invoice, error)
		GetAll(context.Context) ([]*Invoice, error)
	}

	UserUnlocks interface {
		CheckkUser(context.Context, int64, string) error
	}
}

func NewStorage(db *pgxpool.Pool) Storage {
	invStore := &InvoicesStore{db}
	unStore := &UserUnlockStore{db}

	return Storage{
		Users:     &UsersStore{db, invStore, unStore},
		Novels:    &NovelsStore{db},
		Chapters:  &ChaptersStore{db},
		Histories: &HistoriesStore{db},
		Invoices:  invStore,
		UserUnlocks: unStore,
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
