package remote

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/errs"
	"io"
	"net/http"
	"time"
)

type EphemeralRemote struct {
	root   string
	client *http.Client
}

func NewEphemeralRemote(root string) *EphemeralRemote {
	return &EphemeralRemote{
		root:   root,
		client: http.DefaultClient,
	}
}

func (r *EphemeralRemote) Exists(ctx context.Context, path string) (string, error) {
	target := fmt.Sprintf("%s/%s", r.root, path)
	log.WithContext(ctx).WithFields(log.Fields{
		"path":   path,
		"target": target,
	}).Infof("probing remote")
	resp, err := r.Do(ctx, http.MethodHead, target)
	if err != nil {
		return "", err
	}
	_ = resp.Body.Close()
	// determine whether the request was a success
	// todo handle more than just '200 OK'
	if resp.StatusCode == http.StatusOK {
		return target, nil
	}
	return "", errs.ErrRequestFailed
}

func (r *EphemeralRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	target := fmt.Sprintf("%s/%s", r.root, path)
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
		return nil, err
	}
	start := time.Now()
	// execute the request
	resp, err := r.client.Do(req)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to execute request")
		return nil, err
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"code": resp.StatusCode,
		"dur":  time.Since(start),
	}).Infof("remote request completed")
	// todo handle more than just '200 OK'
	if resp.StatusCode != http.StatusOK {
		return nil, errs.ErrRequestFailed
	}
	return resp, nil
}
