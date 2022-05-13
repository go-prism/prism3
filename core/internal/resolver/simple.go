package resolver

import (
	"context"
	"errors"
	"github.com/bluele/gcache"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/impl/helmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/npmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/pypiapi"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"time"
)

func (r *Request) New(bucket, path string) {
	r.bucket = bucket
	r.path = path
}

func NewResolver(repos *repo.Repos, store storage.Reader, publicURL string) *Resolver {
	r := new(Resolver)
	r.repos = repos

	// caches
	r.cache = gcache.New(1000).ARC().Expiration(time.Minute * 5).LoaderFunc(r.getRefraction).Build()

	r.store = store

	// providers
	r.helm = helmapi.NewIndex(repos, publicURL)
	r.npm = npmapi.NewProvider(repos, publicURL)
	r.pypi = pypiapi.NewProvider(repos, publicURL)
	return r
}

func (r *Resolver) ResolveHelm(ctx context.Context, req *Request, _ *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "resolver_helm")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("helm")
	log.V(3).Info("handling Helm request", "Payload", req)
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.Error(err, "failed to retrieve requested refraction")
		return nil, err
	}
	refraction := ref.(*refract.BackedRefraction)
	return r.helm.Serve(ctx, refraction)
}

func (r *Resolver) Resolve(ctx context.Context, req *Request, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "resolver_generic")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("generic")
	log.V(3).Info("handling generic request", "Payload", req)
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.Error(err, "failed to retrieve requested refraction")
		return nil, err
	}
	return ref.(*refract.BackedRefraction).Download(ctx, req.path, rctx)
}

func (r *Resolver) getRefraction(v any) (any, error) {
	log := logr.FromContextOrDiscard(r.ctx)
	log.V(1).Info("building new refraction")
	name, ok := v.(string)
	if !ok {
		log.V(1).Info("unable to build refraction as input was not a string")
		return nil, errors.New("expected string")
	}
	log = log.WithValues("Name", name)
	log.V(1).Info("fetching refraction from database", name)
	ctx := logr.NewContext(context.TODO(), log)
	ref, err := r.repos.RefractRepo.GetRefractionByName(ctx, name)
	if err != nil {
		return nil, err
	}
	return refract.NewBackedRefraction(
		r.ctx,
		ref,
		r.store,
		r.repos.ArtifactRepo.CreateArtifact,
		r.repos.PyPackageRepo.GetPackage,
		r.repos.HelmPackageRepo.GetPackage,
	), nil
}
