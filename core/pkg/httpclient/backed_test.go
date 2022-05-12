package httpclient

import (
	"context"
	"crypto/tls"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"testing"
)

func TestGetProxyConfig(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.New(t))
	t.Run("nil value", func(t *testing.T) {
		c := getProxyConfig(ctx, nil)
		assert.NotNil(t, c)
	})
	t.Run("single value", func(t *testing.T) {
		c := getProxyConfig(ctx, &model.TransportSecurity{HTTPProxy: "http://localhost:8080"})
		assert.EqualValues(t, "http://localhost:8080", c.HTTPProxy)
	})
}

func TestGetTLSConfig(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.New(t))
	t.Run("nil value", func(t *testing.T) {
		c := getTLSConfig(ctx, nil)
		assert.NotNil(t, c)
		assert.EqualValues(t, tls.VersionTLS12, c.MinVersion)
	})
}
