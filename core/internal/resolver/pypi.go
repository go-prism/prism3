package resolver

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"io"
)

func (r *Resolver) ResolvePyPi(ctx context.Context, req *Request) (io.Reader, error) {
	ref, err := r.cache.Get(req.bucket)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve requested refraction")
		return nil, err
	}
	refraction := ref.(*refract.BackedRefraction)
	return r.pypi.Index(ctx, refraction.Refraction(), req.path)
}
