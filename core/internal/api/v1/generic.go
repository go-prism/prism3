package v1

import (
	"crypto/tls"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/quota"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"golang.org/x/net/http2"
	"net"
	"net/http/httputil"
	"net/url"
	"sync"
)

func NewGateway(r resolver.IResolver, goProxyURL *url.URL, artifactRepo *repo.ArtifactRepo, goNetObserver quota.Observer) *Gateway {
	var goProxy *httputil.ReverseProxy
	if goProxyURL != nil {
		goProxy = httputil.NewSingleHostReverseProxy(goProxyURL)
		goProxy.Transport = otelhttp.NewTransport(&http2.Transport{
			AllowHTTP: true,
			DialTLS: func(network, addr string, cfg *tls.Config) (net.Conn, error) {
				return net.Dial(network, addr)
			},
		})
	}
	return &Gateway{
		resolver: r,
		pool: &sync.Pool{
			New: func() any {
				return new(resolver.Request)
			},
		},
		npmPool: &sync.Pool{
			New: func() any {
				return new(resolver.NPMRequest)
			},
		},
		goProxy:       goProxy,
		artifactRepo:  artifactRepo,
		goNetObserver: goNetObserver,
	}
}
