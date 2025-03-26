package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/helper"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type novelKey string

const novelCtx novelKey = "novel"

type CreateNovelPayload struct {
	Title    string `schema:"title" validate:"required"`
	Author   string `schema:"author" validate:"required,max=255"`
	Synopsis string `schema:"synopsis" validate:"required"`
	Genre    string `schema:"genre" validate:"required"`
}

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

	genres := helper.ConvertGenre(payload.Genre)

	novel := &store.Novel{
		Title:    payload.Title,
		Author:   payload.Author,
		Synopsis: payload.Synopsis,
		Genre:    genres,
		ImageURL: imageUrl,
	}

	if err := app.store.Novels.Create(ctx, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, novel); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type UpdateNovelPayload struct {
	Title    string `json:"title"`
	Author   string `json:"author" validate:"omitempty,max=255"`
	Synopsis string `json:"synopsis"`
	Genre    string `json:"genre"`
}

func (app *application) updateNovelHandler(w http.ResponseWriter, r *http.Request) {
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

	if payload.Title == "" && payload.Author == "" && payload.Synopsis == "" && payload.Genre == "" {
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

	if payload.Genre != "" {
		genres := helper.ConvertGenre(payload.Genre)
		novel.Genre = genres
	}

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
