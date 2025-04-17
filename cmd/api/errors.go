package main

import "net/http"

func (app *application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Errorw("internal error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusInternalServerError, "the server encountered a problem")
}

func (app *application) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnf("bad request error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnf("not found error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusNotFound, "not found")
}

func (app *application) unauthorizedResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Error("unauthorized error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusUnauthorized, err.Error())
}

func (app *application) forbiddenResponse(w http.ResponseWriter, r *http.Request) {
	app.logger.Warnf("forbidden error", "method", r.Method, "path", r.URL.Path, "error", "prohibited")

	writeJSONError(w, http.StatusForbidden, "prohibited")
}

func (app *application) paymentRequiredResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnf("payment required error", "method", r.Method, "path", r.URL.Path, "error", "prohibited")

	writeJSONError(w, http.StatusPaymentRequired, err.Error())
}
