package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/mailer"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,max=100"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

type UserWithToken struct {
	*store.User
	Token string `json:"token"`
}

//	registerUserHandler godoc
//
//	@Summary		Registers a user
//	@Description	Registers a user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@param			payload	body		RegisterUserPayload	true	"User credentials"
//	@Success		201		{object}	UserWithToken		"user registered"
//	@Failure		400		{object}	swagger.EnvelopeError
//	@Failure		500		{object}	swagger.EnvelopeError
//	@Router			/authentication/user [post]
func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload RegisterUserPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := &store.User{
		Username: payload.Username,
		Email:    payload.Email,
	}

	if err := user.Password.Set(payload.Password); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	plainToken := uuid.New().String()
	hash := sha256.Sum256([]byte(plainToken))
	hashToken := hex.EncodeToString(hash[:])

	err := app.store.Users.CreateAndInvite(r.Context(), user, hashToken, app.config.mail.exp)
	if err != nil {
		switch err {
		case store.ErrDuplicateEmail:
			app.badRequestResponse(w, r, err)
		case store.ErrDuplicateUsername:
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	userWithToken := UserWithToken{
		User:  user,
		Token: plainToken,
	}

	activationURL := fmt.Sprintf("%s/confirm/%s", app.config.frontendURL, plainToken)

	vars := struct {
		Username      string
		ActivationURL string
	}{
		Username:      user.Username,
		ActivationURL: activationURL,
	}

	err = app.mailer.Send(mailer.UserWelcomeTemplate, user.Username, user.Email, vars)
	if err != nil {
		app.logger.Errorw("error sending welcome email", "error", err)

		if err := app.store.Users.Delete(r.Context(), user.ID); err != nil {
			app.logger.Errorw("error deleting user", "error", err)
		}

		app.internalServerError(w, r, err)
		return
	}
	app.logger.Info("Email sent successfully")

	if err := app.jsonResponse(w, http.StatusCreated, userWithToken); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type CreateUserTokenPayload struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

//	createTokenHandler godoc
//
//	@Summary		Creates a token
//	@Description	Creates a token for a user
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@param			payload	body		CreateUserTokenPayload	true	"User credentials"
//	@Success		201		{object}	swagger.EnvelopeString	"Token"
//	@Failure		400		{object}	swagger.EnvelopeError
//	@Failure		401		{object}	swagger.EnvelopeError
//	@Failure		500		{object}	swagger.EnvelopeError
//	@Router			/authentication/token [post]
func (app *application) createTokenHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateUserTokenPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user, err := app.store.Users.GetByEmail(r.Context(), payload.Email)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.unauthorizedResponse(w, r, fmt.Errorf("invalid credentials"))
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if !user.Password.Verify(payload.Password) {
		app.unauthorizedResponse(w, r, fmt.Errorf("invalid credentials"))
		return
	}

	claims := jwt.MapClaims{
		"sub":           user.ID,
		"exp":           time.Now().Add(app.config.auth.token.exp).Unix(),
		"iat":           time.Now().Unix(),
		"nbf":           time.Now().Unix(),
		"iss":           app.config.auth.token.iss,
		"aud":           app.config.auth.token.iss,
		"token_version": user.TokenVersion,
	}

	token, err := app.authenticator.GenerateToken(claims)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, token); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type ForgotPasswordPayload struct {
	Email    string `json:"email" validate:"required,email,max=255"`
}

//	forgotPasswordHandler godoc
//
//	@Summary		Request forgot password
//	@Description	Send reset password link to user's email
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			payload	body		ForgotPasswordPayload	true	"Email payload"
//	@Success		201		{object}	swagger.EnvelopeString	"Plain reset token"
//	@Failure		400		{object}	swagger.EnvelopeError
//	@Failure		404		{object}	swagger.EnvelopeError
//	@Failure		500		{object}	swagger.EnvelopeError
//	@Router			/authentication/forgot-password [post]
func (app *application) forgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var payload ForgotPasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}
	
	user, err := app.store.Users.GetByEmail(r.Context(), payload.Email)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.notFoundResponse(w, r, fmt.Errorf("email not found"))
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	plainToken := uuid.New().String()
	hash := sha256.Sum256([]byte(plainToken))
	hashToken := hex.EncodeToString(hash[:])

	if err = app.store.Users.CreateForgotPassReq(r.Context(), hashToken, user.ID, app.config.ForgotPassExp); err != nil{
		app.internalServerError(w, r, err)
		return
	}

	resetPasswordURL := fmt.Sprintf("%s/reset/%s", app.config.frontendURL, plainToken)

	vars := struct {
		Username      string
		ResetPasswordURL string
	}{
		Username:      user.Username,
		ResetPasswordURL: resetPasswordURL,
	}

	err = app.mailer.Send(mailer.ForgotPassReqTemplate, user.Username, user.Email, vars)
	if err != nil {
		app.logger.Errorw("error sending welcome email", "error", err)

		if err := app.store.Users.DeleteForgotPassReq(r.Context(), hashToken); err != nil {
			app.logger.Errorw("error deleting forgot password request", "error", err)
		}

		app.internalServerError(w, r, err)
		return
	}
	app.logger.Info("Email sent successfully")

	if err := app.jsonResponse(w, http.StatusCreated, plainToken); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type ResetPasswordPayload struct {
	Password string `json:"password" validate:"required,min=3,max=72"`
}

//	resetPasswordHandler godoc
//
//	@Summary		Reset user password
//	@Description	Reset password using token from forgot-password email
//	@Tags			authentication
//	@Accept			json
//	@Produce		json
//	@Param			token	path		string					true	"Reset password token"
//	@Param			payload	body		ResetPasswordPayload	true	"New password payload"
//	@Success		200		{object}	swagger.EnvelopeString	"Password changed message"
//	@Failure		400		{object}	swagger.EnvelopeError
//	@Failure		404		{object}	swagger.EnvelopeError
//	@Failure		500		{object}	swagger.EnvelopeError
//	@Router			/authentication/reset-password/{token} [patch]
func (app *application) resetPasswordHandler(w http.ResponseWriter, r *http.Request){
	token := chi.URLParam(r, "token")
	var payload ResetPasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	err := app.store.Users.ResetPassword(r.Context(), token, payload.Password)
	if err != nil {
		switch err {
		case store.ErrNotFound:	
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, "password changed succesfully"); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
