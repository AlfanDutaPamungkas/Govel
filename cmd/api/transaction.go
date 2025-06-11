package main

import (
	"errors"
	"net/http"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
)

type XenditWebhookPayload struct {
	InvoiceID  string `json:"id"`           // ID dari Xendit
	ExternalID string `json:"external_id"`  // UUID invoice yang kamu generate
	Status     string `json:"status"`       // PAID / EXPIRED / lainnya
}

type response struct {
	Status string `json:"status"`
	Coin   int64  `json:"coin"`
}

func (app *application) transactionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload XenditWebhookPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	invoice, err := app.store.Invoices.GetByInvoiceID(ctx, payload.InvoiceID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			app.notFoundResponse(w, r, err)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	if invoice.Status == "PAID" {
		app.badRequestResponse(w, r, errors.New("invoice already paid"))
		return
	}

	user, err := app.store.Users.GetByID(ctx, invoice.UserID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	planCoin := map[string]int{
		"lite":   120,
		"scroll": 700,
		"volume": 1300,
	}

	coin, ok := planCoin[invoice.Plan]
	if !ok {
		app.badRequestResponse(w, r, errors.New("plan not found"))
		return
	}

	if payload.Status != "PAID" {
		app.badRequestResponse(w, r, errors.New("payment failed or not completed"))
		return
	}

	user.Coin = int64(coin)
	invoice.Status = payload.Status

	if err := app.store.Users.Webhook(ctx, user, invoice); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	resp := response{
		Status: payload.Status,
		Coin:   user.Coin,
	}

	if err := app.jsonResponse(w, http.StatusOK, resp); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
