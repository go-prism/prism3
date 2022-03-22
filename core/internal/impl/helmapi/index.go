package helmapi

import (
	"bytes"
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"helm.sh/helm/v3/pkg/repo"
	"io"
	"io/ioutil"
	"sigs.k8s.io/yaml"
	"sync"
)

type Index struct {
	publicURL string
}

func NewIndex(publicURL string) *Index {
	return &Index{
		publicURL: publicURL,
	}
}

func (svc *Index) Serve(ctx context.Context, ref *refract.Refraction) (io.Reader, error) {
	remotes := ref.Remotes()
	index := repo.NewIndexFile()
	indices := make([]*repo.IndexFile, len(remotes))

	wg := sync.WaitGroup{}
	wg.Add(len(remotes))
	log.WithContext(ctx).Infof("downloading %d helm indices from refraction '%s'", len(remotes), ref)
	for i := range remotes {
		j := i
		// download and parse the index
		// async
		go func() {
			defer wg.Done()
			resp, err := remotes[j].Download(ctx, "/index.yaml")
			if err != nil {
				return
			}
			idx, err := svc.parse(ctx, ref.String(), resp)
			if err != nil {
				return
			}
			indices[j] = idx
		}()
	}
	// wait for all responses
	wg.Wait()
	for _, i := range indices {
		// ignore nil in case we weren't
		// able to fetch the index.yaml
		if i == nil {
			continue
		}
		index.Merge(i)
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
func (svc *Index) parse(ctx context.Context, ref string, r io.Reader) (*repo.IndexFile, error) {
	data, err := ioutil.ReadAll(r)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to read response")
		return nil, err
	}
	var resp repo.IndexFile
	if err := yaml.Unmarshal(data, &resp); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to unmarshal index.yaml")
		return nil, err
	}
	log.WithContext(ctx).Infof("parsed %d entries", len(resp.Entries))
	for _, e := range resp.Entries {
		for _, ee := range e {
			svc.rewriteURLs(ctx, ref, ee)
		}
	}
	return &resp, nil
}

func (svc *Index) rewriteURLs(_ context.Context, ref string, e *repo.ChartVersion) {
	for i := range e.URLs {
		e.URLs[i] = fmt.Sprintf("%s/api/v1/%s/-/%s-%s.tgz", svc.publicURL, ref, e.Metadata.Name, e.Metadata.Version)
	}
}
