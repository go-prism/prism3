package refract

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	repo2 "gitlab.com/go-prism/prism3/core/pkg/db/repo"
	remote2 "gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
)

type BackedRefraction struct {
	mod *model.Refraction
	rf  *Refraction
}

func NewBackedRefraction(mod *model.Refraction, store storage.Reader, onCreate repo2.CreateArtifactFunc, getPyPi, getHelm repo2.GetPackageFunc) *BackedRefraction {
	remotes := make([]remote2.Remote, len(mod.Remotes))
	for i := range mod.Remotes {
		remotes[i] = remote2.NewBackedRemote(mod.Remotes[i], store, onCreate, getPyPi, getHelm)
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

func (b *BackedRefraction) Model() *model.Refraction {
	return b.mod
}
