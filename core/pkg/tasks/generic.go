package tasks

import (
	"github.com/hibiken/asynq"
	log "github.com/sirupsen/logrus"
)

func NewTask[T any](typename string, t *T) (*asynq.Task, error) {
	log.WithField("type", typename).Debug("creating new batch task")
	payload, err := Serialise(t)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(typename, payload), nil
}
