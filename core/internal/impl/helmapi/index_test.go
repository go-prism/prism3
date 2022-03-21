package helmapi

import (
	"context"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"helm.sh/helm/v3/pkg/repo"
	"io"
	"sigs.k8s.io/yaml"
	"testing"
)

func TestIndex_Serve(t *testing.T) {
	var cases = []struct {
		name string
		ref  *refract.Refraction
		ok   bool
	}{
		{
			"no remotes",
			refract.NewSimple("helm-test", []remote.Remote{}),
			true,
		},
		{
			"single remote",
			refract.NewSimple("helm-test", []remote.Remote{
				remote.NewEphemeralRemote("https://charts.bitnami.com/bitnami"),
			}),
			true,
		},
		{
			"multi remote",
			refract.NewSimple("helm-test", []remote.Remote{
				remote.NewEphemeralRemote("https://charts.bitnami.com/bitnami"),
				remote.NewEphemeralRemote("https://charts.gitlab.io"),
			}),
			true,
		},
	}

	idx := new(Index)
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := idx.Serve(context.TODO(), tt.ref)
			assert.NoError(t, err)

			data, err := io.ReadAll(resp)
			assert.NoError(t, err)

			var file repo.IndexFile
			err = yaml.Unmarshal(data, &file)
			assert.NoError(t, err)
			t.Log(len(file.Entries))
			for _, v := range file.Entries {
				for _, vv := range v {
					t.Logf("%+v", vv.URLs)
				}
			}
		})
	}
}
