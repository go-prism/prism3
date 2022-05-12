package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"net/http"
)

type HelmRemote struct {
	getPackage repo.GetPackageFunc
	rem        *EphemeralRemote
}

func NewHelmRemote(ctx context.Context, root string, client *http.Client, getPackage repo.GetPackageFunc) *HelmRemote {
	return &HelmRemote{
		getPackage: getPackage,
		rem:        NewEphemeralRemote(ctx, root, client),
	}
}

func (h *HelmRemote) Exists(ctx context.Context, path string, _ *RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_helm_exists")
	defer span.End()
	return h.getPackage(ctx, path)
}

func (h *HelmRemote) Download(ctx context.Context, path string, rctx *RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_helm_download")
	defer span.End()
	return h.rem.Download(ctx, path, rctx)
}

func (h *HelmRemote) String() string {
	return ""
}
