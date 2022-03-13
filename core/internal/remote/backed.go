package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"io"
)

type BackedRemote struct {
	rm  *model.Remote
	eph *EphemeralRemote
}

func NewBackedRemote(rm *model.Remote) *BackedRemote {
	return &BackedRemote{
		rm:  rm,
		eph: NewEphemeralRemote(rm.URI),
	}
}

func (b *BackedRemote) Exists(ctx context.Context, path string) (string, error) {
	return b.eph.Exists(ctx, path)
}

func (b *BackedRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	return b.eph.Download(ctx, path)
}
