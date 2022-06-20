/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package httpclient

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"golang.org/x/net/http/httpproxy"
	"golang.org/x/net/http2"
	"net/http"
	"net/url"
	"os"
)

func GetConfigured(ctx context.Context, security *model.TransportSecurity) *http.Client {
	log := logr.FromContextOrDiscard(ctx)
	tlsConfig := getTLSConfig(ctx, security)
	proxy := getProxyConfig(ctx, security)

	transport := getTransport(ctx)
	transport.Proxy = func(r *http.Request) (*url.URL, error) {
		return proxy.ProxyFunc()(r.URL)
	}
	transport.TLSClientConfig = tlsConfig
	log.V(6).Info("generated transport", "Transport", transport)
	return &http.Client{
		// inject OpenTelemetry
		Transport:     otelhttp.NewTransport(transport),
		CheckRedirect: http.DefaultClient.CheckRedirect,
		Timeout:       http.DefaultClient.Timeout,
	}
}

// getTransport returns a slightly modified version
// of http.DefaultTransport
func getTransport(ctx context.Context) *http.Transport {
	log := logr.FromContextOrDiscard(ctx)
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConns = 100
	transport.MaxConnsPerHost = 100
	transport.MaxIdleConnsPerHost = 100
	transport.ForceAttemptHTTP2 = true

	// ensure that http2 is enabled
	if err := http2.ConfigureTransport(transport); err != nil {
		log.V(2).Error(err, "failed to configure http/2 transport")
	}

	return transport
}

// getProxyConfig returns a httpproxy.Config tuned
// based on the passed model.TransportSecurity
func getProxyConfig(ctx context.Context, s *model.TransportSecurity) *httpproxy.Config {
	log := logr.FromContextOrDiscard(ctx)
	log.V(3).Info("generating proxy configuration from model", "Model", s)
	if s == nil || s.HTTPProxy == "" && s.HTTPSProxy == "" {
		log.V(1).Info("importing proxy configuration from environment")
		return httpproxy.FromEnvironment()
	}
	log.V(1).Info("building proxy configuration from model")
	return &httpproxy.Config{
		HTTPProxy:  s.HTTPProxy,
		HTTPSProxy: s.HTTPSProxy,
		NoProxy:    s.NoProxy,
		CGI:        os.Getenv("REQUEST_METHOD") != "",
	}
}

// getTLSConfig returns a tls.Config tuned
// based on the passed model.TransportSecurity
func getTLSConfig(ctx context.Context, s *model.TransportSecurity) *tls.Config {
	log := logr.FromContextOrDiscard(ctx)
	if s == nil {
		log.Info("returning default TLS configuration")
		// return a minimal configuration
		return &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}
	caPool, err := x509.SystemCertPool()
	if err != nil {
		log.Error(err, "failed to load system CA pool")
		caPool = x509.NewCertPool()
	}
	if s.Ca != "" {
		log.V(1).Info("appending CA certificates", "Ok", caPool.AppendCertsFromPEM([]byte(s.Ca)))
	}
	var certs []tls.Certificate
	if s.Cert != "" && s.Key != "" {
		log.V(1).Info("loading x509 keypair")
		if cert, err := tls.X509KeyPair([]byte(s.Cert), []byte(s.Key)); err != nil {
			log.Error(err, "failed to read x509 keypair")
		} else {
			log.Info("successfully read x509 keypair")
			certs = append(certs, cert)
		}
	} else {
		log.V(1).Info("skipping x509 keypair since one or more required values were empty")
	}
	return &tls.Config{
		Certificates:       certs,
		RootCAs:            caPool,
		InsecureSkipVerify: s.SkipTLSVerify,
		MinVersion:         tls.VersionTLS12,
	}
}
