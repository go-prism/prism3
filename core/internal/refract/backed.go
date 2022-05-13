package refract

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
)

type BackedRefraction struct {
	mod *model.Refraction
	rf  *Refraction
}

func NewBackedRefraction(ctx context.Context, mod *model.Refraction, store storage.Reader, onCreate repo.CreateArtifactFunc, getPyPi, getHelm repo.GetPackageFunc) *BackedRefraction {
	remotes := make([]remote.Remote, len(mod.Remotes))
	for i := range mod.Remotes {
		remotes[i] = remote.NewBackedRemote(ctx, mod.Remotes[i], store, onCreate, getPyPi, getHelm)
	}
	return &BackedRefraction{
		mod: mod,
		rf:  NewSimple(ctx, mod.Name, remotes),
	}
}

func (b *BackedRefraction) Exists(ctx context.Context, path string, rctx *schemas.RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_backed_exists")
	defer span.End()
	msg, err := b.rf.Exists(ctx, path, rctx)
	if err != nil {
		return "", err
	}
	return msg.URI, nil
}

func (b *BackedRefraction) Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_backed_download")
	defer span.End()
	return b.rf.Download(ctx, path, rctx)
}

func (b *BackedRefraction) Refraction() *Refraction {
	return b.rf
}

func (b *BackedRefraction) Model() *model.Refraction {
	return b.mod
}
