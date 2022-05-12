package v1

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"net/http"
	"path/filepath"
	"strings"
)

func (g *Gateway) ServeGo(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_go")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("go")
	if g.goProxy == nil {
		log.V(1).Info("goproxy is disabled, skipping request")
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
		log.V(1).Info("extracted Go metadata", "Name", n, "Version", v)
		go func() {
			_ = g.artifactRepo.CreateArtifact(context.TODO(), strings.TrimPrefix(name, "/"), db.GoRemote)
		}()
		return nil
	}
	g.goProxy.ServeHTTP(w, r.WithContext(ctx))
}

func (*Gateway) getMetadata(name string) (string, string, bool) {
	path, version, ok := strings.Cut(name, "/@v/")
	if ok && strings.HasPrefix(version, "v") {
		version = strings.TrimSuffix(version, filepath.Ext(version))
		return strings.TrimPrefix(path, "/"), version, true
	}
	return "", "", false
}
