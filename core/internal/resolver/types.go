package resolver

import (
	"context"
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/impl/helmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/npmapi"
	"gitlab.com/go-prism/prism3/core/internal/storage"
	"io"
)

type Resolver struct {
	repos *repo.Repos

	// caches
	cache gcache.Cache

	store storage.Reader
	// providers
	helm *helmapi.Index
	npm  *npmapi.Provider
}

type IResolver interface {
	Resolve(ctx context.Context, req *Request) (io.Reader, error)
	ResolveHelm(ctx context.Context, req *Request) (io.Reader, error)
	ResolveNPM(ctx context.Context, req *NPMRequest) (io.Reader, error)
}

type Request struct {
	bucket string
	path   string
}

type NPMRequest struct {
	bucket  string
	pkg     string
	version string
}
