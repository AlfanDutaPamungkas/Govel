package main

import (
	"context"
	"errors"
	"net/http"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/xendit/xendit-go/v6/invoice"
)

func (app *application) createInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	plan := chi.URLParam(r, "plan")

	var amount float64

	if plan == "lite" {
		amount = 15000
	} else if plan == "scroll" {
		amount = 65000
	} else if plan == "volume" {
		amount = 100000
	} else {
		app.badRequestResponse(w, r, errors.New("plan not found"))
		return
	}

	externalID := "invoice-" + uuid.New().String()

	invReq := *invoice.NewCreateInvoiceRequest(externalID, amount)

	resp, _, err := app.xendit.InvoiceApi.CreateInvoice(context.Background()).
		CreateInvoiceRequest(invReq).
		Execute()

	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	i := &store.Invoice{
		UserID:     user.ID,
		ExternalID: externalID,
		InvoiceID:  *resp.Id,
		Status:     string(resp.Status),
		Amount:     amount,
		Plan:       plan,
		InvoiceURL: resp.InvoiceUrl,
	}

	if err := app.store.Invoices.Create(r.Context(), i); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, i); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	invoice, err := app.store.Invoices.GetByUserID(r.Context(), user.ID)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, invoice); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getAllInvoicesHandler(w http.ResponseWriter, r *http.Request) {
	invoices, err  := app.store.Invoices.GetAll(r.Context())

	if err != nil {
		app.internalServerError(w, r, err)
		return 
	}

	if err := app.jsonResponse(w, http.StatusCreated, invoices); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
