package resolver

import (
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/storage"
)

type Resolver struct {
	repos *repo.Repos
	cache gcache.Cache
	store storage.Reader
}

type Request struct {
	bucket string
	path   string
}
