package repo

import (
	"errors"
	"github.com/lpar/problem"
	"gorm.io/gorm"
	"net/http"
)

func returnErr(err error, msg string) error {
	code := http.StatusInternalServerError
	if errors.Is(err, gorm.ErrRecordNotFound) {
		code = http.StatusNotFound
	}
	return problem.New(code).Errorf(msg)
}
