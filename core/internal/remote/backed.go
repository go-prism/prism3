package remote

import (
	"context"
	"errors"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/internal/policy"
	"io"
)

type BackedRemote struct {
	rm       *model.Remote
	eph      *EphemeralRemote
	onCreate repo.CreateArtifactFunc
	pol      policy.Enforcer
}

func NewBackedRemote(rm *model.Remote, onCreate repo.CreateArtifactFunc) *BackedRemote {
	return &BackedRemote{
		rm:       rm,
		eph:      NewEphemeralRemote(rm.URI),
		onCreate: onCreate,
		pol:      policy.NewRegexEnforcer(rm),
	}
}

func (b *BackedRemote) Exists(ctx context.Context, path string) (string, error) {
	// check that this remote is allowed to receive the file
	if !b.pol.CanReceive(ctx, path) {
		return "", errors.New("blocked by policy")
	}
	uri, err := b.eph.Exists(ctx, path)
	if err != nil {
		return "", err
	}
	// check that this remote is allowed to cache the file
	if b.pol.CanCache(ctx, path) {
		_ = b.onCreate(ctx, path, b.rm.ID)
	}
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
