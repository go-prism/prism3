package helmidx

import (
	"context"
	"github.com/ghodss/yaml"
	"github.com/hibiken/asynq"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/batch/internal/task"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	helmrepo "helm.sh/helm/v3/pkg/repo"
	"io"
)

const TypeHelmRepository = "index:helm:repository"

func NewIndexRepositoryTask(remote string) (*asynq.Task, error) {
	payload, err := task.Serialise(&HelmPayload{RemoteID: remote})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeHelmRepository, payload), nil
}

func NewHelmProcessor(repos *repo.Repos, store storage.Reader) *HelmProcessor {
	return &HelmProcessor{
		repos: repos,
		store: store,
	}
}

func (p *HelmProcessor) ProcessTask(ctx context.Context, t *asynq.Task) error {
	payload, err := task.Deserialise[HelmPayload](t.Payload())
	if err != nil {
		return err
	}
	r, err := p.repos.RemoteRepo.GetRemote(ctx, payload.RemoteID)
	if err != nil {
		return err
	}
	rem := remote.NewBackedRemote(r, p.store, p.repos.ArtifactRepo.CreateArtifact, p.repos.PyPackageRepo.GetPackage, p.repos.HelmPackageRepo.GetPackage)
	resp, err := rem.Download(ctx, "/index.yaml")
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
	return nil
}
