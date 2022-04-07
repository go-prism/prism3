package helmapi

import (
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
)

type Index struct {
	publicURL string
	repos     *repo.Repos
}
