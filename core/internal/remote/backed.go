package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"io"
)

type BackedRemote struct {
	rm       *model.Remote
	eph      *EphemeralRemote
	onCreate repo.CreateArtifactFunc
}

func NewBackedRemote(rm *model.Remote, onCreate repo.CreateArtifactFunc) *BackedRemote {
	return &BackedRemote{
		rm:       rm,
		eph:      NewEphemeralRemote(rm.URI),
		onCreate: onCreate,
	}
}

func (b *BackedRemote) Exists(ctx context.Context, path string) (string, error) {
	uri, err := b.eph.Exists(ctx, path)
	if err != nil {
		return "", err
	}
	_ = b.onCreate(ctx, path, b.rm.ID)
	return uri, nil
}

func (b *BackedRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	r, err := b.eph.Download(ctx, path)
	if err != nil {
		return nil, err
	}
	_ = b.onCreate(ctx, path, b.rm.ID)
	return r, nil
}
