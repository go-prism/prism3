package helmapi

import (
	"bytes"
	"context"
	"fmt"
	"github.com/ghodss/yaml"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/db/repo"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/internal/schemas"
	helmrepo "helm.sh/helm/v3/pkg/repo"
	"io"
	"io/ioutil"
	"sync"
)

func NewIndex(repos *repo.Repos, publicURL string) *Index {
	return &Index{
		repos:     repos,
		publicURL: publicURL,
	}
}

func (svc *Index) Serve(ctx context.Context, ref *refract.Refraction) (io.Reader, error) {
	remotes := ref.Remotes()
	index := helmrepo.NewIndexFile()
	indices := make([]*helmrepo.IndexFile, len(remotes))

	wg := sync.WaitGroup{}
	log.WithContext(ctx).Infof("downloading %d helm indices from refraction '%s'", len(remotes), ref)
	for i := range remotes {
		wg.Add(1)
		j := i
		// download and parse the index
		// async
		go func() {
			defer wg.Done()
			resp, err := remotes[j].Download(ctx, "/index.yaml")
			if err != nil {
				return
			}
			idx, packages, err := svc.parse(ctx, ref.String(), resp)
			if err != nil {
				return
			}
			indices[j] = idx
			if svc.repos != nil {
				_ = svc.repos.HelmPackageRepo.BatchInsert(ctx, packages)
			}
		}()
	}
	// wait for all responses
	wg.Wait()
	merged := 0
	for _, i := range indices {
		// ignore nil in case we weren't
		// able to fetch the index.yaml
		if i == nil {
			continue
		}
		merged++
		index.Merge(i)
	}
	if merged == 0 {
		return nil, ErrNoIndexFound
	}
	data, err := yaml.Marshal(index)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to convert index to yaml")
		return nil, err
	}
	return bytes.NewReader(data), nil
}

// parse converts raw yaml into
// a Helm repo.IndexFile
func (svc *Index) parse(ctx context.Context, ref string, r io.Reader) (*helmrepo.IndexFile, []*schemas.HelmPackage, error) {
	log.WithContext(ctx).Debug("reading response body")
	data, err := ioutil.ReadAll(r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to read response")
		return nil, nil, err
	}
	log.WithContext(ctx).Debug("parsing yaml response")
	// todo find a way to reduce memory usage when parsing helm index.yaml files
	// this will require instances to run with increased memory requirements (200+ MiB)
	var resp helmrepo.IndexFile
	if err := yaml.Unmarshal(data, &resp); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to unmarshal index.yaml")
		return nil, nil, err
	}
	log.WithContext(ctx).Infof("parsed %d entries", len(resp.Entries))
	var packages []*schemas.HelmPackage
	for _, e := range resp.Entries {
		for _, ee := range e {
			if len(ee.URLs) > 0 {
				packages = append(packages, &schemas.HelmPackage{
					Filename: fmt.Sprintf("%s-%s.tgz", ee.Metadata.Name, ee.Metadata.Version),
					URL:      ee.URLs[0],
				})
			}
			svc.rewriteURLs(ctx, ref, ee)
		}
	}
	return &resp, packages, nil
}

// rewriteURLs converts all the URLs in a Helm repository
// to point to Prism rather than their original source.
func (svc *Index) rewriteURLs(_ context.Context, ref string, e *helmrepo.ChartVersion) {
	for i := range e.URLs {
		e.URLs[i] = fmt.Sprintf("%s/api/v1/%s/-/%s-%s.tgz", svc.publicURL, ref, e.Metadata.Name, e.Metadata.Version)
	}
}
