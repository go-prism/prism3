package resolver

import (
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/impl/helmapi"
	"gitlab.com/go-prism/prism3/core/internal/storage"
)

type Resolver struct {
	repos *repo.Repos
	cache gcache.Cache
	store storage.Reader
	helm  *helmapi.Index
}

type Request struct {
	bucket string
	path   string
}
