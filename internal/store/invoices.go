package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Invoice struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	ExternalID string    `json:"external_id"`
	InvoiceID  string    `json:"invoice_id"`
	InvoiceURL string    `json:"invoice_url"`
	Status     string    `json:"status"`
	Amount     float64   `json:"amount"`
	Plan       string    `json:"plan"`
	CreatedAt  time.Time `json:"created_at"`
}

type InvoicesStore struct {
	db *pgxpool.Pool
}

func (i *InvoicesStore) Create(ctx context.Context, invoice *Invoice) error {
	query := `
		INSERT INTO invoices (user_id, external_id, invoice_id, invoice_url, status, amount, plan)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := i.db.QueryRow(
		ctx,
		query,
		invoice.UserID,
		invoice.ExternalID,
		invoice.InvoiceID,
		invoice.InvoiceURL,
		invoice.Status,
		invoice.Amount,
		invoice.Plan,
	).Scan(&invoice.ID, &invoice.CreatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (i *InvoicesStore) update(ctx context.Context, tx pgx.Tx, invoice *Invoice) error {
	query := `
		update invoices
		SET status = $1
		WHERE invoice_id = $2
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := tx.Exec(
		ctx,
		query,
		invoice.Status,
		invoice.InvoiceID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (i *InvoicesStore) GetByInvoiceID(ctx context.Context, invoiceID string) (*Invoice, error) {
	query := `
		SELECT id, user_id, external_id, invoice_id, status, amount, plan, created_at
		FROM invoices
		WHERE invoice_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var invoice Invoice

	err := i.db.QueryRow(
		ctx,
		query,
		invoiceID,
	).Scan(
		&invoice.ID,
		&invoice.UserID,
		&invoice.ExternalID,
		&invoice.InvoiceID,
		&invoice.Status,
		&invoice.Amount,
		&invoice.Plan,
		&invoice.CreatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &invoice, err
}

func (i *InvoicesStore) GetByUserID(ctx context.Context, userID int64) ([]*Invoice, error) {
	query := `
		SELECT id, user_id, external_id, invoice_id, invoice_url, status, amount, plan, created_at
		FROM invoices
		WHERE user_id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := i.db.Query(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var invoices []*Invoice

	for rows.Next(){
		var invoice Invoice
		err := rows.Scan(
			&invoice.ID,
			&invoice.UserID,
			&invoice.ExternalID,
			&invoice.InvoiceID,
			&invoice.InvoiceURL,
			&invoice.Status,
			&invoice.Amount,
			&invoice.Plan,
			&invoice.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		invoices = append(invoices, &invoice)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return invoices, nil
}

func (i *InvoicesStore) GetAll(ctx context.Context) ([]*Invoice, error) {
	query := `
		SELECT id, user_id, external_id, invoice_id, status, amount, plan, created_at
		FROM invoices
	`
	
	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := i.db.Query(
		ctx,
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var invoices []*Invoice
	for rows.Next(){
		var invoice Invoice
		err := rows.Scan(
			&invoice.ID,
			&invoice.UserID,
			&invoice.ExternalID,
			&invoice.InvoiceID,
			&invoice.Status,
			&invoice.Amount,
			&invoice.Plan,
			&invoice.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		invoices = append(invoices, &invoice)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return invoices, nil
}
