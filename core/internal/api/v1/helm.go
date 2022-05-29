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
	"context"
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
)

func (g *Gateway) ServeHelm(ctx context.Context, r *resolver.Request) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "gateway_helm")
	defer span.End()
	return g.resolver.ResolveHelm(ctx, r, &schemas.RequestContext{})
}

func (g *Gateway) ServeHTTPHelm(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_helm_serve")
	defer span.End()
	bucket := mux.Vars(r)["bucket"]
	attributes := []attribute.KeyValue{
		attribute.String("bucket", bucket),
		attribute.String("url", r.URL.String()),
		attribute.String("type", "helm"),
	}
	span.SetAttributes(attributes...)
	log := logr.FromContextOrDiscard(ctx).WithValues("Bucket", bucket)
	log.V(2).Info("serving on helm gateway")
	path, ok := g.getPath(r.URL)
	if !ok {
		log.V(1).Info("failed to parse path", "Url", r.URL)
		_ = problem.MustWrite(w, problem.New(http.StatusBadRequest).Errorf("malformed path"))
		return
	}
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, path)
	defer g.pool.Put(req)

	// collect metrics
	metricCount.Add(ctx, 1, attributes...)

	// serve
	reader, err := g.ServeHelm(ctx, req)
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}

	metricCountResolved.Add(ctx, 1, attributes...)

	// copy the response back
	_, _ = io.Copy(w, reader)
}
