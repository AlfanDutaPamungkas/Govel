package main

import (
	"errors"
	"net/http"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
)

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

	isLocked := false // Default dari DB
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
