package graph

import (
	"context"
	"github.com/bluele/gcache"
	"github.com/djcass44/go-utils/pkg/sliceutils"
	"github.com/hibiken/asynq"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/permissions"
	"gitlab.com/go-prism/prism3/core/pkg/db/notify"
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
	repos    *repo.Repos
	store    storage.Reader
	authz    *permissions.Manager
	notifier *notify.Notifier

	client *asynq.Client

	// caches
	storeSizeCache gcache.Cache
}

func NewResolver(repos *repo.Repos, store storage.Reader, client *asynq.Client, notifier *notify.Notifier) *Resolver {
	r := &Resolver{
		repos:    repos,
		store:    store,
		authz:    permissions.NewManager(repos),
		notifier: notifier,
		client:   client,
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

func (r *Resolver) stream(ctx context.Context, tables []string, f func(msg *notify.Message)) {
	l := make(chan *notify.Message)
	r.notifier.AddListener(ctx, l)
	// get data straight away
	f(nil)
	go func() {
		for {
			select {
			case <-ctx.Done():
				// stop listening if the client
				// has disconnected
				r.notifier.RemoveListener(ctx, l)
				return
			case msg := <-l:
				// skip unrelated tables
				if !sliceutils.Includes(tables, msg.Table) {
					continue
				}
				log.WithContext(ctx).Debugf("received message: %+v", msg)
				f(msg)
			}
		}
	}()
}
