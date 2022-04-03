package npmapi

import (
	"github.com/jellydator/ttlcache/v3"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
)

type Provider struct {
	publicURL string
	repos     *repo.Repos

	// caches
	pkgCache        *ttlcache.Cache[string, string]
	pkgVersionCache *ttlcache.Cache[string, string]
}
