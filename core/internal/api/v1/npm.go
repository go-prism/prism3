/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package v1

import (
	"fmt"
	"github.com/go-logr/logr"
	"github.com/gorilla/mux"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/internal/resolver"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
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
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_npm_redirect")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("npm")
	bucket := mux.Vars(r)["bucket"]
	path := strings.TrimPrefix(r.URL.Path, "/api/npm/")
	path = strings.TrimPrefix(path, bucket)
	path = strings.TrimSuffix(path, "/")
	uri := fmt.Sprintf("%s/api/v1/%s/-/%s", "", bucket, path)
	span.SetAttributes(
		attribute.String("bucket", bucket),
		attribute.String("redirect_uri", uri),
	)
	log.V(1).Info("issuing NPM redirect", "Bucket", bucket, "Url", uri)
	http.Redirect(w, r.WithContext(ctx), uri, http.StatusFound)
}

func (g *Gateway) ServeHTTPNPM(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_npm_serve")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("npm")
	vars := mux.Vars(r)
	bucket, scope, pkg, version := vars["bucket"], vars["scope"], vars["package"], vars["version"]
	// re-assembled scoped packages
	if scope != "" {
		log.V(1).Info("handling NPM scoped request", "Scope", scope)
		pkg = fmt.Sprintf("@%s/%s", scope, pkg)
	}
	attributes := []attribute.KeyValue{
		attribute.String("bucket", bucket),
		attribute.String("package", pkg),
		attribute.String("scope", scope),
		attribute.String("version", version),
		attribute.String("type", "npm"),
	}
	span.SetAttributes(attributes...)
	req := g.npmPool.Get().(*resolver.NPMRequest)
	req.New(bucket, pkg, version)
	defer g.npmPool.Put(req)

	// collect metrics
	metricCount.Add(ctx, 1, attributes...)

	// serve
	reader, err := g.resolver.ResolveNPM(ctx, req, &schemas.RequestContext{})
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}

	metricCountResolved.Add(ctx, 1, attributes...)

	// copy the response back
	w.Header().Set("Content-Type", "application/json")
	_, _ = io.Copy(w, reader)
}
