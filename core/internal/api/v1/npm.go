package v1

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"net/http"
	"strings"
)

func (g *Gateway) RouteNPM(r *mux.Router) {
	r.HandleFunc("/{bucket}/{package}", g.ServeHTTPNPM).
		Methods(http.MethodGet)
	r.HandleFunc("/{bucket}/@{scope}/{package}", g.ServeHTTPNPM).
		Methods(http.MethodGet)
	r.HandleFunc("/{bucket}/{package}/{version}", g.ServeHTTPNPM).
		Methods(http.MethodGet)
	r.HandleFunc("/{bucket}/@{scope}/{package}/{version}", g.ServeHTTPNPM).
		Methods(http.MethodGet)
	// redirect tar requests to the generic
	// API
	r.HandleFunc("/{bucket}/{package}/-/{file}.tgz", g.RedirectNPM).
		Methods(http.MethodGet)
	r.HandleFunc("/{bucket}/@{scope}/{package}/-/{file}.tgz", g.RedirectNPM).
		Methods(http.MethodGet)
}

func (g *Gateway) RedirectNPM(w http.ResponseWriter, r *http.Request) {
	bucket := mux.Vars(r)["bucket"]
	path := strings.TrimPrefix(r.URL.Path, "/api/npm/")
	path = strings.TrimPrefix(path, bucket)
	path = strings.TrimSuffix(path, "/")
	uri := fmt.Sprintf("%s/api/v1/%s/-/%s", "", bucket, path)
	http.Redirect(w, r, uri, http.StatusFound)
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
		_ = problem.MustWrite(w, err)
		return
	}
	// copy the response back
	w.Header().Set("Content-Type", "application/json")
	_, _ = io.Copy(w, reader)
}
