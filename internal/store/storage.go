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
		Create(context.Context, pgx.Tx, *Novel) error
		CreateNovelAndInsertGenres(context.Context, *Novel, []int32) error
		GetByID(context.Context, int64) (*Novel, error)
		GetAllNovel(context.Context, string, string) ([]*Novel, error)
		Update(context.Context, *Novel) error
		UpdateNovelGenres(context.Context, int64, []int32) error
		Delete(context.Context, int64) error
	}

	Genres interface {
		Create(context.Context, *Genre) error
		GetAllGenre(context.Context) ([]*Genre, error)
		GetByID(context.Context, int32) (*Genre, error)
		GetGenresFromNovelID(context.Context, int64) ([]*Genre, error)
		Update(context.Context, *Genre) error
		Delete(context.Context, int32) error
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
		GetByUserID(context.Context, int64) ([]*Invoice, error)
		GetAll(context.Context) ([]*Invoice, error)
	}

	UserUnlocks interface {
		CheckUser(context.Context, int64, string) error
	}

	Bookmarks interface {
		Create(context.Context, *Bookmark) error
		GetByUserID(context.Context, int64) ([]*Bookmark, error)
		Delete(context.Context, int64) error
		GetByID(context.Context, int64) (*Bookmark, error)
	}
}

func NewStorage(db *pgxpool.Pool) Storage {
	invStore := &InvoicesStore{db}
	unStore := &UserUnlockStore{db}

	return Storage{
		Users:       &UsersStore{db, invStore, unStore},
		Novels:      &NovelsStore{db},
		Genres:      &GenresStore{db},
		Chapters:    &ChaptersStore{db},
		Histories:   &HistoriesStore{db},
		Invoices:    invStore,
		UserUnlocks: unStore,
		Bookmarks:   &BookmarkStore{db},
	}
}

func withTx(db *pgxpool.Pool, ctx context.Context, fn func(tx pgx.Tx) error) (err error) {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	err = fn(tx)
	if err != nil {
		return err
	}

	err = tx.Commit(ctx)
	return err
}
