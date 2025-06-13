package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type novelKey string

const novelCtx novelKey = "novel"

type CreateNovelPayload struct {
	Title    string  `schema:"title" validate:"required"`
	Author   string  `schema:"author" validate:"required,max=255"`
	Synopsis string  `schema:"synopsis" validate:"required"`
	GenreIDs []int32 `schema:"genre_ids" validate:"required,min=1,dive,gt=0"`
}

// createNovelHandler godoc
//
//	@Summary		Create a new novel
//	@Description	Create a new novel with title, author, synopsis, genre, and optional image. Admin only
//	@Tags			novels
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			title		formData	string	true	"Novel Title"
//	@Param			author		formData	string	true	"Author of the Novel"
//	@Param			synopsis	formData	string	true	"Synopsis of the Novel"
//	@Param			genre_ids	formData	[]int	true	"Genre IDs (multiple values allowed)"
//	@Param			image		formData	file	false	"Cover image of the Novel"
//	@Security		BearerAuth
//	@Success		201	{object}	store.Novel				"Novel created successfully"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid input"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels [post]
func (app *application) createNovelHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		file = nil
		fileHeader = nil
	} else {
		defer file.Close()
	}

	var imageUrl string

	if file != nil && fileHeader != nil {
		imageUrl, err = cld.UploadImage(ctx, app.cld, file, fileHeader)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
	} else {
		imageUrl = "https://res.cloudinary.com/dmxnd3pn7/image/upload/v1742304305/novel/novel-template_iweyqs.jpg"
	}

	var payload CreateNovelPayload

	if err := readSchema(r, &payload); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	novel := &store.Novel{
		Title:    payload.Title,
		Author:   payload.Author,
		Synopsis: payload.Synopsis,
		ImageURL: imageUrl,
	}

	if err := app.store.Novels.CreateNovelAndInsertGenres(ctx, novel, payload.GenreIDs); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type UpdateNovelPayload struct {
	Title    string  `json:"title"`
	Author   string  `json:"author" validate:"omitempty,max=255"`
	Synopsis string  `json:"synopsis"`
	GenreIDs []int32 `json:"genre_ids"`
}

// updateNovelHandler godoc
//
//	@Summary		Update novel
//	@Description	Update an existing novel's title, author, synopsis, or genre. Admin only.
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path	int					true	"Novel ID"
//	@Param			data	body	UpdateNovelPayload	true	"Fields to update"
//	@Security		BearerAuth
//	@Success		200	{object}	store.Novel				"Updated novel"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid request"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID} [patch]
func (app *application) updateNovelHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	novel := getNovelFromCtx(r)

	var payload UpdateNovelPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if payload.Title == "" && payload.Author == "" && payload.Synopsis == "" && len(payload.GenreIDs) == 0 {
		app.badRequestResponse(w, r, errors.New("please provide at least one field"))
		return
	}

	if payload.Title != "" {
		novel.Title = payload.Title
	}

	if payload.Author != "" {
		novel.Author = payload.Author
	}

	if payload.Synopsis != "" {
		novel.Synopsis = payload.Synopsis
	}

	if len(payload.GenreIDs) != 0 {
		if err := app.store.Novels.UpdateNovelGenres(ctx, novel.ID, payload.GenreIDs); err != nil {
			app.internalServerError(w, r, err)
			return
		}
	}

	novel.UpdatedAt = time.Now()

	if err := app.store.Novels.Update(ctx, novel); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// changeNovelImageHandler godoc
//
//	@Summary		Change novel image
//	@Description	Update the cover image of a novel. Admin only.
//	@Tags			novels
//	@Accept			mpfd
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path		int			true	"Novel ID"
//	@Param			image	formData	file		true	"Image file (jpg, png, etc.)"
//	@Success		200		{object}	store.Novel	"Updated novel with new image"
//	@Security		BearerAuth
//	@Failure		400	{object}	swagger.EnvelopeError	"Bad request (e.g. no image)"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/image [patch]
func (app *application) changeNovelImageHandler(w http.ResponseWriter, r *http.Request) {
	novel := getNovelFromCtx(r)
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

	novel.ImageURL = imageUrl
	novel.UpdatedAt = time.Now()

	if err := app.store.Novels.Update(r.Context(), novel); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// deleteNovelHandler godoc
//
//	@Summary		Delete novel
//	@Description	Delete novel by ID. Admin only
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path	int	true	"Novel ID"
//	@Security		BearerAuth
//	@Success		204	{}			"Delete novel succesfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID} [delete]
func (app *application) deleteNovelHandler(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "novelID")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.store.Novels.Delete(r.Context(), id); err != nil {
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

// getNovelHandler godoc
//
//	@Summary		Get novel detail
//	@Description	Get detailed information about a specific novel by its ID, including chapters
//	@Tags			novels
//	@Produce		json
//	@Param			novelID	path	int	true	"Novel ID"
//	@Security		BearerAuth
//	@Success		200	{object}	store.Novel				"Detail novel with chapters"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid novel ID"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID} [get]
func (app *application) getNovelHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	novel := getNovelFromCtx(r)
	ctx := r.Context()

	chapters, err := app.store.Chapters.GetChaptersFromNovelID(ctx, novel.ID, user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	novel.Chapters = chapters

	genres, err := app.store.Genres.GetGenresFromNovelID(ctx, novel.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	novel.Genre = genres

	if err := app.jsonResponse(w, http.StatusOK, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// getAllNovelHandler godoc
//
//	@Summary		Get all novels
//	@Description	Get all novels not including chapters
//	@Tags			novels
//	@Produce		json
//	@Param			sorted_by	query		string					false	"Sort by created_at or updated_at"
//	@Param			search		query		string					false	"Search by title"
//	@Success		200			{array}		store.Novel				"Get all Novels successfully"
//	@Failure		500			{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels [get]
func (app *application) getAllNovelHandler(w http.ResponseWriter, r *http.Request) {
	sortBy := r.URL.Query().Get("sort_by")
	search := r.URL.Query().Get("search")

	if sortBy != "" && sortBy != "created_at" && sortBy != "updated_at" {
		app.notFoundResponse(w, r, errors.New("invalid sort_by option"))
		return
	}

	novels, err := app.store.Novels.GetAllNovel(r.Context(), sortBy, search)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrInvalidOption):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, novels); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

// getNovelsFromGenreID godoc
//
//	@Summary		Get novels from genre name
//	@Description	Get novels from genre name
//	@Tags			novels
//	@Produce		json
//	@Param			genreID	path		int						true	"Get from genre"
//	@Success		200		{array}		store.Novel				"Get novels from genre successfully"
//	@Failure		500		{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/genres/{genreID}/novels [get]
func (app *application) getNovelsFromGenreID(w http.ResponseWriter, r *http.Request) {
	genre := getGenreFromCtx(r)

	novels, err := app.store.Novels.GetNovelsFromGenreID(r.Context(), genre.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, novels); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) novelsContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		idParam := chi.URLParam(r, "novelID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}

		novel, err := app.store.Novels.GetByID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, novelCtx, novel)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getNovelFromCtx(r *http.Request) *store.Novel {
	novel, _ := r.Context().Value(novelCtx).(*store.Novel)
	return novel
}
