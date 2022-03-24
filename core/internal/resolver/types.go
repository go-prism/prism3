package resolver

import (
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/impl/helmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/npmapi"
	"gitlab.com/go-prism/prism3/core/internal/storage"
)

type Resolver struct {
	repos *repo.Repos

	// caches
	cache gcache.Cache

	store storage.Reader
	// providers
	helm *helmapi.Index
	npm  *npmapi.Provider
}

type Request struct {
	bucket string
	path   string
}

type NPMRequest struct {
	bucket  string
	pkg     string
	version string
}
