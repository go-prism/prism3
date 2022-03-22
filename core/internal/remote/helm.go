package remote

import (
	"context"
	"errors"
	log "github.com/sirupsen/logrus"
	"helm.sh/helm/v3/pkg/getter"
	"helm.sh/helm/v3/pkg/repo"
	"io"
	"path/filepath"
	"strings"
)

var ErrUnknownHelmFormat = errors.New("failed to parse helm path into something we can fetch")

type HelmRemote struct {
	root string
	rem  *EphemeralRemote
}

func NewHelmRemote(root string) *HelmRemote {
	return &HelmRemote{
		root: root,
		rem:  NewEphemeralRemote(root),
	}
}

func (h *HelmRemote) Exists(ctx context.Context, path string) (string, error) {
	bits := strings.Split(path, "-")
	if len(bits) == 0 {
		return "", ErrUnknownHelmFormat
	}
	chart := strings.Join(bits[:len(bits)-1], "-")
	ext := filepath.Ext(path)
	version := strings.TrimSuffix(bits[len(bits)-1], ext)
	log.WithContext(ctx).WithFields(log.Fields{
		"chart":   chart,
		"version": version,
	}).Info("checking for chart")
	resp, err := repo.FindChartInRepoURL(h.root, chart, version, "", "", "", getter.Providers{
		getter.Provider{
			// only allow HTTPS
			Schemes: []string{"https"},
			New:     getter.NewHTTPGetter,
		},
	})
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to lookup chart")
		return "", err
	}
	log.WithContext(ctx).WithFields(log.Fields{
		"chart":   chart,
		"version": version,
		"url":     resp,
	}).Info("successfully located chart")
	return resp, nil
}

func (h *HelmRemote) Download(ctx context.Context, path string) (io.Reader, error) {
	return h.rem.Download(ctx, path)
}

func (h *HelmRemote) String() string {
	return h.root
}
