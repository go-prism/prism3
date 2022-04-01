package v1

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"net/http/httputil"
	"net/url"
	"sync"
)

func NewGateway(r resolver.IResolver, goProxyURL *url.URL, artifactRepo *repo.ArtifactRepo) *Gateway {
	var goProxy *httputil.ReverseProxy
	if goProxyURL != nil {
		goProxy = httputil.NewSingleHostReverseProxy(goProxyURL)
	}
	return &Gateway{
		resolver: r,
		pool: &sync.Pool{
			New: func() any {
				return new(resolver.Request)
			},
		},
		npmPool: &sync.Pool{
			New: func() any {
				return new(resolver.NPMRequest)
			},
		},
		goProxy:      goProxy,
		artifactRepo: artifactRepo,
	}
}

func (g *Gateway) Serve(ctx context.Context, r *resolver.Request) (io.Reader, error) {
	return g.resolver.Resolve(ctx, r)
}
