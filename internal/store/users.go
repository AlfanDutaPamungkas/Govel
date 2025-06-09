package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicateEmail    = errors.New("a user with that email already exist")
	ErrDuplicateUsername = errors.New("a user with that username already exist")
)

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	Password     password  `json:"-"`
	IsActive     bool      `json:"is_active"`
	Role         string    `json:"-"`
	TokenVersion int64     `json:"token_version"`
	Coin         int64     `json:"coin"`
	ImageURL     string    `json:"image_url"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type password struct {
	text *string
	hash []byte
}

func (p *password) Set(text string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(text), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	p.text = &text
	p.hash = hash

	return nil
}

func (p *password) Verify(pass string) bool {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(pass))
	return err == nil
}

type UsersStore struct {
	db          *pgxpool.Pool
	invoices    *InvoicesStore
	userUnlocks *UserUnlockStore
}

func (s *UsersStore) Create(ctx context.Context, tx pgx.Tx, user *User) error {
	query := `
		INSERT INTO users (username, password, email)
		VALUES ($1, $2, $3) RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := tx.QueryRow(
		ctx,
		query,
		user.Username,
		user.Password.hash,
		user.Email,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		switch {
		case err.Error() == `ERROR: duplicate key value violates unique constraint "users_email_key" (SQLSTATE 23505)`:
			return ErrDuplicateEmail
		case err.Error() == `ERROR: duplicate key value violates unique constraint "users_username_key" (SQLSTATE 23505)`:
			return ErrDuplicateUsername
		default:
			return err
		}
	}

	return nil
}

func (s *UsersStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, username, email, password, is_active, token_version, created_at, updated_at
		FROM users
		WHERE email = $1 AND is_active = true
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var user User
	err := s.db.QueryRow(
		ctx,
		query,
		email,
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&user.IsActive,
		&user.TokenVersion,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &user, err
}

func (s *UsersStore) GetByID(ctx context.Context, userID int64) (*User, error) {
	query := `
		SELECT id, username, email, password, is_active, role, token_version, coin, image_url, created_at, updated_at
		FROM users
		WHERE id = $1 AND is_active = true
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var user User
	err := s.db.QueryRow(
		ctx,
		query,
		userID,
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&user.IsActive,
		&user.Role,
		&user.TokenVersion,
		&user.Coin,
		&user.ImageURL,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &user, err
}

func (s *UsersStore) Update(ctx context.Context, user *User) error {
	query := `
		update users
		SET username = $1, email = $2, token_version = $3, password = $4, updated_at = $5
		WHERE id = $6
		RETURNING id , username, email, token_version
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRow(
		ctx,
		query,
		user.Username,
		user.Email,
		user.TokenVersion,
		user.Password.hash,
		user.UpdatedAt,
		user.ID,
	).Scan(&user.ID, &user.Username, &user.Email, &user.TokenVersion)

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

func (s *UsersStore) CreateAndInvite(ctx context.Context, user *User, token string, invitationExp time.Duration) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		if err := s.Create(ctx, tx, user); err != nil {
			return err
		}

		if err := s.createUserInvitation(ctx, tx, token, user.ID, invitationExp); err != nil {
			return err
		}

		return nil
	})
}

func (s *UsersStore) createUserInvitation(ctx context.Context, tx pgx.Tx, token string, userID int64, exp time.Duration) error {
	query := `
		INSERT INTO user_invitations (token, user_id, expiry)
		VALUES ($1, $2, $3)
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(ctx, query, token, userID, time.Now().Add(exp))
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) Delete(ctx context.Context, userID int64) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		if err := s.delete(ctx, tx, userID); err != nil {
			return err
		}

		if err := s.deleteUserInvitations(ctx, tx, userID); err != nil {
			return err
		}

		return nil
	})
}

func (s *UsersStore) delete(ctx context.Context, tx pgx.Tx, userID int64) error {
	query := `
		DELETE FROM users WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(ctx, query, userID)
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) Activate(ctx context.Context, token string) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		user, err := s.getUserFromInvitation(ctx, tx, token)
		if err != nil {
			return err
		}

		user.IsActive = true
		if err := s.changeIsActive(ctx, tx, user); err != nil {
			return err
		}

		if err := s.deleteUserInvitations(ctx, tx, user.ID); err != nil {
			return err
		}

		return nil
	})
}

func (s *UsersStore) getUserFromInvitation(ctx context.Context, tx pgx.Tx, token string) (*User, error) {
	query := `
		SELECT u.id, u.username, u.email, u.created_at, is_active
		FROM users u
		JOIN user_invitations ui ON u.id = ui.user_id
		WHERE ui.token = $1 AND ui.expiry > $2
	`

	hash := sha256.Sum256([]byte(token))
	hashToken := hex.EncodeToString(hash[:])

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	user := &User{}
	err := tx.QueryRow(ctx, query, hashToken, time.Now()).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.CreatedAt,
		&user.IsActive,
	)

	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return user, nil
}

func (s *UsersStore) changeIsActive(ctx context.Context, tx pgx.Tx, user *User) error {
	query := `
		UPDATE users 
		SET is_active = $1
		WHERE id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(ctx, query, user.IsActive, user.ID)
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) deleteUserInvitations(ctx context.Context, tx pgx.Tx, userID int64) error {
	query := `
		DELETE FROM user_invitations WHERE user_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(ctx, query, userID)
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) CreateForgotPassReq(ctx context.Context, token string, userID int64, expiry time.Duration) error {
	query := `
		INSERT INTO forgot_pass_requests (token, user_id, expiry)
		VALUES ($1, $2, $3)
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.Exec(ctx, query, token, userID, time.Now().Add(expiry))
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) DeleteForgotPassReq(ctx context.Context, token string) error {
	query := `
		DELETE FROM forgot_pass_requests WHERE token = $1
	`

	hash := sha256.Sum256([]byte(token))
	hashToken := hex.EncodeToString(hash[:])

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.Exec(ctx, query, hashToken)
	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) ResetPassword(ctx context.Context, token string, password string) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		user, err := s.getForgotPassReq(ctx, tx, token)
		if err != nil {
			return err
		}

		if err = user.Password.Set(password); err != nil {
			return err
		}

		user.TokenVersion++
		user.UpdatedAt = time.Now()

		if err = s.Update(ctx, user); err != nil {
			return err
		}

		if err = s.DeleteForgotPassReq(ctx, token); err != nil {
			return err
		}

		return nil
	})
}

func (s *UsersStore) getForgotPassReq(ctx context.Context, tx pgx.Tx, token string) (*User, error) {
	query := `
		SELECT u.id, u.username, u.email
		FROM users u
		JOIN forgot_pass_requests fp ON u.id = fp.user_id
		WHERE fp.token = $1 AND fp.expiry > $2
	`

	hash := sha256.Sum256([]byte(token))
	hashToken := hex.EncodeToString(hash[:])

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	user := &User{}
	err := tx.QueryRow(ctx, query, hashToken, time.Now()).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
	)

	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return user, nil
}

func (s *UsersStore) Webhook(ctx context.Context, user *User, invoice *Invoice) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		if err := s.invoices.update(ctx, tx, invoice); err != nil {
			return err
		}

		if invoice.Status == "PAID" {
			if err := s.addCoin(ctx, tx, user); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *UsersStore) addCoin(ctx context.Context, tx pgx.Tx, user *User) error {
	query := `
		update users
		SET coin = coin + $1
		WHERE id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(
		ctx,
		query,
		user.Coin,
		user.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *UsersStore) PurchaseChapter(ctx context.Context, userID int64, amount int64, userUnlock *UserUnlock) error {
	return withTx(s.db, ctx, func(tx pgx.Tx) error {
		if err := s.deductCoin(ctx, tx, userID, amount); err != nil {
			return err
		}

		if err := s.userUnlocks.unlockChapter(ctx, tx, userUnlock); err != nil {
			return err
		}

		return nil
	})
}

func (s *UsersStore) deductCoin(ctx context.Context, tx pgx.Tx, userID, amount int64) error {
	query := `
		update users
		SET coin = coin - $1
		WHERE id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(
		ctx,
		query,
		amount,
		userID,
	)

	if err != nil {
		return err
	}

	return nil
}
