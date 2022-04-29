package v1

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
)

func (g *Gateway) ServeHelm(ctx context.Context, r *resolver.Request) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "gateway_helm")
	defer span.End()
	return g.resolver.ResolveHelm(ctx, r)
}
