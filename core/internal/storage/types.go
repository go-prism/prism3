package storage

import (
	"context"
	"io"
)

type Reader interface {
	Get(ctx context.Context, path string) (io.Reader, error)
	Head(ctx context.Context, path string) (bool, error)
}
