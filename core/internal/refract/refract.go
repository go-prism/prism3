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
	"errors"
	"github.com/go-logr/logr"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"net/http"
	"sync"
	"time"
)

func NewSimple(ctx context.Context, name string, remotes []remote.Remote) *Refraction {
	return &Refraction{
		name:    name,
		remotes: remotes,
		rp: &sync.Pool{
			New: func() any {
				return remote.NewEphemeralRemote(ctx, "", nil)
			},
		},
	}
}

func (r *Refraction) String() string {
	return r.name
}

func (r *Refraction) Remotes() []remote.Remote {
	return r.remotes
}

func (r *Refraction) Exists(ctx context.Context, path string, rctx *schemas.RequestContext) (*Message, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_exists")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", path)
	log.V(2).Info("using request context", "RequestContext", rctx)
	ch := make(chan Message, 1)
	// create a goroutine for each remote
	log.Info("probing remotes", "Count", len(r.remotes))
	// create a new context that we use for all
	// requests, so we can cancel the old ones
	// todo cancel contexts more aggressively
	reqCtx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()
	for i := range r.remotes {
		rem := r.remotes[i]
		go func() {
			// make sure to clone the request context
			// otherwise remotes will overwrite each other
			uri, err := rem.Exists(reqCtx, path, rctx.Clone())
			ch <- Message{
				URI:    uri,
				Remote: rem,
				Err:    err,
			}
		}()
	}
	// wait for the first response or for
	// the context to expire
	var bestStatus int
	count := 0
	for count < len(r.remotes) {
		select {
		case val := <-ch:
			if val.URI != "" {
				log.Info("received final response from remote", "Url", val.URI)
				return &val, nil
			}
			// handle the error
			if val.Err != nil {
				var httpErr problem.HTTPError
				if errors.As(val.Err, &httpErr) {
					log.V(6).Info("parsed remote error", "Status", httpErr.GetStatus())
					// prefer to return a client error
					// rather than a server error
					if (bestStatus == 0 || bestStatus == 404) || (httpErr.GetStatus() < 499 && httpErr.GetStatus() != http.StatusNotFound) {
						bestStatus = httpErr.GetStatus()
					}
				}
			}
		case _ = <-ctx.Done():
			log.V(1).Info("context was cancelled while waiting for a remote to respond")
			return nil, ctx.Err()
		}
		count++
	}
	// return a 404
	if bestStatus == 0 {
		return nil, problem.Errorf(http.StatusNotFound, ErrNotFound.Error())
	}
	log.V(4).Info("unable to locate resource - using most informative response code", "Status", bestStatus)
	return nil, problem.New(bestStatus)
}

func (r *Refraction) Download(ctx context.Context, path string, rctx *schemas.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_download")
	defer span.End()
	// find the best location for the file
	msg, err := r.Exists(ctx, path, rctx)
	if err != nil {
		return nil, err
	}
	// make sure to clone the request context
	// otherwise remotes will overwrite each other
	resp, err := msg.Remote.Download(ctx, msg.URI, rctx.Clone())
	if err != nil {
		return nil, err
	}
	return resp, nil
}
