package resolver

import (
	"context"
	"errors"
	"github.com/bluele/gcache"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"io"
	"time"
)

func (r *Request) New(bucket, path string) {
	r.bucket = bucket
	r.path = path
}

func NewResolver(repos *repo.Repos) *Resolver {
	r := new(Resolver)
	r.repos = repos
	r.cache = gcache.New(1000).ARC().Expiration(time.Minute * 5).LoaderFunc(r.getRefraction).Build()
	return r
}

func (r *Resolver) Resolve(ctx context.Context, req *Request) (io.Reader, error) {
	// todo any middleware (e.g. helm)
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve requested refraction")
		return nil, err
	}
	refraction := refract.NewBackedRefraction(ref.(*model.Refraction), r.repos.ArtifactRepo.CreateArtifact)
	return refraction.Download(ctx, req.path)
}

func (r *Resolver) getRefraction(v interface{}) (interface{}, error) {
	name, ok := v.(string)
	if !ok {
		return nil, errors.New("expected string")
	}
	log.Infof("fetching remote from database: %s", name)
	return r.repos.RefractRepo.GetRefractionByName(context.TODO(), name)
}
