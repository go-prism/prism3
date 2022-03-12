package resolver

import (
	"context"
	"errors"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"io"
)

func (r *Request) New(bucket, path string) {
	r.bucket = bucket
	r.path = path
}

func NewResolver() *Resolver {
	return &Resolver{
		refractions: []*refract.Refraction{
			refract.NewSimple("alpine", []remote.Remote{
				remote.NewEphemeralRemote("https://mirror.aarnet.edu.au/pub/alpine"),
				remote.NewEphemeralRemote("https://alpine.global.ssl.fastly.net/alpine"),
				remote.NewEphemeralRemote("https://dl-4.alpinelinux.org/alpine"),
			}),
		},
	}
}

func (r *Resolver) Resolve(ctx context.Context, req *Request) (io.Reader, error) {
	// todo any middleware (e.g. helm)
	ref, ok := r.getRefraction(req.bucket)
	if !ok {
		return nil, errors.New("refraction not found")
	}
	return ref.Download(ctx, req.path)
}

func (r *Resolver) getRefraction(name string) (*refract.Refraction, bool) {
	for _, ref := range r.refractions {
		if ref.String() == name {
			return ref, true
		}
	}
	return nil, false
}
