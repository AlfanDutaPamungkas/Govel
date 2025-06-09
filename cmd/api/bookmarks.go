package main

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/AlfanDutaPamungkas/Govel/internal/store"
	"github.com/go-chi/chi/v5"
)

//	createBookmarkHandler godoc
//
//	@Summary		Create a new bookmark
//	@Description	Create a new user bookmark
//	@Tags			bookmarks
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Success		201	{object}	store.Bookmark			"Bookmark created successfully"
//	@Failure		400	{object}	swagger.EnvelopeError	"Bookmark already exist"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/novels/{novelID}/bookmark [post]
func (app *application) createBookmarkHandler(w http.ResponseWriter, r *http.Request) {
	novel := getNovelFromCtx(r)
	user := getUserFromCtx(r)

	bookmark := &store.Bookmark{
		NovelID: novel.ID,
		UserID:  user.ID,
	}
	
	if err := app.store.Bookmarks.Create(r.Context(), bookmark); err != nil {
		switch {
		case errors.Is(err, store.ErrBookmarkExists):
			app.badRequestResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, bookmark); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

//	getBookmarkHandler godoc
//
//	@Summary		Get bookmark
//	@Description	Get user bookmark
//	@Tags			bookmarks
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		store.Bookmark			"Get Bookmarks successfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/bookmark [get]
func (app *application) getBookmarkHandler(w http.ResponseWriter, r *http.Request){
	user := getUserFromCtx(r)

	bookmarks, err := app.store.Bookmarks.GetByUserID(r.Context(), user.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, bookmarks); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

//	deleteBookmarkHandler godoc
//
//	@Summary		Delete bookmark
//	@Description	Delete bookmark by ID
//	@Tags			novels
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			bookmarkID	path	int	true	"Bookmark ID"
//	@Security		BearerAuth
//	@Success		204	{}			"Delete bookmark succesfully"
//	@Failure		401	{object}	swagger.EnvelopeError	"Unauthorize"
//	@Failure		403	{object}	swagger.EnvelopeError	"Forbidden"
//	@Failure		404	{object}	swagger.EnvelopeError	"Bookmark not found"
//	@Failure		500	{object}	swagger.EnvelopeError	"Internal server error"
//	@Router			/users/bookmark/{bookmarkID} [delete]
func (app *application) deleteBookmarkHandler(w http.ResponseWriter, r *http.Request){
	ctx := r.Context()
	idParam := chi.URLParam(r, "bookmarkID")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	bookmark, err := app.store.Bookmarks.GetByID(ctx, id)
	if err != nil {
		switch{
		case errors.Is(err, store.ErrNotFound):
			app.notFoundResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	if bookmark.UserID != getUserFromCtx(r).ID {
		app.forbiddenResponse(w,r)
		return
	}

	if err := app.store.Bookmarks.Delete(ctx, id); err != nil {
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