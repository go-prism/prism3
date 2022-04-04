package v1

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"net/http"
	"path/filepath"
	"strings"
)

func (g *Gateway) ServeGo(w http.ResponseWriter, r *http.Request) {
	if g.goProxy == nil {
		http.NotFound(w, r)
		return
	}
	name := strings.TrimPrefix(r.URL.Path, "/api/go")
	r.URL.Path = name
	g.goProxy.ModifyResponse = func(response *http.Response) error {
		if response.StatusCode != http.StatusOK {
			return nil
		}
		n, v, ok := g.getMetadata(name)
		if !ok {
			return nil
		}
		log.WithContext(r.Context()).Debugf("name: %s, version: %s", n, v)
		go func() {
			_ = g.artifactRepo.CreateArtifact(context.TODO(), strings.TrimPrefix(name, "/"), db.GoRemote)
		}()
		return nil
	}
	g.goProxy.ServeHTTP(w, r)
}

func (*Gateway) getMetadata(name string) (string, string, bool) {
	path, version, ok := strings.Cut(name, "/@v/")
	if ok && strings.HasPrefix(version, "v") {
		version = strings.TrimSuffix(version, filepath.Ext(version))
		return strings.TrimPrefix(path, "/"), version, true
	}
	return "", "", false
}
