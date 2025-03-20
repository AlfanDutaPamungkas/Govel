package main

import (
	"net/http"

	cld "github.com/AlfanDutaPamungkas/Govel/internal/cloudinary"
	"github.com/AlfanDutaPamungkas/Govel/internal/helper"
	"github.com/AlfanDutaPamungkas/Govel/internal/store"
)

type CreateNovelPayload struct {
	Title    string `schema:"title" validate:"required"`
	Author   string `schema:"author" validate:"required,max=255"`
	Synopsis string `schema:"synopsis" validate:"required"`
	Genre    string `schema:"genre" validate:"required"`
}

func (app *application) createNovelHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	file, fileHeader, err := r.FormFile("Image")
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
