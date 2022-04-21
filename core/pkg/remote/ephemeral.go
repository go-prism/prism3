package remote

import (
	"context"
	"errors"
	"fmt"
	"github.com/djcass44/go-utils/pkg/httputils"
	"github.com/jellydator/ttlcache/v3"
	"github.com/lpar/problem"
	log "github.com/sirupsen/logrus"
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

func (r *EphemeralRemote) Exists(ctx context.Context, path string) (string, error) {
	// check the cache
	res := r.cache.Get(path)
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
	_, err := r.Do(ctx, http.MethodHead, target)
	if err != nil {
		return "", err
	}
	// save to the cache
	_ = r.cache.Set(path, target, ttlcache.DefaultTTL)
	return target, nil
}

func (r *EphemeralRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	target := path
	if !strings.HasPrefix(path, "https://") {
		target = fmt.Sprintf("%s/%s", r.root, strings.TrimPrefix(path, "/"))
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"path":   path,
		"target": target,
	}).Infof("downloading from remote")
	resp, err := r.Do(ctx, http.MethodGet, target)
	if err != nil {
		return nil, err
	}
	return resp.Body, nil
}

func (r *EphemeralRemote) Do(ctx context.Context, method, target string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, target, nil)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to prepare request")
		return nil, problem.New(http.StatusBadRequest).Errorf("remote request cannot be created")
	}
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
		return nil, problem.New(resp.StatusCode).Errorf("failed to retrieve object from remote")
	}
	return resp, nil
}
