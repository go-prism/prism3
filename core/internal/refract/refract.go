package refract

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"io"
	"sync"
	"time"
)

func NewSimple(name string, remotes []remote.Remote) *Refraction {
	return &Refraction{
		name:    name,
		remotes: remotes,
		rp: &sync.Pool{
			New: func() interface{} {
				return remote.NewEphemeralRemote("")
			},
		},
	}
}

func (r *Refraction) String() string {
	return r.name
}

func (r *Refraction) Exists(ctx context.Context, path string) (*Message, error) {
	ch := make(chan Message, 1)
	// create a goroutine for each remote
	log.WithContext(ctx).WithFields(log.Fields{
		"path": path,
	}).Infof("probing %d remotes", len(r.remotes))
	// create a new context that we use for all
	// requests, so we can cancel the old ones
	reqCtx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()
	for i := range r.remotes {
		rem := r.remotes[i]
		go func() {
			ok, _ := rem.Exists(reqCtx, path)
			ch <- Message{
				URI:    ok,
				Remote: rem,
			}
		}()
	}
	// wait for the first response or for
	// the context to expire
	select {
	case val := <-ch:
		log.WithContext(ctx).Infof("received final response: %s from remote", val.URI)
		return &val, nil
	case _ = <-ctx.Done():
		return nil, ctx.Err()
	}
}

func (r *Refraction) Download(ctx context.Context, path string) (io.Reader, error) {
	// find the best location for the file
	msg, err := r.Exists(ctx, path)
	if err != nil {
		return nil, err
	}
	resp, err := msg.Remote.Download(ctx, msg.URI)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
