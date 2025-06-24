package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/AlfanDutaPamungkas/Govel/internal/helper"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

type chapterKey string

const chapterCtx chapterKey = "chapter"

type CreateChapterPayload struct {
	Title         string  `json:"title" validate:"required"`
	Content       string  `json:"content" validate:"required"`
	ChapterNumber float64 `json:"chapter_number" validate:"required"`
	IsLocked      *bool   `json:"is_locked"`
	Price         *int    `json:"price"`
}

//	createChapterHandler godoc
//
//	@Summary		Create a new chapter
//	@Description	Create a new chapter with slug, title, author, content, chapter number, price and status is locked. Admin only
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Param			novelID	path		int						true	"Novel ID"
//	@Param			payload	body		CreateChapterPayload	true	"chapter payload"
//	@Success		201		{object}	store.Chapter			"Chapter created successfully"
//	@Security		BearerAuth
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid input"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/chapters [post]
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

	chapterSlug := helper.GenerateChapterSlug(novel.Title, payload.ChapterNumber)

	chapter := &store.Chapter{
		NovelID:       novel.ID,
		Slug:          chapterSlug,
		Title:         payload.Title,
		Content:       payload.Content,
		ChapterNumber: payload.ChapterNumber,
		IsLocked:      isLocked,
		Price:         price,
	}

	if err := app.store.Chapters.Create(r.Context(), chapter); err != nil {
		switch {
		case errors.Is(err, store.ErrDuplicateSlug):
			app.badRequestResponse(w, r, fmt.Errorf("slug chapter sudah digunakan: %s", chapterSlug))
		default:
			app.internalServerError(w, r, err)
		}
		return
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

//	updateChapterHandler godoc
//
//	@Summary		Update chapter
//	@Description	Update an existing chapter's title, content, chapter number, status is_locked or price. Admin only.
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path	int						true	"Novel ID"
//	@Param			slug	path	string					true	"Chapter Slug"
//	@Param			payload	body	UpdateChapterPayload	true	"Fields to update"
//	@Security		BearerAuth
//	@Success		200	{object}	store.Chapter			"Updated chapter"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid request"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/chapters/{slug} [patch]
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

//	deleteChapterHandler godoc
//
//	@Summary		Delete chapter
//	@Description	Delete chapter by slug
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path	int		true	"Novel ID"
//	@Param			slug	path	string	true	"Chapter Slug"
//	@Security		BearerAuth
//	@Success		204	{}			"Delete chapter succesfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel or chapter not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/chapters/{slug} [delete]
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

//	getDetailChapterHandler godoc
//
//	@Summary		Get chapter detail
//	@Description	Get detailed information about a specific chapter by its slug
//	@Tags			novels
//	@Produce		json
//	@Param			novelID	path	int		true	"Novel ID"
//	@Param			slug	path	string	true	"Chapter Slug"
//	@Security		BearerAuth
//	@Success		200	{object}	store.Chapter			"Detail chapter"
//	@Failure		400	{object}	swagger.EnvelopeError	"Invalid novel ID or slug"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		402	{object}	swagger.EnvelopeError	"Payment required"
//	@Failure		404	{object}	swagger.EnvelopeError	"Novel or chapter not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/chapters/{slug} [get]
func (app *application) getDetailChapterHandler(w http.ResponseWriter, r *http.Request){
	user := getUserFromCtx(r)
	chapter := getChapterFromCtx(r)

	history := store.History{
		UserID: user.ID,
		ChapterSlug: chapter.Slug,
		IsRead: true,
	}

	if err := app.store.Histories.Create(r.Context(), &history); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	chapter.IsRead = history.IsRead

	if err := app.jsonResponse(w, http.StatusOK, chapter); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

//	unlockChapterHandler godoc
//
//	@Summary		Unlock chapter
//	@Description	User can unlock chapter by coin
//	@Tags			novels
//	@Produce		json
//	@Security		BearerAuth
//	@Param			novelID	path	int		true	"Novel ID"
//	@Param			slug	path	string	true	"Chapter Slug"
//	@Security		BearerAuth
//	@Success		200											{object}	store.UserUnlock		"Updated chapter"
//	@Failure		400											{object}	swagger.EnvelopeError	"Invalid request"
//	@Failure		401											{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		402											{object}	swagger.EnvelopeError	"Insufficient coin"
//	@Failure		404											{object}	swagger.EnvelopeError	"Novel or chapter not found"
//	@Failure		500											{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/chapters/{slug}/unlock 	[post]
func (app *application) unlockChapterHandler(w http.ResponseWriter, r *http.Request) {
	user := getUserFromCtx(r)
	chapter := getChapterFromCtx(r)

	app.logger.Info(user.Coin)

	if user.Coin < int64(chapter.Price) {
		app.paymentRequiredResponse(w, r, errors.New("insufficient coin"))
		return
	}

	userUnlock := store.UserUnlock{
		UserID: user.ID,
		ChapterSlug: chapter.Slug,
	}

	if err := app.store.Users.PurchaseChapter(r.Context(), user.ID, int64(chapter.Price), &userUnlock); err != nil {
		switch {
		case errors.Is(err, store.ErrAlreadyUnlocked):
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, userUnlock); err != nil {
		app.internalServerError(w, r, err)
		return
	}
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
