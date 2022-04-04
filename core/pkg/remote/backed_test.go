package remote

import (
	"context"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"testing"
)

func TestBackedRemote_Exists(t *testing.T) {
	var getPkg = func(ctx context.Context, file string) (string, error) {
		return "", nil
	}
	rem := NewBackedRemote(&model.Remote{
		URI:      "https://mirror.aarnet.edu.au/pub/alpine",
		Security: &model.RemoteSecurity{},
	}, storage.NewNoOp(), func(ctx context.Context, path, remote string) error {
		return nil
	}, getPkg, getPkg)
	uri, err := rem.Exists(context.TODO(), "v3.14/main/x86_64/APKINDEX.tar.gz")
	assert.NoError(t, err)
	assert.EqualValues(t, "https://mirror.aarnet.edu.au/pub/alpine/v3.14/main/x86_64/APKINDEX.tar.gz", uri)
}
