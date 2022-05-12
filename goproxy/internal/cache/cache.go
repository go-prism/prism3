package cache

import (
	"context"
	"errors"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
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
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "cacher_get", trace.WithAttributes(
		attribute.String("name", name),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", name)
	log.Info("checking for cached file")
	r, err := c.store.Get(ctx, filepath.Join(RemoteName, name))
	if err != nil {
		log.V(2).Error(err, "received error from object storage")
		var e *types.NoSuchKey
		if errors.As(err, &e) {
			span.SetAttributes(attribute.Bool("cached", false))
			log.V(1).Info("received NoSuchKey from object storage", "Message", e.ErrorMessage(), "Code", e.ErrorCode())
			return nil, os.ErrNotExist
		}
		return nil, err
	}
	log.V(1).Info("successfully retrieved cached file from object storage")
	span.SetAttributes(attribute.Bool("cached", true))
	return ioutil.NopCloser(r), nil
}

func (c *Cacher) Set(ctx context.Context, name string, content io.ReadSeeker) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "cacher_set", trace.WithAttributes(
		attribute.String("name", name),
	))
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path", name)
	log.Info("uploading cached file")
	return c.store.Put(ctx, filepath.Join(RemoteName, name), content)
}
