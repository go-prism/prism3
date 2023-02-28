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

package resolver

import (
	"context"
	"github.com/bluele/gcache"
	"gitlab.com/go-prism/prism3/core/internal/impl/helmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/npmapi"
	"gitlab.com/go-prism/prism3/core/internal/impl/pypiapi"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
)

type Resolver struct {
	ctx   context.Context
	repos *repo.Repos

	// caches
	cache gcache.Cache

	store storage.Reader
	// providers
	helm *helmapi.Index
	npm  *npmapi.Provider
	pypi *pypiapi.Provider
}

type IResolver interface {
	Resolve(ctx context.Context, req *Request, rctx *schemas.RequestContext) (io.Reader, error)
	ResolveHelm(ctx context.Context, req *Request, rctx *schemas.RequestContext) (io.Reader, error)
	ResolveNPM(ctx context.Context, req *NPMRequest, rctx *schemas.RequestContext) (io.Reader, error)
	ResolvePyPi(ctx context.Context, req *Request, rctx *schemas.RequestContext) (io.Reader, error)
}

type Request struct {
	bucket string
	path   string
	method string
}

type NPMRequest struct {
	bucket  string
	pkg     string
	version string
}
