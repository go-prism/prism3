package graph

import (
	"context"
	"github.com/bluele/gcache"
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/core/internal/permissions"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"time"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var uptime time.Time

func init() {
	uptime = time.Now()
}

type Resolver struct {
	repos *repo.Repos
	store storage.Reader
	authz *permissions.Manager

	client *asynq.Client

	// caches
	storeSizeCache gcache.Cache
}

func NewResolver(repos *repo.Repos, store storage.Reader, client *asynq.Client) *Resolver {
	r := &Resolver{
		repos:  repos,
		store:  store,
		authz:  permissions.NewManager(repos),
		client: client,
	}
	_ = r.authz.Load(context.TODO())
	r.storeSizeCache = gcache.New(10).ARC().LoaderFunc(r.getStoreSize).Expiration(time.Minute * 5).Build()
	return r
}

// getStoreSize is the cache loader function used to
// fetch the current size of the S3 bucket.
//
// Since it is an expensive call, it needs
// to be cached aggressively
func (r *Resolver) getStoreSize(any) (any, error) {
	resp, err := r.store.Size(context.TODO(), "/")
	if err != nil {
		return nil, err
	}
	return resp, nil
}
