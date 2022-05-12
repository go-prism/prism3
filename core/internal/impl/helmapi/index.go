package helmapi

import (
	"bytes"
	"context"
	"fmt"
	jsonyaml "github.com/ghodss/yaml"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/prism3/core/internal/refract"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"helm.sh/helm/v3/pkg/chart"
	helmrepo "helm.sh/helm/v3/pkg/repo"
	"io"
)

func NewIndex(repos *repo.Repos, publicURL string) *Index {
	return &Index{
		repos:     repos,
		publicURL: publicURL,
	}
}

func (svc *Index) Serve(ctx context.Context, ref *refract.BackedRefraction) (io.Reader, error) {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "api_helm_serve")
	defer span.End()
	index := helmrepo.NewIndexFile()
	refraction := ref.Model()
	remotes := refraction.Remotes
	log := logr.FromContextOrDiscard(ctx).WithName("helm").WithValues("Name", refraction.Name)

	span.SetAttributes(attribute.String("refraction", refraction.Name))

	remoteID := make([]string, len(remotes))
	for i := range remoteID {
		remoteID[i] = remotes[i].ID
	}

	log.Info("downloading helm indices from refraction", "Count", len(remotes))
	packages, err := svc.repos.HelmPackageRepo.GetPackagesInRemotes(ctx, remoteID)
	if err != nil {
		return nil, err
	}
	log.Info("collected helm packages", "Count", len(packages))
	for _, p := range packages {
		if err := index.MustAdd(&chart.Metadata{
			Name:        p.Name,
			Version:     p.Version,
			Icon:        p.Icon,
			APIVersion:  p.APIVersion,
			AppVersion:  p.AppVersion,
			KubeVersion: p.KubeVersion,
			Type:        p.Type,
		}, p.Filename, fmt.Sprintf("%s/api/v1/%s/-/", svc.publicURL, refraction.Name), p.Digest); err != nil {
			log.Error(err, "failed to add chart")
			continue
		}
	}
	data, err := jsonyaml.Marshal(index)
	if err != nil {
		log.Error(err, "failed to convert index to yaml")
		return nil, err
	}
	return bytes.NewReader(data), nil
}
