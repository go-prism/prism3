package remote

import (
	"context"
	_ "embed"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

var getPkg = func(ctx context.Context, file string) (string, error) {
	return "", nil
}

func TestBackedRemote_Exists(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.New(t))
	rem := NewBackedRemote(ctx, &model.Remote{
		URI:      "https://mirror.aarnet.edu.au/pub/alpine",
		Security: &model.RemoteSecurity{},
	}, storage.NewNoOp(), func(ctx context.Context, path, remote string) error {
		return nil
	}, getPkg, getPkg)
	uri, err := rem.Exists(ctx, "v3.14/main/x86_64/APKINDEX.tar.gz", &schemas.RequestContext{})
	assert.NoError(t, err)
	assert.EqualValues(t, "https://mirror.aarnet.edu.au/pub/alpine/v3.14/main/x86_64/APKINDEX.tar.gz", uri)
}

//go:embed testdata/file.txt
var dummyFile string

func TestBackedRemote_Download(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.New(t))
	token := "hunter2"
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth != token {
			http.Error(w, "Forbidden.", http.StatusForbidden)
			return
		}
		_, _ = w.Write([]byte(dummyFile))
	}))
	defer ts.Close()

	store := storage.NewNoOp()
	rem := NewBackedRemote(ctx, &model.Remote{
		URI:       ts.URL,
		Security:  &model.RemoteSecurity{},
		Archetype: model.ArchetypeGeneric,
	}, store, func(ctx context.Context, path, remote string) error {
		return nil
	}, getPkg, getPkg)

	// download
	resp, err := rem.Download(ctx, "/file.txt", &schemas.RequestContext{
		PartitionID: "",
		AuthOpts: httpclient.AuthOpts{
			Mode:  httpclient.AuthAuthorization,
			Token: token,
		},
	})
	assert.NoError(t, err)
	data, err := io.ReadAll(resp)
	assert.NoError(t, err)
	assert.EqualValues(t, dummyFile, string(data))

	// download again
	resp, err = rem.Download(ctx, "/file.txt", &schemas.RequestContext{
		PartitionID: "",
		AuthOpts: httpclient.AuthOpts{
			Mode:  httpclient.AuthAuthorization,
			Token: token,
		},
	})
	assert.NoError(t, err)
	data, err = io.ReadAll(resp)
	assert.NoError(t, err)
	assert.EqualValues(t, dummyFile, string(data))
}
