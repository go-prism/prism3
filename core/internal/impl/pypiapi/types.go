package pypiapi

import (
	"gitlab.com/go-prism/prism3/core/internal/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
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
