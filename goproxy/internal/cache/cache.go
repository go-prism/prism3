package cache

import (
	"context"
	"errors"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
)

const RemoteName = "go"

type Cacher struct {
	store storage.Reader
}

func NewCacher(store storage.Reader) *Cacher {
	return &Cacher{
		store: store,
	}
}

func (c *Cacher) Get(ctx context.Context, name string) (io.ReadCloser, error) {
	log.WithContext(ctx).Infof("cacher get: %s", name)
	r, err := c.store.Get(ctx, filepath.Join(RemoteName, name))
	if err != nil {
		var e *types.NoSuchKey
		if errors.As(err, &e) {
			log.WithContext(ctx).Debugf("received NoSuchKey from s3: %s", e.ErrorMessage())
			return nil, os.ErrNotExist
		}
		return nil, err
	}
	return ioutil.NopCloser(r), nil
}

func (c *Cacher) Set(ctx context.Context, name string, content io.ReadSeeker) error {
	log.WithContext(ctx).Infof("cacher set: %s", name)
	return c.store.Put(ctx, filepath.Join(RemoteName, name), content)
}
