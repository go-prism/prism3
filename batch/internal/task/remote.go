package task

import (
	"context"
	"github.com/hibiken/asynq"
	log "github.com/sirupsen/logrus"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
)

func NewRemoteProcessor(client *asynq.Client, repos *repo.Repos, helm *helmidx.HelmProcessor) *RemoteProcessor {
	return &RemoteProcessor{
		client: client,
		repos:  repos,
		helm:   helm,
	}
}

func (p *RemoteProcessor) HandleIndexAllTask(ctx context.Context, t *asynq.Task) error {
	var payload tasks.IndexRemoteAllPayload
	err := tasks.Deserialise(t.Payload(), &payload)
	if err != nil {
		return err
	}
	remotes, err := p.repos.RemoteRepo.ListRemotes(ctx, "")
	if err != nil {
		return err
	}
	for _, r := range remotes {
		ts, err := tasks.NewTask(tasks.TypeIndexRemote, &tasks.IndexRemotePayload{RemoteID: r.ID})
		if err != nil {
			continue
		}
		_, _ = p.client.Enqueue(ts)
	}
	return nil
}

func (p *RemoteProcessor) HandleIndexTask(ctx context.Context, t *asynq.Task) error {
	var payload tasks.IndexRemotePayload
	err := tasks.Deserialise(t.Payload(), &payload)
	if err != nil {
		return err
	}
	rem, err := p.repos.RemoteRepo.GetRemote(ctx, payload.RemoteID)
	if err != nil {
		return err
	}
	var ts *asynq.Task
	switch rem.Archetype {
	case "HELM":
		ts, err = tasks.NewTask(tasks.TypeHelmRepository, &tasks.HelmRepositoryPayload{RemoteID: rem.ID})
	default:
		log.WithContext(ctx).WithFields(log.Fields{
			"archetype": rem.Archetype,
		}).Warning("unable to asynchronously index this archetype")
		return nil
	}
	if err != nil {
		return err
	}
	_, _ = p.client.Enqueue(ts)
	return nil
}
