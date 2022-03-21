package resolver

import (
	"context"
	"errors"
	"github.com/bluele/gcache"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/internal/storage"
	"io"
	"time"
)

func (r *Request) New(bucket, path string) {
	r.bucket = bucket
	r.path = path
}

func NewResolver(repos *repo.Repos, store storage.Reader) *Resolver {
	r := new(Resolver)
	r.repos = repos
	r.cache = gcache.New(1000).ARC().Expiration(time.Minute * 5).LoaderFunc(r.getRefraction).Build()
	r.store = store
	return r
}

func (r *Resolver) Resolve(ctx context.Context, req *Request) (io.Reader, error) {
	// todo any middleware (e.g. helm)
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve requested refraction")
		return nil, err
	}
	return ref.(*refract.BackedRefraction).Download(ctx, req.path)
}

func (r *Resolver) getRefraction(v interface{}) (interface{}, error) {
	name, ok := v.(string)
	if !ok {
		return nil, errors.New("expected string")
	}
	log.Infof("fetching remote from database: %s", name)
	ref, err := r.repos.RefractRepo.GetRefractionByName(context.TODO(), name)
	if err != nil {
		return nil, err
	}
	return refract.NewBackedRefraction(ref, r.store, r.repos.ArtifactRepo.CreateArtifact), nil
}
