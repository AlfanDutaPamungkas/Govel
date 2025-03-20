package main

import (
	"net/http"

	"github.com/gorilla/schema"
)

var decoder = schema.NewDecoder()

func readSchema(r *http.Request, result any) error {
	if err := r.ParseForm(); err != nil {
		return err
	}

	if err := decoder.Decode(result, r.PostForm); err != nil {
		return err
	}

	return nil
}
