package resolver

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
)

func (r *NPMRequest) New(bucket, pkg, version string) {
	r.bucket = bucket
	r.pkg = pkg
	r.version = version
}

func (r *Resolver) ResolveNPM(ctx context.Context, req *NPMRequest) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "resolver_npm")
	defer span.End()
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve requested refraction")
		return nil, err
	}
	refraction := ref.(*refract.BackedRefraction)
	if req.version != "" {
		return r.npm.PackageVersion(ctx, refraction.Refraction(), req.pkg, req.version)
	}
	return r.npm.Package(ctx, refraction.Refraction(), req.pkg)
}
