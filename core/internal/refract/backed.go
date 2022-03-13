package refract

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"io"
)

type BackedRefraction struct {
	mod *model.Refraction
	rf  *Refraction
}

func NewBackedRefraction(mod *model.Refraction) *BackedRefraction {
	remotes := make([]remote.Remote, len(mod.Remotes))
	for i := range mod.Remotes {
		remotes[i] = remote.NewBackedRemote(mod.Remotes[i])
	}
	return &BackedRefraction{
		mod: mod,
		rf:  NewSimple(mod.Name, remotes),
	}
}

func (b *BackedRefraction) Exists(ctx context.Context, path string) (string, error) {
	return b.rf.Exists(ctx, path)
}

func (b *BackedRefraction) Download(ctx context.Context, path string) (io.Reader, error) {
	return b.rf.Download(ctx, path)
}
