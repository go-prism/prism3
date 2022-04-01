package v1

import (
	"net/http"
	"strings"
)

func (g *Gateway) ServeGo(w http.ResponseWriter, r *http.Request) {
	if g.goProxy == nil {
		http.NotFound(w, r)
		return
	}
	r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/go")
	g.goProxy.ServeHTTP(w, r)
}
