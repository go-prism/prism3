package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"io"
	"strings"
)

type PyPiRemote struct {
	getPackage repo.GetPackageFunc
	rem        *EphemeralRemote
}

func NewPyPiRemote(root string, getPackage repo.GetPackageFunc) *PyPiRemote {
	return &PyPiRemote{
		getPackage: getPackage,
		rem:        NewEphemeralRemote(root),
	}
}

func (p PyPiRemote) String() string {
	return ""
}

func (p PyPiRemote) Exists(ctx context.Context, path string) (string, error) {
	_, filename, ok := strings.Cut(path, "/")
	if ok {
		return p.getPackage(ctx, filename)
	}
	return p.getPackage(ctx, path)
}

func (p PyPiRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	return p.rem.Download(ctx, path)
}
