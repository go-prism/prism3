package v1

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"sync"
)

func NewGateway(r resolver.Resolver) *Gateway {
	return &Gateway{
		resolver: r,
		pool: sync.Pool{
			New: func() interface{} {
				return new(Request)
			},
		},
	}
}

func (r *Request) New(bucket, path string) {
	r.bucket = bucket
	r.path = path
}

func (g *Gateway) Serve(ctx context.Context, r *Request) (io.Reader, error) {
	// figure out what file we want
	// 		run through middleware (e.g. helm)
	uri, err := g.resolver.GetURI(ctx, r.bucket, r.path)
	if err != nil {
		return nil, err
	}

	// get the file
	return g.resolver.GetFile(ctx, uri)
}
