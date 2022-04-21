package remote

import (
	"context"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"io"
	"net/http"
)

type HelmRemote struct {
	getPackage repo.GetPackageFunc
	rem        *EphemeralRemote
}

func NewHelmRemote(root string, client *http.Client, getPackage repo.GetPackageFunc) *HelmRemote {
	return &HelmRemote{
		getPackage: getPackage,
		rem:        NewEphemeralRemote(root, client),
	}
}

func (h *HelmRemote) Exists(ctx context.Context, path string) (string, error) {
	return h.getPackage(ctx, path)
}

func (h *HelmRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	return h.rem.Download(ctx, path)
}

func (h *HelmRemote) String() string {
	return ""
}
