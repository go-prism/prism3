package v1

import (
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"net/http/httputil"
	"sync"
)

type Gateway struct {
	resolver resolver.IResolver
	pool     *sync.Pool
	npmPool  *sync.Pool

	goProxy      *httputil.ReverseProxy
	artifactRepo *repo.ArtifactRepo
}
