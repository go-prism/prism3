package v1

import (
	"fmt"
	"github.com/gorilla/mux"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"net/http"
	"strings"
)

func (g *Gateway) ServeHTTPGeneric(w http.ResponseWriter, r *http.Request) {
	bucket := mux.Vars(r)["bucket"]
	paths := strings.SplitN(r.URL.Path, "/-/", 2)
	if len(paths) < 2 {
		http.Error(w, "missing path", http.StatusBadRequest)
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, paths[1])
	defer g.pool.Put(req)
	// serve
	reader, err := g.Serve(r.Context(), req)
	if err != nil {
		// todo figure out the code and appropriate message
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServeHTTPHelm(w http.ResponseWriter, r *http.Request) {
	bucket := mux.Vars(r)["bucket"]
	path := strings.SplitN(r.URL.Path, "/-/", 2)[1]
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)
	// serve
	reader, err := g.ServeHelm(r.Context(), req)
	if err != nil {
		// todo figure out the code and appropriate message
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// copy the response back
	_, _ = io.Copy(w, reader)
}

func (g *Gateway) ServeHTTPNPM(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket, scope, pkg, version := vars["bucket"], vars["scope"], vars["package"], vars["version"]
	// re-assembled scoped packages
	if scope != "" {
		pkg = fmt.Sprintf("@%s/%s", scope, pkg)
	}
	req := g.npmPool.Get().(*resolver.NPMRequest)
	req.New(bucket, pkg, version)
	defer g.npmPool.Put(req)
	// serve
	reader, err := g.resolver.ResolveNPM(r.Context(), req)
	if err != nil {
		// todo figure out the code and appropriate message
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// copy the response back
	w.Header().Set("Content-Type", "application/json")
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
		// todo figure out the code and appropriate message
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// copy the response back
	w.Header().Set("Content-Type", "text/html")
	_, _ = io.Copy(w, reader)
}
