package httpclient

import (
	"crypto/tls"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"testing"
)

func TestGetProxyConfig(t *testing.T) {
	t.Run("nil value", func(t *testing.T) {
		c := getProxyConfig(nil)
		assert.NotNil(t, c)
	})
	t.Run("single value", func(t *testing.T) {
		c := getProxyConfig(&model.TransportSecurity{HTTPProxy: "http://localhost:8080"})
		assert.EqualValues(t, "http://localhost:8080", c.HTTPProxy)
	})
}

func TestGetTLSConfig(t *testing.T) {
	t.Run("nil value", func(t *testing.T) {
		c := getTLSConfig(nil)
		assert.NotNil(t, c)
		assert.EqualValues(t, tls.VersionTLS12, c.MinVersion)
	})
}
