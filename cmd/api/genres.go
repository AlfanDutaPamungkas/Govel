package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type genreKey string

const genreCtx genreKey = "genre"

type GenrePayload struct {
	Name string `json:"name" validate:"required,max=255"`
}

// createGenreHandler godoc
//
//	@Summary		Create a new genre
//	@Description	Create a new genre. Admin only
//	@Tags			genres
//	@Accept			json
//	@Produce		json
//	@Param			data	body	GenrePayload	true	"Genre Name"
//	@Security		BearerAuth
//	@Success		201	{object}	store.Genre				"Genre created successfully"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid input"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/genres [post]
func (app *application) createGenreHandler(w http.ResponseWriter, r *http.Request) {
	var payload GenrePayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	genre := &store.Genre{
		Name: payload.Name,
	}

	if err := app.store.Genres.Create(r.Context(), genre); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, genre); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// getAllNovelHandler godoc
//
//	@Summary		Get all genres
//	@Description	Get all genres
//	@Tags			genres
//	@Produce		json
//	@Success		200	{array}		store.Genre				"Get all genres successfully"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/genres [get]
func (app *application) getAllGenreHandler(w http.ResponseWriter, r *http.Request) {
	genres, err := app.store.Genres.GetAllGenre(r.Context())
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, genres); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// updateGenreHandler godoc
//
//	@Summary		update genre
//	@Description	update genre. Admin only
//	@Tags			genres
//	@Accept			json
//	@Produce		json
//	@Param			genreID	path	int				true	"Genre ID"
//	@Param			data	body	GenrePayload	true	"Genre Name"
//	@Security		BearerAuth
//	@Success		201	{object}	store.Genre				"Genre updated successfully"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid input"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/genres/{genreID} [post]
func (app *application) updateGenreHandler(w http.ResponseWriter, r *http.Request) {
	var payload GenrePayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	genre := getGenreFromCtx(r)

	genre.Name = payload.Name

	if err := app.store.Genres.Update(r.Context(), genre); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, genre); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// deleteNovelHandler godoc
//
//	@Summary		Delete genre
//	@Description	Delete genre by ID. Admin only
//	@Tags			genres
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			genreID	path	int	true	"Genre ID"
//	@Security		BearerAuth
//	@Success		204	{}			"Delete genre succesfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Genre not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{genreID} [delete]
func (app *application) deleteGenreHandler(w http.ResponseWriter, r *http.Request) {
	genre := getGenreFromCtx(r)

	if err := app.store.Genres.Delete(r.Context(), genre.ID); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *application) genresContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		idParam := chi.URLParam(r, "genreID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}

		genre, err := app.store.Genres.GetByID(ctx, int32(id))
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, genreCtx, genre)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getGenreFromCtx(r *http.Request) *store.Genre {
	genre, _ := r.Context().Value(genreCtx).(*store.Genre)
	return genre
}