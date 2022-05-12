package task

import (
	"context"
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
)

func NewStaticConfigProvider(ctx context.Context, rp *RemoteProcessor) *StaticConfigProvider {
	return &StaticConfigProvider{
		rp:  rp,
		ctx: ctx,
	}
}

func (p *StaticConfigProvider) GetConfigs() ([]*asynq.PeriodicTaskConfig, error) {
	indexAll, _ := tasks.NewTask(p.ctx, tasks.TypeIndexRemoteAll, &tasks.IndexRemoteAllPayload{})
	t := []*asynq.PeriodicTaskConfig{
		{
			// every hour
			Cronspec: "*/5 * * * *",
			Task:     indexAll,
		},
	}
	return t, nil
}
