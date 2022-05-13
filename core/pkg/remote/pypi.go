package remote

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"net/http"
	"strings"
)

type PyPiRemote struct {
	getPackage repo.GetPackageFunc
	rem        *EphemeralRemote
}

func NewPyPiRemote(ctx context.Context, root string, client *http.Client, getPackage repo.GetPackageFunc) *PyPiRemote {
	return &PyPiRemote{
		getPackage: getPackage,
		rem:        NewEphemeralRemote(ctx, root, client),
	}
}

func (p PyPiRemote) String() string {
	return ""
}

func (p PyPiRemote) Exists(ctx context.Context, path string, _ *schemas.RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_pypi_exists")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("pypi").WithValues("Path", path)
	_, filename, ok := strings.Cut(path, "/")
	if ok {
		log.V(1).Info("segmented path", "Filename", filename)
		return p.getPackage(ctx, filename)
	}
	return p.getPackage(ctx, path)
}

func (p PyPiRemote) Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_pypi_download")
	defer span.End()
	return p.rem.Download(ctx, path, rctx)
}
