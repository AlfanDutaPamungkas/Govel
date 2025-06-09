package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
)

type WebhookPayload struct {
	InvoiceID string `json:"invoice_id" validate:"required"`
}

type response struct {
	Status string `json:"status"`
	Coin   int64  `json:"coin"`
}

//	transactionHandler godoc
//
//	@Summary		Webhook
//	@Description	Webhook for handle after payment
//	@Tags			transaction
//	@Accept			json
//	@Produce		json
//	@Param			payload	body	WebhookPayload	true	"Webhook payload"
//	@Security		BearerAuth
//	@Success		200	{object}	response	"Payment success"
//	@Failure		400	{object}	swagger.EnvelopeError
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		404	{object}	swagger.EnvelopeError	"Invoice not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/webhook [post]
func (app *application) transactionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context() 

	user := getUserFromCtx(r)

	var payload WebhookPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	invoice, err := app.store.Invoices.GetByInvoiceID(ctx, payload.InvoiceID)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if invoice.Status == "PAID" {
		app.badRequestResponse(w, r, errors.New("invoice already paid"))
		return
	}

	url := fmt.Sprintf("https://api.xendit.co/invoices/%s", invoice.InvoiceID)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	auth := base64.StdEncoding.EncodeToString([]byte(app.config.xenditSecret + ":"))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		app.logger.Warn("simulate failed",
			"status", resp.StatusCode,
			"body", string(bodyBytes),
		)
		app.badRequestResponse(w, r, errors.New("failed to get transaction"))
		return
	}

	var body struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
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

	user.Coin = int64(coin)
	invoice.Status = body.Status

	if err := app.store.Users.Webhook(ctx, user, invoice); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if body.Status != "PAID" {
		app.badRequestResponse(w, r, errors.New("payment failed"))
		return
	}

	response := response{
		Status: body.Status,
		Coin: user.Coin,
	}

	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
