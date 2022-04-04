package task

import (
	"encoding/json"
	log "github.com/sirupsen/logrus"
)

func Serialise[T any](payload *T) ([]byte, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		log.WithError(err).Errorf("failed to serialise payload of type: %T", payload)
		return nil, err
	}
	return data, nil
}

func Deserialise[T any](data []byte) (*T, error) {
	var p T
	if err := json.Unmarshal(data, &p); err != nil {
		log.WithError(err).Errorf("failed to deserialise payload of type: %T", p)
		return nil, err
	}
	return &p, nil
}
