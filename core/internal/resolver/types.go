package resolver

import (
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

type Resolver struct {
	repos *repo.Repos
	cache gcache.Cache
}

type Request struct {
	bucket string
	path   string
}
