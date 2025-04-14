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

type invoiceKey string

const invoiceCtx invoiceKey = "novel"

func (app *application) createInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	plan := chi.URLParam(r, "plan")

	var amount float64
	
	if plan == "lite" {
		amount = 15000
	} else if plan == "scroll"{
		amount = 65000
	} else if plan == "volume"{
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

func (app *application) invoicesContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		id := chi.URLParam(r, "invoiceID")

		invoice, err := app.store.Invoices.GetByInvoiceID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, invoiceCtx, invoice)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getInvoiiceFromCtx(r *http.Request) *store.Invoice {
	invoice, _ := r.Context().Value(invoiceCtx).(*store.Invoice)
	return invoice
}
