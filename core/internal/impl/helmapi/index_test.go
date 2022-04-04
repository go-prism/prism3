package helmapi

import (
	"context"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	remote2 "gitlab.com/go-prism/prism3/core/pkg/remote"
	"testing"
)

func TestIndex_Serve(t *testing.T) {
	log.SetLevel(log.DebugLevel)
	var cases = []struct {
		name string
		ref  *refract.Refraction
		ok   bool
	}{
		{
			"no remotes",
			refract.NewSimple("helm-test", []remote2.Remote{}),
			false, // should this be an error?
		},
		{
			"single remote",
			refract.NewSimple("helm-test", []remote2.Remote{
				remote2.NewEphemeralRemote("https://av1o.gitlab.io/charts"),
			}),
			true,
		},
		{
			"multi remote",
			refract.NewSimple("helm-test", []remote2.Remote{
				remote2.NewEphemeralRemote("https://charts.bitnami.com/bitnami"),
				remote2.NewEphemeralRemote("https://charts.gitlab.io"),
			}),
			true,
		},
		{
			"invalid remote",
			refract.NewSimple("helm-test", []remote2.Remote{
				remote2.NewEphemeralRemote("https://gitlab.dcas.dev"),
			}),
			false,
		},
	}

	idx := new(Index)
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			_, err := idx.Serve(context.TODO(), tt.ref)
			if !tt.ok {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
		})
	}
}
