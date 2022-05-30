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
	"gitlab.com/go-prism/prism3/core/pkg/db"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"net/http"
	"path/filepath"
	"strings"
)

func (g *Gateway) ServeGo(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(r.Context(), "gateway_go")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithName("go")
	if g.goProxy == nil {
		log.V(1).Info("goproxy is disabled, skipping request")
		http.NotFound(w, r)
		return
	}
	metricCount.Add(ctx, 1, attribute.String("type", "go"))
	name := strings.TrimPrefix(r.URL.Path, "/api/go")
	r.URL.Path = name
	g.goProxy.ModifyResponse = func(response *http.Response) error {
		if response.StatusCode != http.StatusOK {
			return nil
		}
		n, v, ok := g.getMetadata(name)
		if !ok {
			return nil
		}
		log.V(1).Info("extracted Go metadata", "Name", n, "Version", v)
		go func() {
			metricCountResolved.Add(ctx, 1, attribute.String("type", "go"))
			_ = g.artifactRepo.CreateArtifact(context.TODO(), strings.TrimPrefix(name, "/"), db.GoRemote)
		}()
		return nil
	}
	g.goProxy.ServeHTTP(w, r.WithContext(ctx))
}

func (*Gateway) getMetadata(name string) (string, string, bool) {
	path, version, ok := strings.Cut(name, "/@v/")
	if ok && strings.HasPrefix(version, "v") {
		version = strings.TrimSuffix(version, filepath.Ext(version))
		return strings.TrimPrefix(path, "/"), version, true
	}
	return "", "", false
}
