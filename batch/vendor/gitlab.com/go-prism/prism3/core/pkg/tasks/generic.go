package tasks

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/hibiken/asynq"
)

func NewTask[T any](ctx context.Context, typename string, t *T) (*asynq.Task, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Type", typename)
	log.V(1).Info("creating new batch task")
	log.V(3).Info("serialising task", "Task", t)
	payload, err := Serialise(ctx, t)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(typename, payload), nil
}
