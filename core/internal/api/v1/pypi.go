/*
 *    Copyright 2023 Django Cass
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

func (g *Gateway) ServePyPi(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_pypi_serve")
	defer span.End()
	vars := mux.Vars(r)
	bucket, pkg := vars["bucket"], vars["package"]
	attributes := []attribute.KeyValue{
		attribute.String("bucket", bucket),
		attribute.String("package", pkg),
		attribute.String("type", "pypi"),
	}
	span.SetAttributes(attributes...)
	log := logr.FromContextOrDiscard(ctx).WithValues("Bucket", bucket, "Package", pkg)
	log.V(2).Info("serving on pypi gateway")
	req := g.pool.Get().(*resolver.Request)
	req.New(bucket, pkg, r.Method)
	defer g.pool.Put(req)

	// collect metrics
	metricCount.Add(ctx, 1, attributes...)

	// serve
	reader, err := g.resolver.ResolvePyPi(ctx, req, &schemas.RequestContext{})
	if err != nil {
		_ = problem.MustWrite(w, err)
		return
	}

	metricCountResolved.Add(ctx, 1, attributes...)

	// copy the response back
	w.Header().Set("Content-Type", "text/html")
	_, _ = io.Copy(w, reader)
}
