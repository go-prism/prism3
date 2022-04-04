package remote

import (
	"context"
	"io"
)

type Remote interface {
	String() string
	Exists(ctx context.Context, path string) (string, error)
	Download(ctx context.Context, path string) (io.Reader, error)
}
