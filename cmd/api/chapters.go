package main

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type chapterKey string

const chapterCtx chapterKey = "chapter"

type CreateChapterPayload struct {
	Slug          string  `json:"slug" validate:"required,max=100"`
	Title         string  `json:"title" validate:"required"`
	Content       string  `json:"content" validate:"required"`
	ChapterNumber float64 `json:"chapter_number" validate:"required"`
	IsLocked      *bool   `json:"is_locked"`
	Price         *int    `json:"price"`
}

func (app *application) createChapterHandler(w http.ResponseWriter, r *http.Request) {
	novel := getNovelFromCtx(r)

	var payload CreateChapterPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	isLocked := false
	if payload.IsLocked != nil {
		isLocked = *payload.IsLocked
	}

	price := 0
	if payload.Price != nil {
		price = *payload.Price
	}

	chapter := &store.Chapter{
		NovelID:       novel.ID,
		Slug:          payload.Slug,
		Title:         payload.Title,
		Content:       payload.Content,
		ChapterNumber: payload.ChapterNumber,
		IsLocked:      isLocked,
		Price:         price,
	}

	if err := app.store.Chapters.Create(r.Context(), chapter); err != nil {
		switch {
		case errors.Is(err, store.ErrDuplicateSlug):
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, chapter); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type UpdateChapterPayload struct {
	Title         string   `json:"title"`
	Content       string   `json:"content"`
	ChapterNumber *float64 `json:"chapter_number"`
	IsLocked      *bool    `json:"is_locked"`
	Price         *int     `json:"price"`
}

func (app *application) updateChapterHandler(w http.ResponseWriter, r *http.Request) {
	chapter := getChapterFromCtx(r)

	var payload UpdateChapterPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if payload.Title == "" && payload.Content == "" && payload.ChapterNumber == nil && payload.IsLocked == nil && payload.Price == nil {
		app.badRequestResponse(w, r, errors.New("please provide at least one field"))
		return
	}

	if payload.Title != "" {
		chapter.Title = payload.Title
	}

	if payload.Content != "" {
		chapter.Content = payload.Content
	}

	if payload.ChapterNumber != nil {
		chapter.ChapterNumber = *payload.ChapterNumber
	}

	if payload.IsLocked != nil {
		chapter.IsLocked = *payload.IsLocked
	}

	if payload.Price != nil {
		chapter.Price = *payload.Price
	}

	chapter.UpdatedAt = time.Now()

	if err := app.store.Chapters.Update(r.Context(), chapter); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, chapter); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) deleteChapterHandler(w http.ResponseWriter, r *http.Request) {
	chapter := getChapterFromCtx(r)

	if err := app.store.Chapters.Delete(r.Context(), chapter.Slug); err != nil {
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

func (app *application) chaptersContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		slug := chi.URLParam(r, "slug")

		chapter, err := app.store.Chapters.GetBySlug(ctx, slug)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFoundResponse(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, chapterCtx, chapter)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getChapterFromCtx(r *http.Request) *store.Chapter {
	chapter, _ := r.Context().Value(chapterCtx).(*store.Chapter)
	return chapter
}
