package helper

import "strings"

func ConvertGenre(genre string) []string {
	return strings.Split(genre, ",")
}
