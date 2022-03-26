package npmapi

import (
	cache "github.com/Code-Hex/go-generics-cache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

type Provider struct {
	publicURL string
	repos     *repo.Repos

	// caches
	pkgCache        *cache.Cache[string, string]
	pkgVersionCache *cache.Cache[string, string]
}
