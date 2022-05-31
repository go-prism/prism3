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

package refract

import (
	"context"
	"gitlab.com/go-prism/prism3/core/internal/graph/model"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/quota"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
)

type BackedRefraction struct {
	mod *model.Refraction
	rf  *Refraction
}

func NewBackedRefraction(ctx context.Context, mod *model.Refraction, store storage.Reader, netObserver quota.Observer, onCreate repo.CreateArtifactFunc, getPyPi, getHelm repo.GetPackageFunc) *BackedRefraction {
	remotes := make([]remote.Remote, len(mod.Remotes))
	for i := range mod.Remotes {
		remotes[i] = remote.NewBackedRemote(ctx, mod.Remotes[i], store, netObserver, onCreate, getPyPi, getHelm)
	}
	return &BackedRefraction{
		mod: mod,
		rf:  NewSimple(ctx, mod.Name, remotes),
	}
}

func (b *BackedRefraction) Exists(ctx context.Context, path string, rctx *schemas.RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_backed_exists")
	defer span.End()
	msg, err := b.rf.Exists(ctx, path, rctx)
	if err != nil {
		return "", err
	}
	return msg.URI, nil
}

func (b *BackedRefraction) Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_backed_download")
	defer span.End()
	return b.rf.Download(ctx, path, rctx)
}

func (b *BackedRefraction) Refraction() *Refraction {
	return b.rf
}

func (b *BackedRefraction) Model() *model.Refraction {
	return b.mod
}
