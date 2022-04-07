package task

import (
	"github.com/hibiken/asynq"
	"gitlab.com/go-prism/prism3/batch/internal/task/helmidx"
	"gitlab.com/go-prism/prism3/core/pkg/db/repo"
)

type StaticConfigProvider struct {
	rp *RemoteProcessor
}

type RemoteProcessor struct {
	client *asynq.Client
	repos  *repo.Repos
	helm   *helmidx.HelmProcessor
}
