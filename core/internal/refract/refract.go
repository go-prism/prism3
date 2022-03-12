package refract

import (
	"context"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/remote"
	"io"
	"net/http"
	"sync"
)

func NewSimple(remotes []remote.Remote) *Refraction {
	return &Refraction{
		remotes: remotes,
		rp: sync.Pool{
			New: func() interface{} {
				return remote.NewEphemeralRemote("")
			},
		},
	}
}

func (r *Refraction) Exists(ctx context.Context, path string) (string, error) {
	ch := make(chan string, 1)
	defer close(ch)
	// create a goroutine for each remote
	log.WithContext(ctx).WithFields(log.Fields{
		"path": path,
	}).Infof("probing %d remotes", len(r.remotes))
	for i := range r.remotes {
		rem := r.remotes[i]
		go func() {
			ok, _ := rem.Exists(ctx, path)
			ch <- ok
		}()
	}
	// wait for the first response or for
	// the context to expire
	select {
	case ok := <-ch:
		return ok, nil
	case _ = <-ctx.Done():
		return "", ctx.Err()
	}
}

func (r *Refraction) Download(ctx context.Context, path string) (io.Reader, error) {
	// find the best location for the file
	uri, err := r.Exists(ctx, path)
	if err != nil {
		return nil, err
	}
	// get an ephemeral remote we can use
	pool := r.rp.Get().(*remote.EphemeralRemote)
	defer r.rp.Put(pool)
	// download the file
	resp, err := pool.Do(ctx, http.MethodGet, uri)
	if err != nil {
		return nil, err
	}
	return resp.Body, nil
}
