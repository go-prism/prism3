package httpclient

import (
	"crypto/tls"
	"crypto/x509"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"golang.org/x/net/http/httpproxy"
	"net/http"
	"net/url"
	"os"
)

func GetConfigured(security *model.TransportSecurity) *http.Client {
	tlsConfig := getTLSConfig(security)
	proxy := getProxyConfig(security)

	transport := getTransport()
	transport.Proxy = func(r *http.Request) (*url.URL, error) {
		return proxy.ProxyFunc()(r.URL)
	}
	transport.TLSClientConfig = tlsConfig
	return &http.Client{
		Transport:     transport,
		CheckRedirect: http.DefaultClient.CheckRedirect,
		Timeout:       http.DefaultClient.Timeout,
	}
}

// getTransport returns a slightly modified version
// of http.DefaultTransport
func getTransport() *http.Transport {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConns = 100
	transport.MaxConnsPerHost = 100
	transport.MaxIdleConnsPerHost = 100
	transport.ForceAttemptHTTP2 = true

	return transport
}

// getProxyConfig returns a httpproxy.Config tuned
// based on the passed model.TransportSecurity
func getProxyConfig(s *model.TransportSecurity) *httpproxy.Config {
	if s == nil || s.HTTPProxy == "" && s.HTTPSProxy == "" {
		log.Info("importing proxy configuration from environment")
		return httpproxy.FromEnvironment()
	}
	return &httpproxy.Config{
		HTTPProxy:  s.HTTPProxy,
		HTTPSProxy: s.HTTPSProxy,
		NoProxy:    s.NoProxy,
		CGI:        os.Getenv("REQUEST_METHOD") != "",
	}
}

// getTLSConfig returns a tls.Config tuned
// based on the passed model.TransportSecurity
func getTLSConfig(s *model.TransportSecurity) *tls.Config {
	if s == nil {
		log.Warning("returning default TLS configuration")
		// return a minimal configuration
		return &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}
	caPool, err := x509.SystemCertPool()
	if err != nil {
		log.WithError(err).Error("failed to load system CA pool")
		caPool = x509.NewCertPool()
	}
	if s.Ca != "" {
		log.WithField("ok", caPool.AppendCertsFromPEM([]byte(s.Ca))).Debug("appending CA certificates")
	}
	var certs []tls.Certificate
	if s.Cert != "" && s.Key != "" {
		if cert, err := tls.X509KeyPair([]byte(s.Cert), []byte(s.Key)); err != nil {
			log.WithError(err).Error("failed to read x509 keypair")
		} else {
			log.Info("successfully read x509 keypair")
			certs = append(certs, cert)
		}
	} else {
		log.Debug("skipping x509 keypair since one or more required values were empty")
	}
	return &tls.Config{
		Certificates:       certs,
		RootCAs:            caPool,
		InsecureSkipVerify: s.SkipTLSVerify,
		MinVersion:         tls.VersionTLS12,
	}
}
