package task

import (
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/core/pkg/tasks"
)

func NewStaticConfigProvider(rp *RemoteProcessor) *StaticConfigProvider {
	return &StaticConfigProvider{
		rp: rp,
	}
}

func (p *StaticConfigProvider) GetConfigs() ([]*asynq.PeriodicTaskConfig, error) {
	indexAll, _ := tasks.NewTask(tasks.TypeIndexRemoteAll, &tasks.IndexRemoteAllPayload{})
	t := []*asynq.PeriodicTaskConfig{
		{
			// every hour
			Cronspec: "*/5 * * * *",
			Task:     indexAll,
		},
	}
	return t, nil
}
