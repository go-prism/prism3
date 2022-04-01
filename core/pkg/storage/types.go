package storage

import (
	"context"
	"io"
)

type BucketSize struct {
	Count int64
	Bytes int64
}

type Reader interface {
	Get(ctx context.Context, path string) (io.Reader, error)
	Put(ctx context.Context, path string, r io.Reader) error
	Head(ctx context.Context, path string) (bool, error)
	Size(ctx context.Context, path string) (*BucketSize, error)
}
