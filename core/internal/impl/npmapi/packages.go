package npmapi

import (
	"context"
	"fmt"
	cache "github.com/Code-Hex/go-generics-cache"
	"github.com/Code-Hex/go-generics-cache/policy/lfu"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/refract"
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
		pkgCache:        cache.New(cache.AsLFU[string, string](lfu.WithCapacity(1000))),
		pkgVersionCache: cache.New(cache.AsLFU[string, string](lfu.WithCapacity(1000))),
	}
}

func (p *Provider) Package(ctx context.Context, ref *refract.Refraction, pkg string) (io.Reader, error) {
	log.WithContext(ctx).WithField("package", pkg).Info("retrieving NPM package manifest")
	// check the cache
	data, ok := p.pkgCache.Get(pkg)
	if ok {
		log.WithContext(ctx).WithField("package", pkg).Info("found NPM manifest in cache")
		return strings.NewReader(data), nil
	}
	p.fetch(ctx, ref, pkg)
	// fetch the package since we know it's in the cache
	data, err := p.repos.NPMPackageRepo.GetPackage(ctx, pkg)
	if err != nil {
		return nil, err
	}
	// we can only cache temporarily otherwise
	// we'll miss new versions
	p.pkgCache.Set(pkg, data, cache.WithExpiration(time.Minute*5))
	return strings.NewReader(data), nil
}

func (p *Provider) PackageVersion(ctx context.Context, ref *refract.Refraction, pkg, version string) (io.Reader, error) {
	log.WithContext(ctx).WithFields(log.Fields{
		"package": pkg,
		"version": version,
	}).Info("retrieving NPM package manifest")
	// check the cache
	key := filepath.Join(pkg, version)
	data, ok := p.pkgVersionCache.Get(key)
	if ok {
		log.WithContext(ctx).WithFields(log.Fields{
			"package": pkg,
			"version": version,
		}).Info("found NPM manifest in cache")
		return strings.NewReader(data), nil
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
	p.pkgVersionCache.Set(key, data)
	return strings.NewReader(data), nil
}

func (p *Provider) fetch(ctx context.Context, ref *refract.Refraction, pkg string) {
	// download the package
	remotes := ref.Remotes()
	roots := make([]string, len(remotes))

	wg := sync.WaitGroup{}
	log.WithContext(ctx).Infof("fetching NPM metadata for '%s' from %d remotes (%s)", pkg, len(remotes), ref)
	for i := range remotes {
		wg.Add(1)
		roots[i] = remotes[i].String()
		j := i
		// download the metadata
		go func() {
			defer wg.Done()
			resp, err := remotes[j].Download(ctx, fmt.Sprintf("/%s", pkg))
			if err != nil {
				return
			}
			body, err := io.ReadAll(resp)
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to read response")
				return
			}
			data := p.rewriteURLs(ctx, roots, ref.String(), string(body))
			_ = p.repos.NPMPackageRepo.Insert(ctx, pkg, data)
		}()
	}
	// wait for all responses
	wg.Wait()
}

func (p *Provider) rewriteURLs(_ context.Context, roots []string, ref, data string) string {
	rep := make([]string, len(roots)*2)
	for i := range roots {
		rep[i*2] = roots[i]
		rep[i*2+1] = fmt.Sprintf("%s/api/v1/%s/-", strings.TrimSuffix(p.publicURL, "/"), ref)
	}
	return strings.NewReplacer(rep...).Replace(data)
}
