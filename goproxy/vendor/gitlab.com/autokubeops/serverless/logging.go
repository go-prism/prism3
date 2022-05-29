package serverless

import (
	"github.com/felixge/httpsnoop"
	"github.com/go-logr/logr"
	"net/http"
)

func loggingMiddleware(log logr.Logger) func(handler http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.V(4).Info("starting http request", "Method", r.Method, "Path", r.URL.EscapedPath(), "RemoteAddr", r.RemoteAddr, "UserAgent", r.UserAgent())
			m := httpsnoop.CaptureMetrics(next, w, r)
			log.V(4).Info("completed http request", "Method", r.Method, "Path", r.URL.EscapedPath(), "RemoteAddr", r.RemoteAddr, "Status", m.Code, "UserAgent", r.UserAgent(), "Duration", m.Duration, "Size", m.Written)
		})
	}
}
