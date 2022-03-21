package v1

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
)

func (g *Gateway) ServeHelm(ctx context.Context, r *resolver.Request) (io.Reader, error) {
	return g.resolver.ResolveHelm(ctx, r)
}
