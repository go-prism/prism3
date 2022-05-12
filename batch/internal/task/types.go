package task

import (
	"context"
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
)

type StaticConfigProvider struct {
	rp  *RemoteProcessor
	ctx context.Context
}

type RemoteProcessor struct {
	client *asynq.Client
	repos  *repo.Repos
	helm   *helmidx.HelmProcessor
}
