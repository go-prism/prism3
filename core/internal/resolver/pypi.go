package resolver

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
)

func (r *Resolver) ResolvePyPi(ctx context.Context, req *Request, _ *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "resolver_pypi")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("pypi")
	log.V(3).Info("handling PyPi request", "Payload", req)
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.Error(err, "failed to retrieve requested refraction")
		return nil, err
	}
	refraction := ref.(*refract.BackedRefraction)
	return r.pypi.Index(ctx, refraction.Refraction(), req.path)
}
