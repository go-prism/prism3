package helmapi

import (
	"errors"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

var ErrNoIndexFound = errors.New("no index.yaml could be found in any remote")

type Index struct {
	publicURL string
	repos     *repo.Repos
}
