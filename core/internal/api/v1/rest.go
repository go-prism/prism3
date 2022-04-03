package v1

import (
	"github.com/gorilla/mux"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
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
	bucket := mux.Vars(r)["bucket"]
	path, ok := g.getPath(r.URL)
	if !ok {
		_ = problem.MustWrite(w, problem.New(http.StatusBadRequest).Errorf("malformed path"))
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)
	// serve
	reader, err := g.Serve(r.Context(), req)
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServeHTTPHelm(w http.ResponseWriter, r *http.Request) {
	bucket := mux.Vars(r)["bucket"]
	path, ok := g.getPath(r.URL)
	if !ok {
		_ = problem.MustWrite(w, problem.New(http.StatusBadRequest).Errorf("malformed path"))
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)
	// serve
	reader, err := g.ServeHelm(r.Context(), req)
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServePyPi(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket, pkg := vars["bucket"], vars["package"]
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, pkg)
	defer g.pool.Put(req)
	// serve
	reader, err := g.resolver.ResolvePyPi(r.Context(), req)
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	w.Header().Set("Content-Type", "text/html")
	_, _ = io.Copy(w, reader)
}
