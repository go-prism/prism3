package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"io"
)

type Remote interface {
	String() string
	Exists(ctx context.Context, path string, rctx *schemas.RequestContext) (string, error)
	Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error)
}
