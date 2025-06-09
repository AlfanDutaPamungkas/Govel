package main

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type userKey string

const userCtx userKey = "user"

//	activateUserHandler godoc
//
//	@Summary		Activate user account
//	@Description	Activate user account using a valid token
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			token	path		string	true	"Activation token"
//	@Success		204		{}			"User account activated"
//	@Failure		404		{object}	swagger.EnvelopeError	"invalid token"
//	@Failure		500		{object}	swagger.EnvelopeError	"internal server error"
//	@Router			/users/activate/{token} [put]
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

//	getUserHandler godoc
//
//	@Summary		Get user by ID
//	@Description	Retrieve the user profile by user ID
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			userID	path	int	true	"User ID"
//	@Security		BearerAuth
//	@Success		200	{object}	store.User				"User profile data"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid user ID"
//	@Failure		404	{object}	swagger.EnvelopeError	"User not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/{userID} [get]
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

//	getProfileHandler godoc
//
//	@Summary		Get user profile
//	@Description	Retrieve the profile of the currently authenticated user
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	store.User				"User profile data"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorized"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/ [get]
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

//	updateUserHandler godoc
//
//	@Summary		Update user profile
//	@Description	Update user profile, including username and/or email
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			payload	body	CreateUpdateUsernamePayload	true	"Updated user profile data"
//	@Security		BearerAuth
//	@Success		200	{object}	store.User				"Updated user profile data"
//	@Failure		400	{object}	swagger.EnvelopeError	"Bad request"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorized"
//	@Failure		404	{object}	swagger.EnvelopeError	"User not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/ [patch]
func (app *application) updateUserHandler(w http.ResponseWriter, r *http.Request) {
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

//	changePasswordHandler godoc
//
//	@Summary		Change user password
//	@Description	Change the password of the currently authenticated user
//	@Tags			users
//	@Accept			json
//	@Produce		json
//	@Param			payload	body	ChangePasswordPayload	true	"New password"
//	@Security		BearerAuth
//	@Success		200	{object}	swagger.EnvelopeString	"Password change success message"
//	@Failure		400	{object}	swagger.EnvelopeError	"Bad request"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorized"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/change-password [patch]
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

//	changeUserImageHandler godoc
//
//	@Summary		Change user image
//	@Description	Change User Image
//	@Tags			users
//	@Accept			mpfd
//	@Produce		json
//	@Security		BearerAuth
//	@Param			image	formData	file		true	"Image file (jpg, png, etc.)"
//	@Success		200		{object}	store.User	"Updated user with new image"
//	@Security		BearerAuth
//	@Failure		400	{object}	swagger.EnvelopeError	"Bad request (e.g. no image)"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		404	{object}	swagger.EnvelopeError	"User not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/image [patch]
func (app *application) changeUserImageHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	ctx := r.Context()

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	defer file.Close()

	imageUrl, err := cld.UploadImage(ctx, app.cld, file, fileHeader)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	user.ImageURL = imageUrl
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

func getUserFromCtx(r *http.Request) *store.User {
	user, _ := r.Context().Value(userCtx).(*store.User)
	return user
}
