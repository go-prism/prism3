package helmidx

import (
	"context"
	"fmt"
	"github.com/ghodss/yaml"
	"github.com/hibiken/asynq"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	helmrepo "helm.sh/helm/v3/pkg/repo"
	"io"
)

func NewHelmProcessor(repos *repo.Repos, store storage.Reader) *HelmProcessor {
	return &HelmProcessor{
		repos: repos,
		store: store,
	}
}

func (p *HelmProcessor) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload tasks.HelmRepositoryPayload
	err := tasks.Deserialise(t.Payload(), &payload)
	if err != nil {
		return err
	}
	r, err := p.repos.RemoteRepo.GetRemote(ctx, payload.RemoteID)
	if err != nil {
		return err
	}
	rem := remote.NewBackedRemote(r, p.store, p.repos.ArtifactRepo.CreateArtifact, p.repos.PyPackageRepo.GetPackage, p.repos.HelmPackageRepo.GetPackage)
	resp, err := rem.Download(ctx, "/index.yaml", &remote.RequestContext{})
	if err != nil {
		return err
	}
	data, err := io.ReadAll(resp)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to read response")
		return err
	}
	var index helmrepo.IndexFile
	if err := yaml.Unmarshal(data, &index); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to unmarshal index.yaml")
		return err
	}
	log.WithContext(ctx).Infof("parsed %d entries", len(index.Entries))
	// collect packages
	var packages []*schemas.HelmPackage
	for _, e := range index.Entries {
		for _, ee := range e {
			if len(ee.URLs) > 0 {
				packages = append(packages, &schemas.HelmPackage{
					Filename:    fmt.Sprintf("%s-%s.tgz", ee.Name, ee.Version),
					URL:         ee.URLs[0],
					Name:        ee.Name,
					Version:     ee.Version,
					Digest:      ee.Digest,
					Icon:        ee.Icon,
					APIVersion:  ee.APIVersion,
					AppVersion:  ee.AppVersion,
					KubeVersion: ee.KubeVersion,
					Type:        ee.Type,
					RemoteID:    r.ID,
				})
			}
		}
	}
	// batch-insert all packages
	_ = p.repos.HelmPackageRepo.BatchInsert(ctx, packages)
	return nil
}
