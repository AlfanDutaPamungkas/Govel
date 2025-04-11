package store

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Invoice struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	ExternalID string    `json:"external_id"`
	InvoiceID  string    `json:"invoice_id"`
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
		INSERT INTO invoices (user_id, external_id, invoice_id, status, amount, plan)
		VALUES ($1, $2, $3, $4, $5, $6)
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
		invoice.Status,
		invoice.Amount,
		invoice.Plan,
	).Scan(&invoice.ID, &invoice.CreatedAt)

	if err != nil {
		return err
	}
	
	return nil
}
