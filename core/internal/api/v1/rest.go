package v1

import (
	"github.com/gorilla/mux"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func (*Gateway) getPath(uri *url.URL) (string, bool) {
	paths := strings.SplitN(uri.Path, "/-/", 2)
	if len(paths) < 2 {
		return "", false
	}
	return paths[1], true
}

func (g *Gateway) ServeHTTPGeneric(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_generic_serve")
	defer span.End()
	bucket := mux.Vars(r)["bucket"]
	span.SetAttributes(attribute.String("bucket", bucket))
	path, ok := g.getPath(r.URL)
	if !ok {
		_ = problem.MustWrite(w, problem.New(http.StatusBadRequest).Errorf("malformed path"))
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)
	// serve
	reader, err := g.resolver.Resolve(ctx, req, GetRequestContext(ctx, r))
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServeHTTPHelm(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_helm_serve")
	defer span.End()
	bucket := mux.Vars(r)["bucket"]
	span.SetAttributes(attribute.String("bucket", bucket))
	path, ok := g.getPath(r.URL)
	if !ok {
		_ = problem.MustWrite(w, problem.New(http.StatusBadRequest).Errorf("malformed path"))
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)
	// serve
	reader, err := g.ServeHelm(ctx, req)
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServePyPi(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_pypi_serve")
	defer span.End()
	vars := mux.Vars(r)
	bucket, pkg := vars["bucket"], vars["package"]
	span.SetAttributes(
		attribute.String("bucket", bucket),
		attribute.String("package", pkg),
	)
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, pkg)
	defer g.pool.Put(req)
	// serve
	reader, err := g.resolver.ResolvePyPi(ctx, req, &schemas.RequestContext{})
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	w.Header().Set("Content-Type", "text/html")
	_, _ = io.Copy(w, reader)
}
