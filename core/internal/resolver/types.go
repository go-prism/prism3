package resolver

import (
	"context"
	"io"
)

type Resolver interface {
	GetURI(ctx context.Context, bucket, path string) (string, error)
	GetFile(ctx context.Context, uri string) (io.Reader, error)
}
