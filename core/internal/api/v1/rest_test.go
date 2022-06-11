package v1

import (
	"context"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"io"
	"net/http"
	"strings"
	"testing"
)

type testResolver struct{}

func (t *testResolver) Resolve(context.Context, *resolver.Request, *schemas.RequestContext) (io.Reader, error) {
	return strings.NewReader("Resolve"), nil
}

func (t *testResolver) ResolveHelm(context.Context, *resolver.Request, *schemas.RequestContext) (io.Reader, error) {
	return strings.NewReader("ResolveHelm"), nil
}

func (t *testResolver) ResolveNPM(context.Context, *resolver.NPMRequest, *schemas.RequestContext) (io.Reader, error) {
	return strings.NewReader("ResolveNPM"), nil
}

func (*testResolver) ResolvePyPi(context.Context, *resolver.Request, *schemas.RequestContext) (io.Reader, error) {
	return strings.NewReader("ResolvePyPi"), nil
}

func TestGateway_ServeHTTP(t *testing.T) {
	var cases = []struct {
		target string
	}{
		{
			"https://prism.devel/api/v1/alpine/-/v3.14/main/x86_64/APKINDEX.tar.gz",
		},
	}
	g := NewGateway(&testResolver{}, nil, nil, nil)

	for _, tt := range cases {
		t.Run(tt.target, func(t *testing.T) {
			assert.HTTPSuccess(t, g.ServeHTTPGeneric, http.MethodGet, tt.target, nil)
		})
	}
}
