package remote

import (
	"context"
	"errors"
	"fmt"
	"github.com/djcass44/go-utils/utilities/httputils"
	"github.com/go-logr/logr"
	"github.com/jellydator/ttlcache/v3"
	"github.com/lpar/problem"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"io"
	"net/http"
	"strings"
	"time"
)

type EphemeralRemote struct {
	root   string
	client *http.Client
	cache  *ttlcache.Cache[string, string]
}

func NewEphemeralRemote(ctx context.Context, root string, client *http.Client) *EphemeralRemote {
	log := logr.FromContextOrDiscard(ctx)
	c := client
	// use the default client if we're not given one
	if client == nil {
		log.Info("received nil client - using default")
		c = http.DefaultClient
	}
	return &EphemeralRemote{
		root:   root,
		client: c,
		cache:  ttlcache.New[string, string](ttlcache.WithCapacity[string, string](1000)),
	}
}

func (r *EphemeralRemote) String() string {
	return r.root
}

func (r *EphemeralRemote) Exists(ctx context.Context, path string, rctx *RequestContext) (string, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_ephemeral_exists")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
	log.V(2).Info("using request context", "RequestContext", rctx)
	// check the cache
	cacheKey := path
	if rctx != nil {
		cacheKey += rctx.Token
	}
	res := r.cache.Get(cacheKey)
	if res != nil {
		log.Info("located cached result")
		return res.Value(), nil
	}

	target := fmt.Sprintf("%s/%s", r.root, path)
	log = log.WithValues("Target", target)
	log.Info("probing remote")
	_, err := r.Do(ctx, http.MethodHead, target, rctx)
	if err != nil {
		return "", err
	}
	// save to the cache
	_ = r.cache.Set(cacheKey, target, ttlcache.DefaultTTL)
	return target, nil
}

func (r *EphemeralRemote) Download(ctx context.Context, path string, rctx *RequestContext) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_ephemeral_download")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
	log.V(2).Info("using request context", "RequestContext", rctx)
	target := path
	if !strings.HasPrefix(path, "https://") {
		target = fmt.Sprintf("%s/%s", r.root, strings.TrimPrefix(path, "/"))
	}
	log = log.WithValues("Target", target)
	log.Info("downloading from remote")
	resp, err := r.Do(ctx, http.MethodGet, target, rctx)
	if err != nil {
		return nil, err
	}
	return resp.Body, nil
}

func (r *EphemeralRemote) Do(ctx context.Context, method, target string, rctx *RequestContext) (*http.Response, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "remote_ephemeral_do")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Path")
	log.V(2).Info("using request context", "RequestContext", rctx)
	req, err := http.NewRequestWithContext(ctx, method, target, nil)
	if err != nil {
		log.Error(err, "failed to prepare request")
		return nil, problem.New(http.StatusBadRequest).Errorf("remote request cannot be created")
	}
	// apply authentication
	if rctx != nil {
		httpclient.ApplyAuth(ctx, req, rctx.AuthOpts)
	}

	// start the clock
	start := time.Now()
	// execute the request
	resp, err := r.client.Do(req)
	if err != nil {
		// swallow the context-cancelled error
		// since it will happen a lot
		if errors.Is(err, context.Canceled) {
			log.V(1).Error(err, "cancelling request")
			return nil, err
		}
		log.Error(err, "failed to execute request")
		return nil, err
	}
	log = log.WithValues("Code", resp.StatusCode, "Duration", time.Since(start), "Method", method)
	log.Info("remote request completed")
	if !httputils.IsHTTPSuccess(resp.StatusCode) {
		if resp.StatusCode == http.StatusUnauthorized {
			log.V(1).Info("received 401, dumping challenge header", "WWW=Authenticate", resp.Header.Get("WWW-Authenticate"))
		}
		log.Info("marking request as failure due to unexpected response code")
		return nil, problem.New(resp.StatusCode).Errorf("failed to retrieve object from remote")
	}
	return resp, nil
}
