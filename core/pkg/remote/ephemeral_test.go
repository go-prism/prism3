package remote

import (
	"context"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestEphemeralRemote_Exists(t *testing.T) {
	rem := NewEphemeralRemote("https://mirror.aarnet.edu.au/pub/alpine", nil)
	uri, err := rem.Exists(context.TODO(), "v3.14/main/x86_64/APKINDEX.tar.gz", &RequestContext{})
	assert.NoError(t, err)
	assert.EqualValues(t, "https://mirror.aarnet.edu.au/pub/alpine/v3.14/main/x86_64/APKINDEX.tar.gz", uri)
}

func TestEphemeralRemote_Do(t *testing.T) {
	log.SetLevel(log.DebugLevel)
	token := "hunter2"
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" {
			w.Header().Set("WWW-Authenticate", "Basic")
			http.Error(w, "Unauthorised.", http.StatusUnauthorized)
			return
		}
		if auth != token {
			http.Error(w, "Forbidden.", http.StatusForbidden)
			return
		}
		_, _ = w.Write([]byte("OK"))
	}))
	defer ts.Close()

	rem := NewEphemeralRemote(ts.URL, ts.Client())
	t.Run("valid token", func(t *testing.T) {
		_, err := rem.Download(context.TODO(), "", &RequestContext{
			httpclient.AuthOpts{
				Mode:   httpclient.AuthAuthorization,
				Header: "Authorization",
				Token:  token,
			},
		})
		assert.NoError(t, err)
	})
	t.Run("missing token", func(t *testing.T) {
		_, err := rem.Download(context.TODO(), "", nil)
		assert.Error(t, err)
	})
}
