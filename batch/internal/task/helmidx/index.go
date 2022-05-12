package helmidx

import (
	"context"
	"fmt"
	"github.com/ghodss/yaml"
	"github.com/go-logr/logr"
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/remote"
	"gitlab.com/go-prism/prism3/core/pkg/schemas"
	"gitlab.com/go-prism/prism3/core/pkg/storage"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
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
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "task_helm_process")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Type", t.Type())
	log.Info("handling task")
	var payload tasks.HelmRepositoryPayload
	err := tasks.Deserialise(ctx, t.Payload(), &payload)
	if err != nil {
		return err
	}
	r, err := p.repos.RemoteRepo.GetRemote(ctx, payload.RemoteID)
	if err != nil {
		return err
	}
	rem := remote.NewBackedRemote(ctx, r, p.store, p.repos.ArtifactRepo.CreateArtifact, p.repos.PyPackageRepo.GetPackage, p.repos.HelmPackageRepo.GetPackage)
	resp, err := rem.Download(ctx, "/index.yaml", &remote.RequestContext{})
	if err != nil {
		return err
	}
	data, err := io.ReadAll(resp)
	if err != nil {
		log.Error(err, "failed to read response")
		return err
	}
	var index helmrepo.IndexFile
	if err := yaml.Unmarshal(data, &index); err != nil {
		log.Error(err, "failed to unmarshal index.yaml")
		return err
	}
	log.Info("parsed entries", "Count", len(index.Entries))
	// collect packages
	var packages []*schemas.HelmPackage
	for _, e := range index.Entries {
		for _, ee := range e {
			log.V(2).Info("located entry", "Name", ee.Name, "Version", ee.Version)
			if len(ee.URLs) > 0 {
				log.V(2).Info("located package", "Name", ee.Name, "Version", ee.Version, "Url", ee.URLs[0])
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
