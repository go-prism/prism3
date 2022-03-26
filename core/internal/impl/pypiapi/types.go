package pypiapi

import (
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/schemas"
)

type Index struct {
	Package   string
	PublicURL string
	Ref       string
	Items     []*schemas.PyPackage
}

type Provider struct {
	publicURL string
	repos     *repo.Repos
}
