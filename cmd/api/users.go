package main

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type userKey string

const userCtx userKey = "user"

func (app *application) activateUserHandler(w http.ResponseWriter, r *http.Request) {
	token := chi.URLParam(r, "token")
	err := app.store.Users.Activate(r.Context(), token)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *application) getUserHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if userID < 1 {
		app.badRequestResponse(w, r, errors.New("user ID must be a positive integer"))
		return
	}

	user, err := app.store.Users.GetByID(r.Context(), userID)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getProfileHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type CreateUpdateUsernamePayload struct {
	Username string `json:"username" validate:"max=255"`
	Email    string `json:"email" validate:"omitempty,email,max=255"`
}

func (app *application) updateHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	var payload CreateUpdateUsernamePayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if payload.Email == "" && payload.Username == "" {
		app.badRequestResponse(w, r, errors.New("please provide either email or username"))
		return
	}

	if payload.Username != "" {
		user.Username = payload.Username
	}

	if payload.Email != "" {
		user.Email = payload.Email
		user.TokenVersion++
	}

	user.UpdatedAt = time.Now()

	if err := app.store.Users.Update(r.Context(), user); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type ChangePasswordPayload struct {
	Password string `json:"password" validate:"required,min=3,max=72"`
}

func (app *application) changePasswordHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)

	var payload ChangePasswordPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := user.Password.Set(payload.Password); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	user.UpdatedAt = time.Now()
	user.TokenVersion++

	if err := app.store.Users.Update(r.Context(), user); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
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

func getUserFromCtx(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}
