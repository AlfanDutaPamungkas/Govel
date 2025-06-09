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

//	createInvoiceHandler godoc
//
//	@Summary		Create invoice
//	@Description	Get invoices according from plan
//	@Tags			invoices
//	@Produce		json
//	@Security		BearerAuth
//	@Param			plan	path		string					true	"Plan"
//	@Success		201		{object}	store.Invoice			"Create invoice successfully"
//	@Failure		401		{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		500		{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/invoices/{plan} [post]
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

//	getInvoiceHandler godoc
//
//	@Summary		Get invoices
//	@Description	Get user's invoices
//	@Tags			invoices
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		store.Invoice			"Get user invoice successfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		404	{object}	swagger.EnvelopeError	"Invoice not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/invoices [get]
func (app *application) getInvoiceHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	invoices, err := app.store.Invoices.GetByUserID(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, invoices); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

//	getAllInvoicesHandler godoc
//
//	@Summary		Get all invoices
//	@Description	Get all invoices. Admin only
//	@Tags			invoices
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		store.Invoice			"Get all invoice successfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/invoices/all [get]
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
