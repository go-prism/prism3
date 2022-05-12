package task

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
	"gitlab.com/go-prism/prism3/core/pkg/tracing"
	"go.opentelemetry.io/otel"
)

func NewRemoteProcessor(client *asynq.Client, repos *repo.Repos, helm *helmidx.HelmProcessor) *RemoteProcessor {
	return &RemoteProcessor{
		client: client,
		repos:  repos,
		helm:   helm,
	}
}

func (p *RemoteProcessor) HandleIndexAllTask(ctx context.Context, t *asynq.Task) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "task_remote_indexAll")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Type", t.Type())
	log.Info("handling task")
	var payload tasks.IndexRemoteAllPayload
	err := tasks.Deserialise(ctx, t.Payload(), &payload)
	if err != nil {
		return err
	}
	remotes, err := p.repos.RemoteRepo.ListRemotes(ctx, "")
	if err != nil {
		return err
	}
	for _, r := range remotes {
		ts, err := tasks.NewTask(ctx, tasks.TypeIndexRemote, &tasks.IndexRemotePayload{RemoteID: r.ID})
		if err != nil {
			continue
		}
		_, _ = p.client.Enqueue(ts)
	}
	return nil
}

func (p *RemoteProcessor) HandleIndexTask(ctx context.Context, t *asynq.Task) error {
	ctx, span := otel.Tracer(tracing.DefaultTracerName).Start(ctx, "task_remote_index")
	defer span.End()
	log := logr.FromContextOrDiscard(ctx).WithValues("Type", t.Type())
	log.Info("handling task")
	var payload tasks.IndexRemotePayload
	err := tasks.Deserialise(ctx, t.Payload(), &payload)
	if err != nil {
		return err
	}
	rem, err := p.repos.RemoteRepo.GetRemote(ctx, payload.RemoteID)
	if err != nil {
		return err
	}
	log = log.WithValues("Name", rem.Name, "Archetype", rem.Archetype)
	log.V(1).Info("loaded remote")
	var ts *asynq.Task
	switch rem.Archetype {
	case "HELM":
		ts, err = tasks.NewTask(ctx, tasks.TypeHelmRepository, &tasks.HelmRepositoryPayload{RemoteID: rem.ID})
	default:
		log.Info("unable to asynchronously index this archetype")
		return nil
	}
	if err != nil {
		return err
	}
	log.V(1).Info("enqueuing task")
	_, _ = p.client.Enqueue(ts)
	return nil
}
