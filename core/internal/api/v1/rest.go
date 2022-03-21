package v1

import (
	"github.com/gorilla/mux"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"io"
	"net/http"
	"strings"
)

func (g *Gateway) ServeHTTPGeneric(w http.ResponseWriter, r *http.Request) {
	bucket := mux.Vars(r)["bucket"]
	path := strings.SplitN(r.URL.Path, "/-/", 2)[1]
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
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
