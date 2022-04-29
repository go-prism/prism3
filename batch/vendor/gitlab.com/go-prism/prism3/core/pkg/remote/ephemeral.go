package remote

import (
	"context"
	"errors"
	"fmt"
	"github.com/djcass44/go-utils/pkg/httputils"
	"github.com/jellydator/ttlcache/v3"
	"github.com/lpar/problem"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/httpclient"
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

func NewEphemeralRemote(root string, client *http.Client) *EphemeralRemote {
	c := client
	// use the default client if we're not given one
	if client == nil {
		log.Warning("received nil client - using default")
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
	// check the cache
	cacheKey := path
	if rctx != nil {
		cacheKey += rctx.Token
	}
	res := r.cache.Get(cacheKey)
	if res != nil {
		log.WithContext(ctx).WithFields(log.Fields{
			"path": path,
		}).Info("located cached result")
		return res.Value(), nil
	}

	target := fmt.Sprintf("%s/%s", r.root, path)
	log.WithContext(ctx).WithFields(log.Fields{
		"path":   path,
		"target": target,
	}).Infof("probing remote")
	_, err := r.Do(ctx, http.MethodHead, target, rctx)
	if err != nil {
		return "", err
	}
	// save to the cache
	_ = r.cache.Set(cacheKey, target, ttlcache.DefaultTTL)
	return target, nil
}

func (r *EphemeralRemote) Download(ctx context.Context, path string, rctx *RequestContext) (io.Reader, error) {
	target := path
	if !strings.HasPrefix(path, "https://") {
		target = fmt.Sprintf("%s/%s", r.root, strings.TrimPrefix(path, "/"))
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"path":   path,
		"target": target,
	}).Infof("downloading from remote")
	resp, err := r.Do(ctx, http.MethodGet, target, rctx)
	if err != nil {
		return nil, err
	}
	return resp.Body, nil
}

func (r *EphemeralRemote) Do(ctx context.Context, method, target string, rctx *RequestContext) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, target, nil)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to prepare request")
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
			log.WithContext(ctx).Info("cancelling request")
			return nil, err
		}
		log.WithContext(ctx).WithError(err).Error("failed to execute request")
		return nil, err
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"code":   resp.StatusCode,
		"dur":    time.Since(start),
		"method": method,
	}).Infof("remote request completed")
	if !httputils.IsHTTPSuccess(resp.StatusCode) {
		if resp.StatusCode == http.StatusUnauthorized {
			log.WithContext(ctx).Debugf("received 401, dumping challenge header: '%s'", resp.Header.Get("WWW-Authenticate"))
		}
		log.WithContext(ctx).WithField("code", resp.StatusCode).Info("marking request as failure due to unexpected response code")
		return nil, problem.New(resp.StatusCode).Errorf("failed to retrieve object from remote")
	}
	return resp, nil
}
