package npmapi

import (
	"context"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/jellydator/ttlcache/v3"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"io"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

func NewProvider(repos *repo.Repos, publicURL string) *Provider {
	return &Provider{
		publicURL:       publicURL,
		repos:           repos,
		pkgCache:        ttlcache.New[string, string](ttlcache.WithCapacity[string, string](1000), ttlcache.WithTTL[string, string](time.Minute*5)),
		pkgVersionCache: ttlcache.New[string, string](ttlcache.WithCapacity[string, string](1000)),
	}
}

func (p *Provider) Package(ctx context.Context, ref *refract.Refraction, pkg string) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "api_npm_package", trace.WithAttributes(
		attribute.String("package", pkg),
		attribute.String("refraction", ref.String()),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("npm").WithValues("Package", pkg, "Refraction", ref.String())
	log.Info("retrieving NPM package manifest")
	// check the cache
	item := p.pkgCache.Get(pkg)
	if item != nil {
		log.Info("found NPM manifest in cache")
		return strings.NewReader(item.Value()), nil
	}
	p.fetch(ctx, ref, pkg)
	// fetch the package since we know it's in the cache
	data, err := p.repos.NPMPackageRepo.GetPackage(ctx, pkg)
	if err != nil {
		return nil, err
	}
	// we can only cache temporarily otherwise
	// we'll miss new versions
	p.pkgCache.Set(pkg, data, ttlcache.DefaultTTL)
	return strings.NewReader(data), nil
}

func (p *Provider) PackageVersion(ctx context.Context, ref *refract.Refraction, pkg, version string) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "api_npm_packageVersion", trace.WithAttributes(
		attribute.String("package", pkg),
		attribute.String("version", version),
		attribute.String("refraction", ref.String()),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("npm").WithValues("Package", pkg, "Version", version, "Refraction", ref.String())
	log.Info("retrieving NPM package manifest")
	// check the cache
	key := filepath.Join(pkg, version)
	item := p.pkgVersionCache.Get(key)
	if item != nil {
		log.Info("found NPM manifest in cache")
		return strings.NewReader(item.Value()), nil
	}
	// check the database
	data, err := p.repos.NPMPackageRepo.GetPackageVersion(ctx, pkg, version)
	if err == nil {
		return strings.NewReader(data), nil
	}
	p.fetch(ctx, ref, pkg)
	// fetch the package since we know it's in the cache
	data, err = p.repos.NPMPackageRepo.GetPackageVersion(ctx, pkg, version)
	if err != nil {
		return nil, err
	}
	p.pkgVersionCache.Set(key, data, ttlcache.DefaultTTL)
	return strings.NewReader(data), nil
}

func (p *Provider) fetch(ctx context.Context, ref *refract.Refraction, pkg string) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "api_npm_fetch", trace.WithAttributes(
		attribute.String("package", pkg),
		attribute.String("refraction", ref.String()),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("npm").WithValues("Package", pkg, "Refraction", ref.String())
	// download the package
	remotes := ref.Remotes()
	roots := make([]string, len(remotes))

	wg := sync.WaitGroup{}
	log.Info("fetching NPM metadata from remotes", "Count", len(remotes))
	for i := range remotes {
		wg.Add(1)
		roots[i] = remotes[i].String()
		j := i
		// download the metadata
		go func() {
			defer wg.Done()
			// todo support requestcontext
			resp, err := remotes[j].Download(ctx, fmt.Sprintf("/%s", pkg), &remote.RequestContext{})
			if err != nil {
				return
			}
			body, err := io.ReadAll(resp)
			if err != nil {
				log.Error(err, "failed to read response")
				return
			}
			data := p.rewriteURLs(ctx, roots, ref.String(), string(body))
			_ = p.repos.NPMPackageRepo.Insert(ctx, pkg, data)
		}()
	}
	// wait for all responses
	wg.Wait()
}

func (p *Provider) rewriteURLs(ctx context.Context, roots []string, ref, data string) string {
	_, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "api_npm_rewriteURLs", trace.WithAttributes(
		attribute.String("refraction", ref),
	))
	defer span.End()
	rep := make([]string, len(roots)*2)
	for i := range roots {
		rep[i*2] = roots[i]
		rep[i*2+1] = fmt.Sprintf("%s/api/v1/%s/-", strings.TrimSuffix(p.publicURL, "/"), ref)
	}
	return strings.NewReplacer(rep...).Replace(data)
}
