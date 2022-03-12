package v1

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"sync"
)

func NewGateway(r *resolver.Resolver) *Gateway {
	return &Gateway{
		resolver: r,
		pool: &sync.Pool{
			New: func() interface{} {
				return new(resolver.Request)
			},
		},
	}
}

func (g *Gateway) Serve(ctx context.Context, r *resolver.Request) (io.Reader, error) {
	return g.resolver.Resolve(ctx, r)
}
