package npmapi

import "gitlab.com/go-prism/prism3/core/internal/db/repo"

type Provider struct {
	publicURL string
	repos     *repo.Repos
}
