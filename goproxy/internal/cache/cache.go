package cache

import (
	"context"
	"github.com/goproxy/goproxy"
	log "github.com/sirupsen/logrus"
	"io"
)

type Cacher struct {
	goproxy.DirCacher
}

func (c *Cacher) Get(ctx context.Context, name string) (io.ReadCloser, error) {
	log.WithContext(ctx).Infof("cacher get: %s", name)
	return c.DirCacher.Get(ctx, name)
}

func (c *Cacher) Set(ctx context.Context, name string, content io.ReadSeeker) error {
	log.WithContext(ctx).Infof("cacher set: %s", name)
	return c.DirCacher.Set(ctx, name, content)
}
