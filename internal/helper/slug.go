package helper

import (
	"fmt"
	"strings"
	"github.com/gosimple/slug"
)

func GenerateChapterSlug(novelTitle string, number float64) string {
	titleSlug := slug.Make(novelTitle)
	chapterStr := strings.ReplaceAll(fmt.Sprintf("%g", number), ".", "-")
	return fmt.Sprintf("%s-ch-%s", titleSlug, chapterStr)
}
