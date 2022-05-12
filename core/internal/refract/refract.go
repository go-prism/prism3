package refract

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
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

func (r *Refraction) Exists(ctx context.Context, path string, rctx *remote.RequestContext) (*Message, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_exists")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
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
			uri, _ := rem.Exists(reqCtx, path, rctx)
			ch <- Message{
				URI:    uri,
				Remote: rem,
			}
		}()
	}
	// wait for the first response or for
	// the context to expire
	count := 0
	for count < len(r.remotes) {
		select {
		case val := <-ch:
			if val.URI != "" {
				log.Info("received final response from remote", "Url", val.URI)
				return &val, nil
			}
		case _ = <-ctx.Done():
			log.V(1).Info("context was cancelled while waiting for a remote to respond")
			return nil, ctx.Err()
		}
		count++
	}
	return nil, ErrNotFound
}

func (r *Refraction) Download(ctx context.Context, path string, rctx *remote.RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "refraction_download")
	defer span.End()
	// find the best location for the file
	msg, err := r.Exists(ctx, path, rctx)
	if err != nil {
		return nil, err
	}
	resp, err := msg.Remote.Download(ctx, msg.URI, rctx)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
