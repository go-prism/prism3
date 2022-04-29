package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"io"
)

type Remote interface {
	String() string
	Exists(ctx context.Context, path string, rctx *RequestContext) (string, error)
	Download(ctx context.Context, path string, rctx *RequestContext) (io.Reader, error)
}

type RequestContext struct {
	httpclient.AuthOpts
}
