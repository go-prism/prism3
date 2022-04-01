package refract

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
)

type BackedRefraction struct {
	mod *model.Refraction
	rf  *Refraction
}

func NewBackedRefraction(mod *model.Refraction, store storage.Reader, onCreate repo.CreateArtifactFunc, getPyPi, getHelm repo.GetPackageFunc) *BackedRefraction {
	remotes := make([]remote.Remote, len(mod.Remotes))
	for i := range mod.Remotes {
		remotes[i] = remote.NewBackedRemote(mod.Remotes[i], store, onCreate, getPyPi, getHelm)
	}
	return &BackedRefraction{
		mod: mod,
		rf:  NewSimple(mod.Name, remotes),
	}
}

func (b *BackedRefraction) Exists(ctx context.Context, path string) (string, error) {
	msg, err := b.rf.Exists(ctx, path)
	if err != nil {
		return "", err
	}
	return msg.URI, nil
}

func (b *BackedRefraction) Download(ctx context.Context, path string) (io.Reader, error) {
	return b.rf.Download(ctx, path)
}

func (b *BackedRefraction) Refraction() *Refraction {
	return b.rf
}
