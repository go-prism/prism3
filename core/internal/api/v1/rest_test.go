package v1

import (
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/internal/storage"
	"net/http"
	"testing"
)

func TestGateway_ServeHTTP(t *testing.T) {
	var cases = []struct {
		target string
	}{
		{
			"https://prism.devel/api/v1/alpine/-/v3.14/main/x86_64/APKINDEX.tar.gz",
		},
	}
	g := NewGateway(resolver.NewResolver(nil, storage.NewNoOp()))

	for _, tt := range cases {
		t.Run(tt.target, func(t *testing.T) {
			assert.HTTPSuccess(t, g.ServeHTTP, http.MethodGet, tt.target, nil)
		})
	}
}
